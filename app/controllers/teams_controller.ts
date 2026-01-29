import type { HttpContext } from '@adonisjs/core/http'
import Team from '#models/team'
import TeamInvitation from '#models/team_invitation'
import TeamMember from '#models/team_member'
import User from '#models/user'
import { getPageAccessForUser } from '#services/page_access_service'
import { createTeamValidator, updateMemberValidator } from '#validators/team'

export default class TeamsController {
  async index({ auth, response, request, now }: HttpContext) {
    const user = auth.getUserOrFail()
    const freshUser = await User.findByOrFail('email', user.email)

    const kindRaw = request.qs().kind
    const kind = kindRaw === 'admin' || kindRaw === 'user' ? kindRaw : 'user'
    const isAdmin = (user as { role?: string }).role === 'admin'

    if (kind === 'admin' && !isAdmin) {
      return response.forbidden({ error: 'Access required.' })
    }
    if (kind === 'admin') {
      const allowed = await getPageAccessForUser(freshUser.id)
      if (Array.isArray(allowed) && !allowed.includes('teams')) {
        return response.forbidden({ error: 'You do not have access to teams.' })
      }

      // Dashboard team is implicit: ensure a default team exists.
      let adminTeam = await Team.query().where('kind', 'admin').orderBy('created_at', 'asc').first()
      if (!adminTeam) {
        adminTeam = await Team.create({
          name: 'Admin',
          kind: 'admin',
          createdByUserId: freshUser.id,
          createdAt: now,
          updatedAt: now,
        })
      }

      return response.ok({
        data: {
          teams: [adminTeam.serialize()],
        },
      })
    }

    const teams = await Team.query()
      .whereIn('id', TeamMember.query().select('team_id').where('user_id', freshUser.id))
      .where('kind', kind)
      .orderBy('created_at', 'desc')

    return response.ok({
      data: {
        teams: teams.map((t) => t.serialize()),
      },
    })
  }

  async store({ auth, request, response, now }: HttpContext) {
    const user = auth.getUserOrFail()
    const body = await request.validateUsing(createTeamValidator)
    const isAdmin = (user as { role?: string }).role === 'admin'
    const kind = body.kind === 'admin' && isAdmin ? 'admin' : 'user'

    if (!user.emailVerified) {
      return response.forbidden({
        error: 'Please verify your email address before creating a team.',
      })
    }
    if (kind === 'admin') {
      return response.badRequest({
        error: 'Teams are managed from the teams page. Use /teams to invite members.',
      })
    }

    const freshUser = await User.findByOrFail('email', user.email)

    const team = await Team.create({
      name: body.name,
      kind,
      createdByUserId: freshUser.id,
      createdAt: now,
      updatedAt: now,
    })

    await TeamMember.create({
      teamId: team.id,
      userId: freshUser.id,
      role: 'owner',
      adminPages: null,
      createdAt: now,
      updatedAt: now,
    })

    return response.created({
      message: 'Team created successfully',
      data: { team: team.serialize() },
    })
  }

  async members({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const freshUser = await User.findByOrFail('email', user.email)
    const teamId = request.param('teamId')
    const params = await request.paginationQs()

    const team = await Team.findOrFail(teamId)
    const isAdmin = (user as { role?: string }).role === 'admin'
    if (team.kind === 'admin') {
      if (!isAdmin) return response.forbidden({ error: 'Access required.' })
      const allowed = await getPageAccessForUser(freshUser.id)
      if (Array.isArray(allowed) && !allowed.includes('teams')) {
        return response.forbidden({ error: 'You do not have access to teams.' })
      }
    } else {
      const isMember = await TeamMember.query()
        .where('teamId', teamId)
        .where('userId', freshUser.id)
        .first()

      if (!isMember) {
        return response.forbidden({ error: 'You do not have access to this team.' })
      }
    }

    const paginator = await TeamMember.query()
      .where('teamId', teamId)
      .if(params.search, (q) => {
        q.whereHas('user', (uq) => {
          uq.whereILike('email', `%${params.search}%`).orWhereILike(
            'fullName',
            `%${params.search}%`,
          )
        })
      })
      .preload('user')
      .orderBy('createdAt', 'asc')
      .sortBy(params.sortBy || 'createdAt', params.sortOrder || 'asc')
      .paginate(params.page || 1, params.perPage || 10)

    const members = paginator.all()
    const meta = paginator.getMeta()

    const pendingInvitations = await TeamInvitation.query()
      .where('teamId', teamId)
      .whereNull('acceptedAt')
      .if(params.search, (q) => q.whereILike('email', `%${params.search}%`))
      .preload('invitedBy')
      .orderBy('createdAt', 'desc')

    return response.ok({
      data: {
        meta: {
          currentPage: meta.currentPage,
          perPage: meta.perPage,
          total: meta.total,
          lastPage: meta.lastPage,
        },
        members: members.map((m) => ({
          id: m.id,
          role: m.role,
          createdAt: m.createdAt.toISO() || '',
          fullName: m.user?.fullName || null,
          email: m.user?.email || null,
          adminPages: m.adminPages ?? null,
        })),
        invitations: pendingInvitations.map((inv) => ({
          id: inv.id,
          email: inv.email,
          role: inv.role,
          createdAt: inv.createdAt.toISO() || '',
          invitedBy: inv.invitedBy?.fullName || inv.invitedBy?.email || null,
          adminPages: inv.adminPages ?? null,
        })),
      },
    })
  }

  async updateMember({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const freshUser = await User.findByOrFail('email', user.email)
    const teamId = request.param('teamId')
    const memberId = request.param('memberId')

    const team = await Team.findOrFail(teamId)
    if (team.kind !== 'admin') {
      return response.forbidden({ error: 'Only dashboard team members can be updated here.' })
    }
    if ((user as { role?: string }).role !== 'admin') {
      return response.forbidden({ error: 'Access required.' })
    }
    const allowed = await getPageAccessForUser(freshUser.id)
    if (Array.isArray(allowed) && !allowed.includes('teams')) {
      return response.forbidden({ error: 'You do not have access to manage teams.' })
    }

    const member = await TeamMember.query()
      .where('team_id', teamId)
      .where('id', memberId)
      .firstOrFail()

    const body = await request.validateUsing(updateMemberValidator)
    if (body.adminPages !== undefined) {
      const pages = Array.isArray(body.adminPages) ? body.adminPages : null
      const resolved = pages?.length ? [...pages] : null
      if (resolved && !resolved.includes('dashboard')) {
        resolved.unshift('dashboard')
      }
      member.adminPages = resolved?.length ? resolved : null
      await member.save()
    }

    return response.ok({
      message: 'Member updated successfully',
      data: {
        id: member.id,
        adminPages: member.adminPages ?? null,
      },
    })
  }
}
