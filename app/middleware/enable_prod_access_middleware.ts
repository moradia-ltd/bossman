import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Shares enableProdAccess for Inertia so the sidebar can hide the environment switcher.
 * Reads from user.enableProdAccess (synced from team member when applicable).
 * Must run after auth is available (e.g. after silent_auth).
 */
export default class EnableProdAccessMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user
    const enableProdAccess = user?.enableProdAccess || (user?.isGodAdmin as boolean)
    ctx.inertia.share({ enableProdAccess })
    await next()
  }
}
