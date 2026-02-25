import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Paths that skip auth check to avoid a user DB lookup on every request.
 * - /admin/api/server-stats: stats bar polling
 * - /__transmit: Transmit SSE/subscribe (can fire very frequently)
 * Debug panel (/admin/api/debug) is not skipped so it keeps working.
 */
const SKIP_AUTH_PATHS = ['/admin/api/server-stats', '/__transmit']

function shouldSkipAuth(url: string): boolean {
  let path = url.includes('?') ? url.slice(0, url.indexOf('?')) : url
  try {
    if (path.startsWith('http')) path = new URL(path).pathname
  } catch {
    // leave path as-is
  }
  return SKIP_AUTH_PATHS.some(
    (p) => path === p || path.startsWith(p + '/') || path.endsWith(p) || path.endsWith(p + '/'),
  )
}

/**
 * Silent auth middleware can be used as a global middleware to silent check
 * if the user is logged-in or not.
 *
 * The request continues as usual, even when the user is not logged-in.
 * Skips the check for server-stats and Transmit routes to avoid a user lookup on every request.
 */
export default class SilentAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (!shouldSkipAuth(ctx.request.url())) {
      await ctx.auth.check()
    }

    return next()
  }
}
