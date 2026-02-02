import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'blog_posts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').defaultTo(this.raw('nanoid()')).primary().unique().notNullable()

      table.string('title').notNullable()
      table.string('slug').notNullable().unique().index()
      table.text('summary').nullable()
      table.text('content').nullable()

      table.string('thumbnail_url').nullable()
      table.string('cover_image_url').nullable()

      table.string('category_id').nullable().references('blog_categories.id').onDelete('SET NULL')

      table.timestamp('published_at').nullable().index()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
