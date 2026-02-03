import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'team_members'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('properties_access_mode').defaultTo('all')
      table.string('leases_access_mode').defaultTo('all')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('properties_access_mode')
      table.dropColumn('leases_access_mode')
    })
  }
}
