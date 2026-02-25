import type { HttpContext } from '@adonisjs/core/http'

import TeamMember from '#models/team_member'
import User from '#models/user'
import { getPageAccessForUser } from '#services/page_access_service'
import TeamMemberTransformer from '#transformers/team_member_transformer'

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
      .orderBy('createdAt', 'desc')
      .sortBy(params.sortBy || 'createdAt', params.sortOrder || 'desc')
      .paginate(params.page || 1, params.perPage || 10)

    return inertia.render('teams/index', {
      members: inertia.defer(async () =>
        TeamMemberTransformer.paginate(members.all(), members.getMeta()),
      ),
    })
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

    const member = await TeamMember.query().where('id', params.id).preload('user').firstOrFail()

    return inertia.render('teams/member-show', {
      member: TeamMemberTransformer.transform(member),
    })
  }
}
