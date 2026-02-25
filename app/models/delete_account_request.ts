import { belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { DateTime } from 'luxon'

import Org from './org.js'
import SuperBaseModel from './super_base.js'

export default class DeleteAccountRequest extends SuperBaseModel {
  @column()
  declare orgId: string

  @column()
  declare isSuccessful: boolean

  @column({ serializeAs: null })
  declare tokenHash: string

  @column.dateTime()
  declare expiresAt: DateTime

  @belongsTo(() => Org)
  declare org: BelongsTo<typeof Org>
}
