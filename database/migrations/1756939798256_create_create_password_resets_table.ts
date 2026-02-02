import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'password_resets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('user_id').notNullable().references('users.id').onDelete('CASCADE')
      table.string('email').notNullable().index()
      table.string('token').notNullable().index()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
      table.timestamp('expires_at').notNullable()
      table.string('type').defaultTo('password_reset').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
