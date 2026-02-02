import env from '#start/env'

/**
 * PostgreSQL connection string for pg-boss.
 * Uses the same DB as the app (DEV_DB / PROD_DB) based on APP_ENV.
 */

export default {
  connectionString: env.get('ADMIN_DB'),
  /** pg-boss schema name (separate from app tables) */
  schema: 'pgboss',
}
