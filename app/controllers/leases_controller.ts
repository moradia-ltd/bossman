import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Activity from '#models/activity'
import Lease from '#models/lease'
import Payment from '#models/payment'

export default class LeasesController {
  async index({ request, inertia }: HttpContext) {
    const params = await request.paginationQs()
    const appEnv = request.appEnv()
    const leases = await Lease.query({ connection: appEnv })
      .preload('tenants', (q) => q.select('id', 'name', 'email'))
      .preload('org', (q) => q.select('id', 'name', 'creatorEmail'))
      .orderBy('startDate', 'desc')
      .withPagination(params)

    return inertia.render('leases/index', { leases })
  }

  async stats({ response, request }: HttpContext) {
    const appEnv = request.appEnv()
    const result = await db.connection(appEnv).rawQuery(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'active') AS active,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending,
        COUNT(*) FILTER (WHERE end_date < NOW()) AS expired
      FROM leases
    `)
    const counts = (result.rows as Record<string, string>[])[0]
    return response.ok(counts)
  }

  async show({ params, inertia, request }: HttpContext) {
    const appEnv = request.appEnv()
    const lease = await Lease.query({ connection: appEnv }).where('id', params.id).firstOrFail()
    return inertia.render('leases/show', { lease })
  }

  async payments({ response, request, params }: HttpContext) {
    const appEnv = request.appEnv()
    const paginationParams = await request.paginationQs()
    const payments = await Payment.query({ connection: appEnv })
      .where('lease_id', params.id)
      .orderBy('due_date', 'desc')
      .preload('lease', (q) => q.select('id', 'name', 'currency'))
      .withPagination(paginationParams)

    return response.ok(payments)
  }

  async activity({ response, request, params }: HttpContext) {
    const paginationParams = await request.paginationQs()
    const appEnv = request.appEnv()
    const activities = await Activity.query({ connection: appEnv })
      .where('lease_id', params.id)
      .orderBy('created_at', 'desc')
      .preload('user', (q) => q.select('id', 'name'))
      .withPagination(paginationParams)

    return response.ok(activities)
  }
}
