import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import { getPageAccessForUser } from '#services/page_access_service'

export default class LogsPageController {
  async index({ auth, request, inertia, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const freshUser = await User.findByOrFail('email', user.email)

    if (!user.isAdminOrSuperAdmin) {
      return response.forbidden()
    }
    const allowed = await getPageAccessForUser(freshUser.id)
    if (Array.isArray(allowed) && !allowed.includes('logs')) {
      return response.forbidden()
    }

    const params = await request.paginationQs()
    const event = request.qs().event as string | undefined
    const auditableType = request.qs().auditableType as string | undefined

    const audits = await db
      .from('audits')
      .orderBy('created_at', 'desc')
      .if(event, (q) => q.where('event', event!))
      .if(auditableType, (q) => q.where('auditable_type', auditableType!))
      .select('*')
      .paginate(params.page ?? 1, params.perPage ?? 20)

    return inertia.render('logs/index', {
      audits: inertia.defer(async () => audits),
      filters: { event: event ?? '', auditableType: auditableType ?? '' },
    })
  }
}
