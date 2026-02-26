import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'
import { getPageAccessForUser } from '#services/page_access_service'
import type { RailwayProject } from '#services/railway_service'
import { RailwayApiService } from '#services/railway_service'

const SERVERS_SORT_VALUES = [
  'updatedAt:desc',
  'updatedAt:asc',
  'name:asc',
  'name:desc',
  'createdAt:desc',
  'createdAt:asc',
] as const

export type ServersSortValue = (typeof SERVERS_SORT_VALUES)[number]

function sortProjects(projects: RailwayProject[], sort: ServersSortValue): RailwayProject[] {
  const [field, order] = sort.split(':') as [keyof RailwayProject, 'asc' | 'desc']
  return [...projects].sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return order === 'asc' ? -1 : 1
    if (bVal == null) return order === 'asc' ? 1 : -1
    const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
    return order === 'asc' ? cmp : -cmp
  })
}

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
      : savedSort ?? 'updatedAt:desc'

    session.put('servers_sort', sort)

    return (
      inertia.render as (
        page: string,
        props: object,
      ) => ReturnType<HttpContext['inertia']['render']>
    )('servers/index', {
      sort,
      sortOptions: SERVERS_SORT_VALUES.map((value) => ({
        value,
        label:
          value === 'updatedAt:desc'
            ? 'Updated (newest first)'
            : value === 'updatedAt:asc'
              ? 'Updated (oldest first)'
              : value === 'name:asc'
                ? 'Name A–Z'
                : value === 'name:desc'
                  ? 'Name Z–A'
                  : value === 'createdAt:desc'
                    ? 'Created (newest first)'
                    : 'Created (oldest first)',
      })),
      projects: inertia.defer((async () => {
        const railway = new RailwayApiService()
        const projects = await railway.listProjects()
        return sortProjects(projects, sort)
      }) as never),
    })
  }

  async show({ params, request, auth, inertia, response }: HttpContext) {
    const user = auth.getUserOrFail()

    await getPageAccessForUser(user.id)

    const projectId = params.projectId
    const projectName = request.input('name') as string | undefined
    return (
      inertia.render as (
        page: string,
        props: object,
      ) => ReturnType<HttpContext['inertia']['render']>
    )('servers/project-show', {
      projectName: projectName ?? null,
      project: inertia.defer((async () => {
        const railway = new RailwayApiService()
        return railway.getProject(projectId)
      }) as never),
    })
  }
}
