import { column } from '@adonisjs/lucid/orm'
import type { DateTime } from 'luxon'

import SuperBaseModel from './super_base.js'

export default class BlogCategory extends SuperBaseModel {
  static table = 'blog_categories'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
