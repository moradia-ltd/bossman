import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AppRoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user
    const hasAppRole = user && (user as { role?: string }).role === 'admin'

    if (!hasAppRole) {
      if (ctx.request.url().startsWith('/api/')) {
        return ctx.response.forbidden({ error: 'Access required' })
      }
      return ctx.response.redirect('/login')
    }

    return next()
  }
}
