import { BaseModel, column } from '@adonisjs/lucid/orm'
import type { DateTime } from 'luxon'

export default class Earth extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare size: string

  @column()
  declare population: number

  @column()
  declare area: number

  @column()
  declare gdp: number

  @column()
  declare gdpPerCapita: number

  @column()
  declare africa: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
