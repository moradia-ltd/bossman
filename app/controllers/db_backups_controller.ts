import type { HttpContext } from '@adonisjs/core/http'
import DbBackup from '#models/db_backup'

export default class DbBackupsController {
  async index({ request, inertia }: HttpContext) {
    const params = await request.paginationQs()
    const appEnv = request.appEnv()
    const backups = await DbBackup.query({ connection: appEnv })

      .orderBy('createdAt', 'desc')
      .paginate(params.page ?? 1, params.perPage ?? 20)

    return inertia.render('db-backups/index', { backups })
  }
}
