import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'team_members'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('data_access_mode').defaultTo('all') // 'all' | 'selected'
      table.json('allowed_leaseable_entity_ids').nullable()
      table.json('allowed_lease_ids').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('data_access_mode')
      table.dropColumn('allowed_leaseable_entity_ids')
      table.dropColumn('allowed_lease_ids')
    })
  }
}
