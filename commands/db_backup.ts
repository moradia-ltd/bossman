import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import drive from '@adonisjs/drive/services/main'

import DatabaseBackup from '#models/db_backup'
import { SnitchService } from '#services/snitch_service'
import env from '#start/env'

export default class DbBackup extends BaseCommand {
  static commandName = 'db:backup'
  static description = 'A command to backup the database to a file and upload it to Cloudflare R2'
  public productionDB = env.get('PROD_DB')
  public developmentDB = env.get('DEV_DB')

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const animation = this.logger.await('Creating backup')

    const selectedDb = await this.prompt.choice('Select database', ['prod', 'dev'])

    try {
      this.logger.info('Initiating DB backup...')

      animation.start()
      const appRoot = this.app.appRoot.host
      const backupDir = path.join(appRoot, 'backups')

      // Create backup directory if it doesn't exist
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true })
      }

      // Get the current date and time
      const now = new Date()
      const backupFileName = `v2-backup-${now.getTime()}.sql`
      const backupFilePath = path.join(backupDir, backupFileName)

      animation.update('Generating backup file')
      // Execute the backup command
      const connectionString = selectedDb === 'prod' ? this.productionDB : this.developmentDB
      const backupCommand = `pg_dump --no-owner --dbname=${connectionString} > ${backupFilePath}`

      execSync(backupCommand)
      const file = fs.readFileSync(backupFilePath)
      animation.update('Backup sql file created')

      // upload to google cloud storage
      animation.update('Uploading to Cloudflare R2 and Google Cloud Storage')
      const r2 = drive.use('backup')
      // const gcs = drive.use('gcs')

      await r2
        .put(backupFileName, file)
        .then(() => animation.update('Backup uploaded to Cloudflare R2'))

      // await gcs
      //   .put(`backups/${backupFileName}`, file)
      //   .then(() => animation.update('Backup uploaded to Google Cloud Storage'))

      const backup = await DatabaseBackup.create(
        {
          filePath: backupFilePath,
          fileSize: file.length,
        },
        { connection: selectedDb },
      )

      this.logger.info(`Backup created with id ${backup.id}`)

      await SnitchService.report.general(`Db backup completed now ${now.toISOString()}`, {
        backupFilePath,
        backupDir,
        selectedDb,
      })
      this.logger.success('Backup completed')
      animation.stop()
      process.exit(0)
    } catch (err) {
      animation.stop()

      console.log('🚀 ~ DbBackup ~ run ~ err:', err)
      this.logger.error(err)
    }
  }
}
