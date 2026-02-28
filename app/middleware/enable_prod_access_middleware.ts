import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { AppEnv } from '#types/env'

/**
 * Shares enableProdAccess for Inertia so the sidebar can hide the environment switcher.
 * When user has prod access but is not a god admin, they are "prod only": force appEnv to prod
 * and hide the environment switcher so they only see production data.
 * Must run after auth is available (e.g. after silent_auth).
 */
export default class EnableProdAccessMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user
    const enableProdAccess = Boolean(user?.enableProdAccess ?? user?.isGodAdmin ?? false)
    /** Only god admins can switch between dev and prod; prod-only users see only prod. */
    const showEnvironmentSwitcher = Boolean(user?.isGodAdmin ?? false)

    if (user && enableProdAccess && !user.isGodAdmin) {
      // Prod-only user: lock to prod so they only see production information
      const prod: AppEnv = 'prod'
      ;(ctx.request as { _appEnv?: AppEnv })._appEnv = prod
      ctx.session?.put('appEnv', prod)
    }

    ctx.inertia.share({ enableProdAccess, showEnvironmentSwitcher })
    await next()
  }
}
