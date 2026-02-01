import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

import BackupService from '#services/backup_service'
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

    await new BackupService().createBackup(selectedDb)

    this.logger.success('Backup completed')
    animation.stop()
    process.exit(0)
  }
}
