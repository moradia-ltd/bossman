import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'blog_post_authors'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.text('id').defaultTo(this.raw('nanoid()')).primary().unique().notNullable()
      table.string('blog_post_id').notNullable()
      table.string('blog_author_id').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.foreign('blog_post_id').references('id').inTable('blog_posts').onDelete('CASCADE')
      table.foreign('blog_author_id').references('id').inTable('blog_authors').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
