import TeamMember from '#models/team_member'
import type { PageKey } from '#utils/page_access'

/**
 * Returns the allowed page keys for the user.
 *
 * - `null` means "unrestricted" (full access)
 * - `PageKey[]` means "restricted to these pages"
 */
export async function getPageAccessForUser(userId: string): Promise<PageKey[] | null> {
  const memberships = await TeamMember.query()
    .where('user_id', userId)
    .whereHas('team', (q) => q.where('kind', 'admin'))

  if (!memberships.length) return null
  if (memberships.some((m) => m.role === 'owner')) return null

  const set = new Set<PageKey>()
  for (const m of memberships) {
    const pages = m.adminPages ?? null
    if (!pages?.length) continue
    for (const p of pages) {
      const key = mapLegacyPageKey(p)
      set.add(key)
    }
  }

  const merged = Array.from(set)
  return merged.length ? merged : null
}

function mapLegacyPageKey(value: string): PageKey {
  if (value === 'admin_dashboard') return 'dashboard'
  if (value === 'admin_teams') return 'teams'
  if (value === 'admin_blog') return 'blog'
  return value as PageKey
}
