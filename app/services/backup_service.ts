import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import drive from '@adonisjs/drive/services/main'
import DatabaseBackup from '#models/db_backup'
import { SnitchService } from '#services/snitch_service'
import env from '#start/env'

const productionDB = env.get('PROD_DB')
const developmentDB = env.get('DEV_DB')

export default class BackupService {
  async createBackup(selectedDb: 'prod' | 'dev') {
    const now = new Date()
    const appRoot = app.appRoot.host
    const backupDir = path.join(appRoot, 'backups')
    const backupFileName = `v2-backup-${now.getTime()}-${selectedDb}.sql`
    const backupFilePath = path.join(backupDir, backupFileName)
    const connectionString = selectedDb === 'prod' ? productionDB : developmentDB
    const backupCommand = `pg_dump --no-owner --dbname=${connectionString} > ${backupFilePath}`
    try {
      logger.info('Initiating DB backup...')

      // Create backup directory if it doesn't exist
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true })
      }
      execSync(backupCommand)
      const file = fs.readFileSync(backupFilePath)
      logger.info('Backup sql file created')

      // upload to google cloud storage
      logger.info('Uploading to Cloudflare R2 and Google Cloud Storage')
      const r2 = drive.use('backup')

      await r2.put(backupFileName, file)
      logger.info('Backup uploaded to Cloudflare R2')

      const backup = await DatabaseBackup.create(
        {
          filePath: backupFilePath,
          fileSize: file.length,
        },
        { connection: selectedDb },
      )

      logger.info(`Backup created with id ${backup.id}`)

      await SnitchService.report.general(`Db backup completed now ${now.toISOString()}`, {
        backupFilePath,
        backupDir,
        selectedDb,
      })

      logger.info('Backup completed')
    } catch (err) {
      console.log('🚀 ~ DbBackup ~ run ~ err:', err)
      logger.error(err)
    }
  }
}
