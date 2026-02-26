import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'
import { getPageAccessForUser } from '#services/page_access_service'
import { RailwayApiService } from '#services/railway_service'
import { renderInertia } from '#utils/inertia'

const SERVERS_SORT_VALUES = [
  'updatedAt:desc',
  'updatedAt:asc',
  'name:asc',
  'name:desc',
  'createdAt:desc',
  'createdAt:asc',
] as const

export type ServersSortValue = (typeof SERVERS_SORT_VALUES)[number]

export default class ServersController {
  async index({ auth, inertia, request, session, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const freshUser = await User.findByOrFail('email', user.email)

    const allowed = await getPageAccessForUser(freshUser.id)
    if (Array.isArray(allowed) && !allowed.includes('servers')) {
      return response.forbidden()
    }

    const sortInput = request.input('sort') as string | undefined
    const savedSort = session.get('servers_sort') as ServersSortValue | undefined
    const sort: ServersSortValue = SERVERS_SORT_VALUES.includes(sortInput as ServersSortValue)
      ? (sortInput as ServersSortValue)
      : (savedSort ?? 'updatedAt:desc')

    session.put('servers_sort', sort)

    return renderInertia(inertia, 'servers/index', { sort })
  }

  async show({ params, request, auth, inertia, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const projectId = params.projectId
    await getPageAccessForUser(user.id)
    const railway = new RailwayApiService()
    const project = await railway.getProject(projectId)
    return renderInertia(inertia, 'servers/project-show', {
      projectName: project?.name ?? null,
      project,
    })
  }
}
