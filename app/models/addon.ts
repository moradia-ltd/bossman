import { BaseModel, column } from '@adonisjs/lucid/orm'
import { slugify } from '@adonisjs/lucid-slugify'
import type { DateTime } from 'luxon'

export default class Addon extends BaseModel {
  static get table() {
    return 'add_ons'
  }

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  @slugify({ strategy: 'dbIncrement', fields: ['name'] })
  declare slug: string

  @column()
  declare shortDescription: string | null

  @column()
  declare longDescription: string | null

  @column()
  declare priceAmount: string | null

  @column()
  declare priceCurrency: string | null

  @column()
  declare billingType: 'one_off' | 'recurring_monthly' | 'recurring_yearly' | 'usage'

  @column()
  declare stripePriceId: string | null

  @column({
    prepare: (value: string[] | null) => (value ? JSON.stringify(value) : null),
    // consume: (value: string | null) => (value ? (JSON.parse(value) as string[]) : null),
  })
  declare features: string[] | null

  @column()
  declare isActive: boolean

  @column()
  declare sortOrder: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
