import type { HttpContext } from '@adonisjs/core/http'
import Lease from '#models/lease'
import LeaseableEntity from '#models/leaseable_entity'
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

    const isAdmin = user.isAdminOrSuperAdmin
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

    const isAdmin = user.isAdminOrSuperAdmin
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
        invitations: pendingInvitations,
      },
    })
  }

  async dataAccessOptions({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const freshUser = await User.findByOrFail('email', user.email)

    if (!user.isAdminOrSuperAdmin) {
      return response.forbidden({ error: 'Access required.' })
    }
    const allowed = await getPageAccessForUser(freshUser.id)
    if (Array.isArray(allowed) && !allowed.includes('teams')) {
      return response.forbidden({ error: 'You do not have access to manage teams.' })
    }

    const appEnv = request.appEnv()
    const [leaseableEntities, leases] = await Promise.all([
      LeaseableEntity.query({ connection: appEnv })
        .whereIn('type', ['standalone', 'block'])
        .select('id', 'address')
        .orderBy('address', 'asc'),
      Lease.query({ connection: appEnv }).select('id', 'name').orderBy('name', 'asc'),
    ])

    return response.ok({
      data: {
        leaseableEntities: leaseableEntities.map((e) => ({ id: e.id, address: e.address })),
        leases: leases.map((l) => ({ id: l.id, name: l.name })),
      },
    })
  }

  async updateMember({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const freshUser = await User.findByOrFail('email', user.email)
    const memberId = request.param('memberId')

    if (!user.isAdminOrSuperAdmin) {
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
    }
    if (body.enableProdAccess !== undefined) {
      member.enableProdAccess = body.enableProdAccess
    }
    if (body.dataAccessMode !== undefined) {
      member.dataAccessMode = body.dataAccessMode
    }
    if (body.propertiesAccessMode !== undefined) {
      member.propertiesAccessMode = body.propertiesAccessMode
    }
    if (body.leasesAccessMode !== undefined) {
      member.leasesAccessMode = body.leasesAccessMode
    }
    if (body.propertiesAccessMode !== undefined || body.leasesAccessMode !== undefined) {
      const p = body.propertiesAccessMode ?? member.propertiesAccessMode ?? 'all'
      const l = body.leasesAccessMode ?? member.leasesAccessMode ?? 'all'
      member.dataAccessMode = p === 'selected' || l === 'selected' ? 'selected' : 'all'
    }
    if (body.allowedLeaseableEntityIds !== undefined) {
      member.allowedLeaseableEntityIds =
        body.allowedLeaseableEntityIds?.length ? body.allowedLeaseableEntityIds : null
    }
    if (body.allowedLeaseIds !== undefined) {
      member.allowedLeaseIds = body.allowedLeaseIds?.length ? body.allowedLeaseIds : null
    }
    await member.save()

    return response.ok({
      message: 'Member updated successfully',
      data: member,
    })
  }
}
