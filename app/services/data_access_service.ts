import { DateTime } from 'luxon'
import TeamMember from '#models/team_member'

export type AppEnv = 'dev' | 'prod'

export interface DataAccessFilter {
  propertiesMode: 'all' | 'selected'
  leasesMode: 'all' | 'selected'
  allowedLeaseableEntityIds: string[] | null
  allowedLeaseIds: string[] | null
  /** DB connection to use for lease/property queries so IDs match the env they were selected from. */
  effectiveAppEnv: AppEnv
  /** When true, the user sees no properties/leases because data_access_expires_at has passed. */
  dataAccessExpired?: boolean
  /** ISO date when access expired; for display on properties/leases index. */
  dataAccessExpiredAt?: string
}

/**
 * Returns data access for the user if they are a team member with restricted access.
 * - `null` = full access (no filter)
 * - Otherwise returns per-resource modes and allowed id lists.
 * When data_access_expires_at is set and in the past, returns a filter with no properties/leases (member sees none).
 * When restricted, effectiveAppEnv is the member's env (enableProdAccess ? 'prod' : 'dev').
 */
export async function getDataAccessForUser(userId: string): Promise<DataAccessFilter | null> {
  const membership = await TeamMember.query().where('user_id', userId).first()

  if (!membership) return null
  if (membership.role === 'owner') return null

  const effectiveAppEnv: AppEnv = membership.enableProdAccess ? 'prod' : 'dev'

  // Optional time limit on data access: after this time they see no properties/leases
  const now = DateTime.utc()
  if (membership.dataAccessExpiresAt && membership.dataAccessExpiresAt <= now) {
    return {
      propertiesMode: 'selected',
      leasesMode: 'selected',
      allowedLeaseableEntityIds: [],
      allowedLeaseIds: [],
      effectiveAppEnv,
      dataAccessExpired: true,
      dataAccessExpiredAt: membership.dataAccessExpiresAt.toISO(),
    }
  }

  const propertiesMode = membership.propertiesAccessMode ?? membership.dataAccessMode ?? 'all'
  const leasesMode = membership.leasesAccessMode ?? membership.dataAccessMode ?? 'all'
  if (propertiesMode === 'all' && leasesMode === 'all') return null

  return {
    propertiesMode,
    leasesMode,
    allowedLeaseableEntityIds:
      propertiesMode === 'selected' ? (membership.allowedLeaseableEntityIds ?? null) : null,
    allowedLeaseIds: leasesMode === 'selected' ? (membership.allowedLeaseIds ?? null) : null,
    effectiveAppEnv,
  }
}
