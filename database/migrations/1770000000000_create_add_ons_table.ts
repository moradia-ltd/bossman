import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'add_ons'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').defaultTo(this.raw('nanoid()')).primary().unique().notNullable()

      table.string('name').notNullable()
      table.string('slug').notNullable().unique().index()
      table.text('short_description').nullable()
      table.text('long_description').nullable()

      table.decimal('price_amount', 12, 2).nullable()
      table.string('price_currency', 3).nullable()
      table.string('billing_type').notNullable() // one_off | recurring_monthly | recurring_yearly | usage
      table.string('stripe_price_id').nullable()

      table.jsonb('features').nullable() // array of feature strings
      table.boolean('is_active').defaultTo(true).notNullable()
      table.integer('sort_order').defaultTo(0).notNullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
