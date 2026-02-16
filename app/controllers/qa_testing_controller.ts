import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { getPageAccessForUser } from '#services/page_access_service'

export default class QaTestingController {
  /**
   * QA testing report dashboard page
   */
  async index({ auth, inertia, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const freshUser = await User.findByOrFail('email', user.email)

    // Restrict to admin roles (same pattern used by other admin pages)
    if (!user.isAdminOrSuperAdmin) {
      return response.forbidden({ error: 'Access required.' })
    }

    // Optional fine-grained page access
    const allowed = await getPageAccessForUser(freshUser.id)
    if (Array.isArray(allowed) && !allowed.includes('qaTesting')) {
      return response.forbidden({ error: 'You do not have access to QA Testing.' })
    }

    return inertia.render('qa-testing/index', {})
  }

  /**
   * QA testing create page
   */
  async create({ auth, inertia, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const freshUser = await User.findByOrFail('email', user.email)

    if (!user.isAdminOrSuperAdmin) {
      return response.forbidden({ error: 'Access required.' })
    }

    const allowed = await getPageAccessForUser(freshUser.id)
    if (Array.isArray(allowed) && !allowed.includes('qaTesting')) {
      return response.forbidden({ error: 'You do not have access to create QA reports.' })
    }

    return inertia.render('qa-testing/create', {})
  }
}
