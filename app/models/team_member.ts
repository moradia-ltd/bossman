import { belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { DateTime } from 'luxon'
import SuperBaseModel from './super_base.js'
import Team from './team.js'
import User from './user.js'

export type TeamRole = 'owner' | 'admin' | 'member'

export default class TeamMember extends SuperBaseModel {
  static table = 'team_members'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare teamId: string

  @column()
  declare userId: string

  @column()
  declare role: TeamRole

  /**
   * Allowed admin page keys for this member (only used for admin teams).
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

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Team)
  declare team: BelongsTo<typeof Team>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
