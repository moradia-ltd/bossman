import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'
import env from '#start/env'

const dbConfig = defineConfig({
  connection: 'sqlite',

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

    sqlite: {
      client: 'better-sqlite3',
      connection: {
        filename: app.tmpPath('db.sqlite3'),
      },
      useNullAsDefault: true,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig
