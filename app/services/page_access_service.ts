import TeamMember from '#models/team_member'
import { PAGE_KEYS, type PageKey } from '#utils/page_access'

const PAGE_KEYS_SET = new Set<string>(PAGE_KEYS)

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
    const pages = m.allowedPages ?? null
    if (!pages?.length) continue
    for (const p of pages) {
      if (PAGE_KEYS_SET.has(p)) set.add(p as PageKey)
    }
  }

  const merged = Array.from(set)
  return merged.length ? merged : null
}
