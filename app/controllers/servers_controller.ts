import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { getPageAccessForUser } from '#services/page_access_service'
import { RailwayApiService } from '#services/railway_service'

export default class ServersController {
  async index({ auth, inertia, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const freshUser = await User.findByOrFail('email', user.email)

    if (!user.isAdminOrSuperAdmin) {
      return response.forbidden()
    }
    const allowed = await getPageAccessForUser(freshUser.id)
    if (Array.isArray(allowed) && !allowed.includes('servers')) {
      return response.forbidden()
    }

    return inertia.render('servers/index', {
      projects: inertia.defer(async () => {
        const railway = new RailwayApiService()
        return railway.listProjects()
      }),
    })
  }

  async show({ params, auth, inertia, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const freshUser = await User.findByOrFail('email', user.email)

    if (!user.isAdminOrSuperAdmin) {
      return response.forbidden()
    }
    const allowed = await getPageAccessForUser(freshUser.id)
    if (Array.isArray(allowed) && !allowed.includes('servers')) {
      return response.forbidden()
    }

    const projectId = params.projectId
    return inertia.render('servers/project-show', {
      project: inertia.defer(async () => {
        const railway = new RailwayApiService()
        return railway.getProject(projectId)
      }),
    })
  }
}
