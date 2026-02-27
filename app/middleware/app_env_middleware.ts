import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { AppEnv } from '#types/env'

/**
 * Sets appEnv on the request from session (or App-Env header fallback) so request.appEnv() works.
 * Must run after session middleware.
 */
export default class AppEnvMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const appEnv =
      (ctx.session?.get('appEnv') as AppEnv | undefined) ??
      (ctx.request.header('app-env') as AppEnv | undefined) ??
      'dev'
    ;(ctx.request as { _appEnv?: AppEnv })._appEnv = appEnv
    await next()
  }
}
