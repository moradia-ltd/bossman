import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { getPageAccessForUser } from '#services/page_access_service'
import { PAGE_KEY_TO_PATH, requiredPageKeyForPath } from '#utils/page_access'

export default class PageAccessMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user
    const hasAppRole = user?.role === 'admin' || user?.role === 'super_admin'

    if (!hasAppRole || !user) return next()

    const rawUrl = String(ctx.request.url() || '/')
    const pathname = rawUrl.split('?')[0]?.split('#')[0] || '/'

    const allowed = await getPageAccessForUser(user.id)
    if (!allowed) return next()

    const requiredKey = requiredPageKeyForPath(pathname)
    if (allowed.includes(requiredKey)) return next()

    const redirectTo = allowed.map((k) => PAGE_KEY_TO_PATH[k]).find(Boolean) || '/dashboard'

    if (ctx.request.url().startsWith('/api/')) {
      return ctx.response.forbidden({ error: 'You do not have access to this page.' })
    }

    return ctx.response.redirect(redirectTo)
  }
}
