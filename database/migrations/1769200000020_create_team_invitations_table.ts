import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'team_invitations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').defaultTo(this.raw('nanoid()')).primary().unique().notNullable()
      table.string('email').notNullable().index()
      table.string('role').notNullable().defaultTo('member') // owner, admin, member
      table.string('token_hash').notNullable().unique()
      table.string('invited_by_user_id').notNullable().references('users.id').onDelete('CASCADE')
      table.timestamp('expires_at').notNullable()
      table.timestamp('accepted_at').nullable()
      table.string('accepted_by_user_id').nullable().references('users.id').onDelete('SET NULL')
      table.string('invited_user_role').notNullable().defaultTo('normal_user').index()

      table.json('allowed_pages').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
