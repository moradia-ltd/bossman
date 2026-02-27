import { slugify } from '@adonisjs/lucid-slugify'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { Attachment, attachment } from '@jrmc/adonis-attachment'
import type { DateTime } from 'luxon'

import { FileStoreRoutes } from '../enum/file_store.ts'

export default class BlogPost extends BaseModel {
  static table = 'blog_posts'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare body: string

  @column()
  @slugify({ fields: ['title'], strategy: 'dbIncrement' })
  declare slug: string

  @column() declare excerpt: string | null

  @attachment({ folder: FileStoreRoutes.BLOG_IMAGES, preComputeUrl: false })
  declare coverImage: Attachment | null

  @column()
  declare coverImageAltUrl: string | null

  // @column.dateTime()
  @column()
  declare publishedAt: DateTime | null

  // @column.dateTime({ autoCreate: true })
  @column()
  declare createdAt: DateTime

  // @column.dateTime({ autoCreate: true, autoUpdate: true })
  @column()
  declare updatedAt: DateTime
}
