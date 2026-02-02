import { BaseModel, column } from '@adonisjs/lucid/orm'
import type { ModelObject } from '@adonisjs/lucid/types/model'
import type { DateTime } from 'luxon'

export default class AccountBan extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare orgId: string

  @column()
  declare userId: string

  @column()
  declare reason: string

  @column()
  declare isBanActive: boolean

  @column()
  declare metadata: ModelObject

  @column()
  declare removedAt: DateTime | null

  @column()
  declare banStartsAt: DateTime

  @column()
  declare expiresAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
