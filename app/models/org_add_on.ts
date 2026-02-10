import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { ModelObject } from '@adonisjs/lucid/types/model'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { DateTime } from 'luxon'
import Addon from './addon.js'
import Org from './org.js'

//  table.string('id').defaultTo(this.raw('nanoid()')).primary().unique()
// table.string('org_id').notNullable().references('id').inTable('orgs').onDelete('CASCADE')
// table.string('add_on_id').notNullable().references('id').inTable('add_ons').onDelete('CASCADE')
// table.string('status').notNullable() // active | cancelled | expired
// table.string('stripe_subscription_item_id').nullable()
// table.string('stripe_subscription_id').nullable()
// table.integer('quantity').defaultTo(1).notNullable()
// table.integer('usage_value').nullable() // e.g. remaining SMS credits
// table.timestamp('starts_at', { useTz: true }).nullable()
// table.timestamp('ends_at', { useTz: true }).nullable()
// table.jsonb('metadata').nullable()
// table.timestamp('created_at', { useTz: true })
// table.timestamp('updated_at', { useTz: true })
export default class OrgAddOn extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column() declare orgId: string
  @column() declare addOnId: string
  @column() declare status: 'active' | 'cancelled' | 'expired'
  @column() declare stripeSubscriptionItemId: string
  @column() declare stripeSubscriptionId: string
  @column() declare quantity: number
  @column() declare usageConsumed: number // e.g. remaining SMS credits
  @column() declare startsAt: DateTime
  @column() declare endsAt: DateTime
  @column() declare metadata: ModelObject
  @belongsTo(() => Org) declare org: BelongsTo<typeof Org>
  @belongsTo(() => Addon) declare addOn: BelongsTo<typeof Addon>
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
