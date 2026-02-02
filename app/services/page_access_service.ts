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
  const membership = await TeamMember.query().where('user_id', userId).first()

  if (!membership) return null
  if (membership.role === 'owner') return null

  const pages = membership.allowedPages ?? null
  if (!pages?.length) return null

  const set = new Set<PageKey>()
  for (const p of pages) {
    if (PAGE_KEYS_SET.has(p)) set.add(p as PageKey)
  }
  const merged = Array.from(set)
  return merged.length ? merged : null
}
