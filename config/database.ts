import { defineConfig } from '@adonisjs/lucid'

import env from '#start/env'

const dbConfig = defineConfig({
  connection: 'default',

  connections: {
    dev: {
      client: 'pg',
      connection: env.get('DEV_DB'),
      debug: false,
    },
    prod: {
      client: 'pg',
      connection: env.get('PROD_DB'),
    },

    default: {
      client: 'pg',
      connection: env.get('ADMIN_DB'),
      useNullAsDefault: true,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig
