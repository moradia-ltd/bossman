import type { HttpContext } from '@adonisjs/core/http'
import TeamInvitation from '#models/team_invitation'
import TeamMember from '#models/team_member'
import User from '#models/user'
import { getPageAccessForUser } from '#services/page_access_service'
import { updateMemberValidator } from '#validators/team'

export default class MembersController {
  async index({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const freshUser = await User.findByOrFail('email', user.email)
    const params = await request.paginationQs()

    const isAdmin = (user as { role?: string }).role === 'admin'
    if (!isAdmin) {
      return response.forbidden({ error: 'Access required.' })
    }
    const allowed = await getPageAccessForUser(freshUser.id)
    if (Array.isArray(allowed) && !allowed.includes('teams')) {
      return response.forbidden({ error: 'You do not have access to teams.' })
    }

    const members = await TeamMember.query()
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

    return response.ok(members)
  }

  async invitations({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const freshUser = await User.findByOrFail('email', user.email)

    const isAdmin = (user as { role?: string }).role === 'admin'
    if (!isAdmin) {
      return response.forbidden({ error: 'Access required.' })
    }
    const allowed = await getPageAccessForUser(freshUser.id)
    if (Array.isArray(allowed) && !allowed.includes('teams')) {
      return response.forbidden({ error: 'You do not have access to teams.' })
    }

    const pendingInvitations = await TeamInvitation.query()
      .whereNull('acceptedAt')
      .preload('invitedBy')
      .orderBy('createdAt', 'desc')

    return response.ok({
      data: {
        invitations: pendingInvitations.map((inv) => ({
          id: inv.id,
          email: inv.email,
          role: inv.role,
          createdAt: inv.createdAt.toISO() || '',
          invitedBy: inv.invitedBy?.fullName || inv.invitedBy?.email || null,
          allowedPages: inv.allowedPages ?? null,
        })),
      },
    })
  }

  async updateMember({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const freshUser = await User.findByOrFail('email', user.email)
    const memberId = request.param('memberId')

    if ((user as { role?: string }).role !== 'admin') {
      return response.forbidden({ error: 'Access required.' })
    }
    const allowed = await getPageAccessForUser(freshUser.id)
    if (Array.isArray(allowed) && !allowed.includes('teams')) {
      return response.forbidden({ error: 'You do not have access to manage teams.' })
    }

    const member = await TeamMember.query().where('id', memberId).firstOrFail()

    const body = await request.validateUsing(updateMemberValidator)
    if (body.allowedPages !== undefined) {
      const pages = Array.isArray(body.allowedPages) ? body.allowedPages : null
      const resolved = pages?.length ? [...pages] : null
      if (resolved && !resolved.includes('dashboard')) {
        resolved.unshift('dashboard')
      }
      member.allowedPages = resolved?.length ? resolved : null
      await member.save()
    }

    return response.ok({
      message: 'Member updated successfully',
      data: {
        id: member.id,
        allowedPages: member.allowedPages ?? null,
      },
    })
  }
}
