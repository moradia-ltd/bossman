import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import type { DebugStore } from 'adonisjs-server-stats/debug'
import PackageDebugController from 'adonisjs-server-stats/debug/controller'

export default class DebugController {
  async #controller() {
    const store = (await app.container.make('debug.store')) as DebugStore
    return new PackageDebugController(store)
  }

  async queries(ctx: HttpContext) {
    return (await this.#controller()).queries(ctx)
  }

  async events(ctx: HttpContext) {
    return (await this.#controller()).events(ctx)
  }

  async routes(ctx: HttpContext) {
    return (await this.#controller()).routes(ctx)
  }

  async emails(ctx: HttpContext) {
    return (await this.#controller()).emails(ctx)
  }

  async emailPreview(ctx: HttpContext) {
    return (await this.#controller()).emailPreview(ctx)
  }

  async traces(ctx: HttpContext) {
    return (await this.#controller()).traces(ctx)
  }

  async traceDetail(ctx: HttpContext) {
    return (await this.#controller()).traceDetail(ctx)
  }
}
