import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, computed } from '@adonisjs/lucid/orm'
import { Auditable } from '@stouder-io/adonis-auditing'
import type { DateTime } from 'luxon'

export default class DbBackup extends compose(BaseModel, Auditable) {
  @column({ isPrimary: true }) declare id: number

  @column() declare filePath: string | null

  /**
   * The size of the backup file in bytes.
   */
  @column()
  declare fileSize: number

  @computed() get fileName() {
    // backups/v2-backup-1769948533686.sql
    // remove the backups/ prefix
    return this.filePath?.replace('backups/', '')
  }

  /**
   * The timestamp when the backup was created.
   * This is automatically set to the current time when the record is created.
   */

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
