import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Activity from '#models/activity'
import Lease from '#models/lease'
import LeaseableEntity from '#models/leaseable_entity'

export default class LeaseableEntitiesController {
  async index({ request, inertia }: HttpContext) {
    const params = await request.paginationQs()
    const appEnv = request.appEnv()
    const leaseableEntities = await LeaseableEntity.query({ connection: appEnv })
      .preload('org', (q) => q.select('id', 'name', 'creatorEmail'))
      .whereIn('type', ['standalone', 'block'])
      .orderBy('address', 'asc')
      .withPagination(params)

    return inertia.render('properties/index', { leaseableEntities })
  }

  async stats({ request, response }: HttpContext) {
    const appEnv = request.appEnv()

    const counts = await db.connection(appEnv).rawQuery(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE is_vacant = true) AS vacant,
        COUNT(*) FILTER (WHERE is_vacant = false) AS occupied
      FROM leaseable_entities
    `)
    const data = (counts.rows as { total: string; vacant: string; occupied: string }[])[0]
    return response.ok(data)
  }

  async show({ params, inertia, request, response }: HttpContext) {
    const appEnv = request.appEnv()
    const entity = await LeaseableEntity.query({ connection: appEnv })
      .where('id', params.id)
      .first()
    if (!entity) return response.notFound({ message: 'Property not found' })

    return inertia.render('properties/show', { property: entity })
  }

  async leases({ request, params, response }: HttpContext) {
    const appEnv = request.appEnv()
    const paginationParams = await request.paginationQs()
    const leases = await Lease.query({ connection: appEnv })
      .where('leaseable_entity_id', params.id)
      .orderBy('start_date', 'desc')
      .preload('tenants', (q) => q.select('id', 'name', 'email'))
      .preload('org', (q) => q.select('id', 'name', 'creatorEmail'))
      .paginate(paginationParams.page ?? 1, paginationParams.perPage ?? 10)
    return response.ok(leases)
  }

  async activity({ request, params, response }: HttpContext) {
    const appEnv = request.appEnv()
    const paginationParams = await request.paginationQs()
    const activities = await Activity.query({ connection: appEnv })
      .where('leaseable_entity_id', params.id)
      .orderBy('created_at', 'desc')
      .preload('user', (q) => q.select('id', 'name'))
      .paginate(paginationParams.page ?? 1, paginationParams.perPage ?? 10)
    return response.ok(activities)
  }
}
