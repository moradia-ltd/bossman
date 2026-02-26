import { slugify } from '@adonisjs/lucid-slugify'
import { belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { DateTime } from 'luxon'

import BlogCategory from './blog_category.js'
import SuperBaseModel from './super_base.js'

export default class BlogPost {
  static table = 'blog_posts'

  @column()
  declare id: number

  @column()
  declare title: string

  @column()
  declare slug: string

  @column()
  declare summary: string | null

  @column()
  declare content: string | null

  @column()
  declare thumbnailUrl: string | null

  @column()
  declare coverImageUrl: string | null

  @column()
  declare categoryId: string | null

  @column.dateTime()
  declare publishedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => BlogCategory, { foreignKey: 'categoryId' })
  declare category: BelongsTo<typeof BlogCategory>
}
