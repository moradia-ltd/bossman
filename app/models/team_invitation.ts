import { belongsTo, column, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import SuperBaseModel from './super_base.js'
import type { TeamRole } from './team_member.js'
import User from './user.js'

export default class TeamInvitation extends SuperBaseModel {
  static table = 'team_invitations'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare email: string

  @column()
  declare role: TeamRole

  @column()
  declare invitedUserRole: 'admin'

  @column({})
  declare enableProdAccess: boolean

  /**
   * Allowed admin page keys for this invite.
   * Stored as JSON in DB column allowed_pages.
   */
  @column({
    columnName: 'allowed_pages',
    prepare: (value: string[] | null) => (Array.isArray(value) ? JSON.stringify(value) : null),
    consume: (value: unknown) => {
      if (value == null) return null
      if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string')
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value)
          if (!Array.isArray(parsed)) return null
          return parsed.filter((v): v is string => typeof v === 'string')
        } catch {
          return null
        }
      }
      return null
    },
  })
  declare allowedPages: string[] | null

  @column({ serializeAs: null })
  declare tokenHash: string

  @column()
  declare invitedByUserId: string

  @column.dateTime()
  declare expiresAt: DateTime

  @column.dateTime()
  declare acceptedAt: DateTime | null

  @computed()
  get isExpired() {
    return this.expiresAt.toMillis() < DateTime.now().toMillis()
  }

  @column()
  declare acceptedByUserId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'invitedByUserId' })
  declare invitedBy: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'acceptedByUserId' })
  declare acceptedBy: BelongsTo<typeof User>
}
