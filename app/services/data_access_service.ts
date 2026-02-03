import TeamMember from '#models/team_member'

export type AppEnv = 'dev' | 'prod'

export interface DataAccessFilter {
  propertiesMode: 'all' | 'selected'
  leasesMode: 'all' | 'selected'
  allowedLeaseableEntityIds: string[] | null
  allowedLeaseIds: string[] | null
  /** DB connection to use for lease/property queries so IDs match the env they were selected from. */
  effectiveAppEnv: AppEnv
}

/**
 * Returns data access for the user if they are a team member with restricted access.
 * - `null` = full access (no filter)
 * - Otherwise returns per-resource modes and allowed id lists.
 * When restricted, effectiveAppEnv is the member's env (enableProdAccess ? 'prod' : 'dev')
 * so lease/property IDs selected by the admin match the DB the member sees.
 */
export async function getDataAccessForUser(userId: string): Promise<DataAccessFilter | null> {
  const membership = await TeamMember.query().where('user_id', userId).first()

  if (!membership) return null
  if (membership.role === 'owner') return null

  const propertiesMode = membership.propertiesAccessMode ?? membership.dataAccessMode ?? 'all'
  const leasesMode = membership.leasesAccessMode ?? membership.dataAccessMode ?? 'all'
  if (propertiesMode === 'all' && leasesMode === 'all') return null

  const effectiveAppEnv: AppEnv = membership.enableProdAccess ? 'prod' : 'dev'

  return {
    propertiesMode,
    leasesMode,
    allowedLeaseableEntityIds:
      propertiesMode === 'selected' ? (membership.allowedLeaseableEntityIds ?? null) : null,
    allowedLeaseIds: leasesMode === 'selected' ? (membership.allowedLeaseIds ?? null) : null,
    effectiveAppEnv,
  }
}
