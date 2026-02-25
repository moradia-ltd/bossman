import app from '@adonisjs/core/services/app'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/** Skip session for the stats bar poll only; debug panel needs session to work. */
const SKIP_SESSION_PATHS = ['/admin/api/server-stats']

function shouldSkipSession(url: string): boolean {
  let path = url.includes('?') ? url.slice(0, url.indexOf('?')) : url
  try {
    if (path.startsWith('http')) path = new URL(path).pathname
  } catch {
    // leave path as-is
  }
  return SKIP_SESSION_PATHS.some((p) => path === p || path.startsWith(p + '/'))
}

/**
 * Runs the session middleware only for routes that need it.
 * Skips session for the server-stats polling route so session:committed does not fire every poll.
 */
export default class ConditionalSessionMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (shouldSkipSession(ctx.request.url())) {
      return next()
    }
    const SessionMiddleware = (await import('@adonisjs/session/session_middleware')).default
    const sessionMiddleware = await app.container.make(SessionMiddleware)
    return sessionMiddleware.handle(ctx, next)
  }
}
