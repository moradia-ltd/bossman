import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'push_notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('target_type', 32).notNullable() // all, all_landlords, all_tenants, all_agencies, specific
      table.json('target_user_ids').nullable() // when target_type = specific (json for SQLite compat)
      table.string('title').notNullable()
      table.text('description').notNullable()
      table.string('image_url', 2048).nullable()
      table.string('url', 2048).nullable()
      table.timestamp('scheduled_at').nullable()
      table.timestamp('sent_at').nullable()
      table.string('status', 24).notNullable().defaultTo('pending') // pending, sent, failed, cancelled
      table.json('one_signal_response').nullable()
      table.text('error_message').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
