import { Request } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import type { QueryParams } from '#utils/vine'
import { validateQueryParams } from '#utils/vine'

type AppEnv = 'dev' | 'prod'

Request.macro('appEnv', function (this: Request): AppEnv {
  const fromSession = (this as Request & { _appEnv?: string })._appEnv
  if (fromSession === 'dev' || fromSession === 'prod') return fromSession
  const headers = this.headers()
  const appEnv = headers['app-env'] || headers['appenv'] || 'dev'
  return appEnv as AppEnv
})

Request.macro('timeZone', function (this: Request): string {
  const headers = this.headers()
  const timezone = headers['Timezone'] || ''
  return timezone?.toString()
})

Request.macro('userDateTime', function (this: Request): DateTime {
  const timezone = this.timeZone()
  const dateTime = DateTime.now().setZone(timezone)
  return dateTime
})

Request.macro('appDateTime', function (this: Request): DateTime {
  const timezone = 'Europe/London'

  const dateTime = DateTime.now().setZone(timezone)
  return dateTime
})

Request.macro('paginationQs', async function (this: Request) {
  return await validateQueryParams(this.qs())
})

declare module '@adonisjs/core/http' {
  interface Request {
    appEnv(): AppEnv
    /** Set by enable_prod_access_middleware for Inertia sharedData. When false, hide env switcher. */

    timeZone(): string
    userDateTime(): DateTime
    appDateTime(): DateTime
    paginationQs(): Promise<QueryParams>
    authHeader(data: {}): Record<string, string>
  }
  interface Response {}
}
