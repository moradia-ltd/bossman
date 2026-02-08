import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { getPageAccessForUser } from '#services/page_access_service'

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

    return inertia.render('servers/index')
  }
}
