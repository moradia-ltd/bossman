import TeamMember from '#models/team_member'

export interface DataAccessFilter {
  mode: 'all' | 'selected'
  allowedLeaseableEntityIds: string[] | null
  allowedLeaseIds: string[] | null
}

/**
 * Returns data access for the user if they are a team member with restricted access.
 * - `null` = full access (no filter)
 * - `DataAccessFilter` with mode 'all' = full access
 * - `DataAccessFilter` with mode 'selected' = restrict to allowed ids (empty array = no access)
 */
export async function getDataAccessForUser(userId: string): Promise<DataAccessFilter | null> {
  const membership = await TeamMember.query().where('user_id', userId).first()

  if (!membership) return null
  if (membership.role === 'owner') return null
  if (membership.dataAccessMode === 'all') return null

  return {
    mode: membership.dataAccessMode,
    allowedLeaseableEntityIds: membership.allowedLeaseableEntityIds ?? null,
    allowedLeaseIds: membership.allowedLeaseIds ?? null,
  }
}
