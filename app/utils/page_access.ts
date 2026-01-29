export const PAGE_KEYS = ['dashboard', 'teams', 'blog'] as const

export type PageKey = (typeof PAGE_KEYS)[number]

export const PAGE_KEY_TO_PATH: Record<PageKey, string> = {
  dashboard: '/dashboard',
  teams: '/teams',
  blog: '/blog/manage',
}

export function requiredPageKeyForPath(pathname: string): PageKey {
  const path = `/${String(pathname || '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')}`

  if (path === '/dashboard') return 'dashboard'
  if (path.startsWith('/teams')) return 'teams'
  if (path.startsWith('/blog/manage')) return 'blog'

  return 'dashboard'
}
