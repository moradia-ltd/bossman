import type { HttpContext } from '@adonisjs/core/http'
import Lease from '#models/lease'
import LeaseableEntity from '#models/leaseable_entity'
import TeamMember from '#models/team_member'
import User from '#models/user'
import { getPageAccessForUser } from '#services/page_access_service'

export default class TeamsPageController {
  async index({ auth, request, inertia, response }: HttpContext) {
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

    return inertia.render('dashboard/teams', { members: inertia.defer(async () => members) })
  }

  async show({ auth, params, inertia, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const freshUser = await User.findByOrFail('email', user.email)

    const isAdmin = user.isAdminOrSuperAdmin
    if (!isAdmin) {
      return response.forbidden()
    }
    const allowed = await getPageAccessForUser(freshUser.id)
    if (Array.isArray(allowed) && !allowed.includes('teams')) {
      return response.forbidden()
    }

    const member = await TeamMember.query()
      .where('id', params.id)
      .preload('user')
      .firstOrFail()

    const appEnv = request.appEnv()
    const [leaseableEntities, leases] = await Promise.all([
      LeaseableEntity.query({ connection: appEnv })
        .whereIn('type', ['standalone', 'block'])
        .select('id', 'address', 'org_id')
        .orderBy('address', 'asc'),
      Lease.query({ connection: appEnv })
        .select('id', 'name', 'org_id')
        .orderBy('name', 'asc'),
    ])

    return inertia.render('teams/member-show', {
      member,
      dataAccessOptions: {
        leaseableEntities: leaseableEntities.map((e) => ({ id: e.id, address: e.address })),
        leases: leases.map((l) => ({ id: l.id, name: l.name })),
      },
    })
  }
}
