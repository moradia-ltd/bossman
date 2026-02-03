import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'
import { getPageAccessForUser } from '#services/page_access_service'
import env from '#start/env'

const inertiaConfig = defineConfig({
  /**
   * Path to the Edge view that will be used as the root view for Inertia responses
   */
  rootView: 'inertia_layout',

  /**
   * Data that should be shared with all rendered pages
   */
  sharedData: {
    user: (ctx) => ctx.inertia.always(() => ctx.auth?.user),
    appEnv: (ctx) => (ctx.session?.get('appEnv') as 'dev' | 'prod' | undefined) ?? 'dev',
    isDev: () => env.get('NODE_ENV') === 'development',
    pageAccess: (ctx) =>
      ctx.inertia.always(async () => {
        const user = ctx.auth?.user
        if (!user?.id) return null
        if (!user.isAdminOrSuperAdmin) return null
        return await getPageAccessForUser(user.id)
      }),
    nodeEnv: () => env.get('NODE_ENV'),
    params: (ctx) => ctx.request.params(),
    errors: (ctx) => ctx.session?.flashMessages.get('errors'),
    qs: async (ctx) => ({
      ...ctx.request.qs(),
      ...(app.inTest ? {} : await ctx.request?.paginationQs()),
    }),
    isLoggedIn: (ctx) => ctx.inertia.always(() => ctx.auth?.isAuthenticated ?? false),
  },

  /**
   * Options for the server-side rendering
   */
  ssr: {
    enabled: false,
    entrypoint: 'inertia/app/ssr.tsx',
  },
})

export default inertiaConfig

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
