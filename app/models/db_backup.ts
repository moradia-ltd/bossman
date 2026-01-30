import { BaseModel, column } from '@adonisjs/lucid/orm'
import type { DateTime } from 'luxon'

export default class DbBackup extends BaseModel {
  @column({ isPrimary: true }) declare id: number

  @column() declare filePath: string | null

  /**
   * The size of the backup file in bytes.
   */
  @column()
  declare fileSize: number

  /**
   * The timestamp when the backup was created.
   * This is automatically set to the current time when the record is created.
   */

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
