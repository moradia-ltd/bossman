import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'blog_post_tags'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
      table.string('id').defaultTo(this.raw('nanoid()')).primary().unique().notNullable()

      table
        .string('blog_post_id')
        .notNullable()
        .references('blog_posts.id')
        .onDelete('CASCADE')
        .unique()
      table
        .string('blog_tag_id')
        .notNullable()
        .references('blog_tags.id')
        .onDelete('CASCADE')
        .unique()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
