import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'
import { getPageAccessForUser } from '#services/page_access_service'

export default class EmailsPageController {
  async index({ auth, inertia, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const freshUser = await User.findByOrFail('email', user.email)

    if (!user.isAdminOrSuperAdmin) {
      return response.forbidden()
    }
    const allowed = await getPageAccessForUser(freshUser.id)
    if (Array.isArray(allowed) && !allowed.includes('emails')) {
      return response.forbidden()
    }

    return inertia.render('emails/index', {})
  }

  async show({ auth, params, inertia, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const freshUser = await User.findByOrFail('email', user.email)

    if (!user.isAdminOrSuperAdmin) {
      return response.forbidden()
    }
    const allowed = await getPageAccessForUser(freshUser.id)
    if (Array.isArray(allowed) && !allowed.includes('emails')) {
      return response.forbidden()
    }

    return inertia.render('emails/index', { emailId: params.id })
  }
}
