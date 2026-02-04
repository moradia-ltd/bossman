import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AppRoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user
    const hasAppRole = user?.isAdminOrSuperAdmin

    if (!hasAppRole) {
      if (ctx.request.url().startsWith('/api/')) {
        return ctx.response.forbidden({ error: 'Access required' })
      }
      // Redirect to home, not /login — user is authenticated; redirecting to /login
      // would trigger guest middleware to send them back here and cause a loop.
      return ctx.response.redirect('/login')
    }

    return next()
  }
}
