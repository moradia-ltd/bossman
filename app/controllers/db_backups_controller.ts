import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import drive from '@adonisjs/drive/services/main'
import DbBackup from '#models/db_backup'
import BackupService from '#services/backup_service'

export default class DbBackupsController {
  async index({ request, inertia }: HttpContext) {
    const params = await request.paginationQs()
    const appEnv = request.appEnv()
    const backups = await DbBackup.query({ connection: appEnv })
      .orderBy('createdAt', 'desc')
      .paginate(params.page ?? 1, params.perPage ?? 20)

    return inertia.render('db-backups/index', { backups: inertia.defer(async () => backups) })
  }

  /** API: create a new backup. Returns JSON. */
  async store({ request, response, logger }: HttpContext) {
    const appEnv = request.appEnv()
    const backupService = new BackupService()
    try {
      logger.info('Creating backup...')
      await backupService.createBackup(appEnv)
      logger.info('Backup created successfully')
      return response.ok({ success: true })
    } catch (err) {
      logger.error(err)
      return response.badRequest({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  /** Download a backup file. */
  async download({ params, request, response }: HttpContext) {
    const appEnv = request.appEnv()
    const backup = await DbBackup.query({ connection: appEnv }).where('id', params.id).firstOrFail()
    const fileName = backup.fileName!
    const r2 = drive.use('backup')
    const exists = await r2.exists(fileName)
    if (!exists) {
      return response.notFound({ error: 'Backup file not found in storage' })
    }
    const contents = await r2.get(fileName)
    if (!contents) {
      return response.notFound({ error: 'Could not read backup file' })
    }
    const buffer = Buffer.isBuffer(contents) ? contents : Buffer.from(contents)
    response
      .header('Content-Type', 'application/sql')
      .header('Content-Disposition', `attachment; filename="${fileName}"`)
      .send(buffer)
  }

  /** API: restore a backup to the given database connection URL. */
  async restore({ params, request, response, logger }: HttpContext) {
    const appEnv = request.appEnv()
    const backupId = Number(params.id)
    if (Number.isNaN(backupId)) {
      return response.badRequest({ error: 'Invalid backup ID' })
    }
    const body = request.body() as { connectionUrl?: string }
    const connectionUrl = typeof body.connectionUrl === 'string' ? body.connectionUrl.trim() : ''
    if (!connectionUrl) {
      return response.badRequest({ error: 'Connection URL is required' })
    }
    const backupService = new BackupService()
    try {
      logger.info(`Restoring backup ${backupId} to target database...`)
      await backupService.restore(backupId, connectionUrl, appEnv)
      return response.ok({ success: true, message: 'Restore completed successfully' })
    } catch (err) {
      logger.error(err)
      return response.badRequest({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  async destroy({ params, response, request }: HttpContext) {
    const appEnv = request.appEnv()
    const backup = await DbBackup.query({ connection: appEnv }).where('id', params.id).firstOrFail()
    const fileName = backup.fileName!
    console.log('🚀 ~ DbBackupsController ~ destroy ~ fileName:', fileName)

    try {
      const r2 = drive.use('backup')
      const exists = await r2.exists(fileName)
      console.log('🚀 ~ DbBackupsController ~ destroy ~ exists:', exists)

      await r2.delete(fileName)
      await backup.delete()
      logger.info(`Deleted backup file from R2: ${fileName}`)
    } catch (err) {
      console.log('🚀 ~ DbBackupsController ~ destroy ~ err:', err)
    }

    return response.redirect('/db-backups')
  }
}
