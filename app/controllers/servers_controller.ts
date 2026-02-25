import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { getPageAccessForUser } from '#services/page_access_service'
import { RailwayApiService } from '#services/railway_service'

export default class ServersController {
  async index({ auth, inertia, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const freshUser = await User.findByOrFail('email', user.email)

    const allowed = await getPageAccessForUser(freshUser.id)
    if (Array.isArray(allowed) && !allowed.includes('servers')) {
      return response.forbidden()
    }

    return (inertia.render as (page: string, props: object) => ReturnType<HttpContext['inertia']['render']>)(
      'servers/index',
      {
        projects: inertia.defer((async () => {
          const railway = new RailwayApiService()
          return railway.listProjects()
        }) as never),
      },
    )
  }

  async show({ params, request, auth, inertia, response }: HttpContext) {
    const user = auth.getUserOrFail()

    await getPageAccessForUser(user.id)

    const projectId = params.projectId
    const projectName = request.input('name') as string | undefined
    return (inertia.render as (page: string, props: object) => ReturnType<HttpContext['inertia']['render']>)(
      'servers/project-show',
      {
        projectName: projectName ?? null,
        project: inertia.defer((async () => {
          const railway = new RailwayApiService()
          return railway.getProject(projectId)
        }) as never),
      },
    )
  }
}
