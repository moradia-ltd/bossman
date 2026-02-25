import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'
import { getPageAccessForUser } from '#services/page_access_service'
import { resendService } from '#services/resend_service'

export default class EmailsController {
  /**
   * List sent emails (cursor-based pagination).
   * Query: limit (1–100), after (id), before (id).
   */
  async index({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const freshUser = await User.findByOrFail('email', user.email)

    if (!user.isAdminOrSuperAdmin) {
      return response.forbidden()
    }
    const allowed = await getPageAccessForUser(freshUser.id)
    if (Array.isArray(allowed) && !allowed.includes('emails')) {
      return response.forbidden()
    }

    const limit = Math.min(Math.max(Number(request.qs().limit) || 20, 1), 100)
    const after = request.qs().after as string | undefined
    const before = request.qs().before as string | undefined

    const list = await resendService.list({
      limit,
      ...(after && { after }),
      ...(before && { before }),
    })

    return response.ok(list)
  }

  /**
   * Get a single email by id (includes html/text).
   */
  async show({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const freshUser = await User.findByOrFail('email', user.email)

    if (!user.isAdminOrSuperAdmin) {
      return response.forbidden()
    }
    const allowed = await getPageAccessForUser(freshUser.id)
    if (Array.isArray(allowed) && !allowed.includes('emails')) {
      return response.forbidden()
    }

    const email = await resendService.get(params.id)
    return response.ok(email)
  }
}
