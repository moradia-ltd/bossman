import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import TeamMember from '#models/team_member'

/**
 * Sets enableProdAccessForInertia on the request so Inertia sharedData can read it
 * synchronously. When false, the sidebar hides the environment switcher.
 * Must run after auth is available (e.g. after silent_auth).
 */
export default class EnableProdAccessMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user!

    const membership = await TeamMember.query().where('user_id', user.id).first()

    if (membership?.enableProdAccess || user.isGodAdmin) {
      ctx.inertia.share({ enableProdAccess: true })
      return next()
    } else {
      ctx.inertia.share({ enableProdAccess: false })
      await next()
    }
  }
}
