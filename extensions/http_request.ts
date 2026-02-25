import { HttpRequest } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import type { QueryParams } from '#utils/vine'
import { validateQueryParams } from '#utils/vine'

type AppEnv = 'dev' | 'prod'

HttpRequest.macro('appEnv', function (this: HttpRequest): AppEnv {
  const fromSession = (this as HttpRequest & { _appEnv?: string })._appEnv
  if (fromSession === 'dev' || fromSession === 'prod') return fromSession
  const headers = this.headers()
  const appEnv = headers['app-env'] || headers['appenv'] || 'dev'
  return appEnv as AppEnv
})

HttpRequest.macro('timeZone', function (this: HttpRequest): string {
  const headers = this.headers()
  const timezone = headers['Timezone'] || ''
  return timezone?.toString()
})

HttpRequest.macro('userDateTime', function (this: HttpRequest): DateTime {
  const timezone = this.timeZone()
  const dateTime = DateTime.now().setZone(timezone)
  return dateTime
})

HttpRequest.macro('appDateTime', function (this: HttpRequest): DateTime {
  const timezone = 'Europe/London'

  const dateTime = DateTime.now().setZone(timezone)
  return dateTime
})

HttpRequest.macro('paginationQs', async function (this: HttpRequest) {
  return await validateQueryParams(this.qs())
})

declare module '@adonisjs/core/http' {
  interface HttpRequest {
    appEnv(): AppEnv
    timeZone(): string
    userDateTime(): DateTime
    appDateTime(): DateTime
    paginationQs(): Promise<QueryParams>
    authHeader(data: {}): Record<string, string>
  }
  interface HttpResponse {}
}
