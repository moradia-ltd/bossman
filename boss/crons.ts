import logger from '@adonisjs/core/services/logger'
import { worker } from '#boss/base'
import { cleanUp } from '#boss/jobs/clean_up'

/**
 * Register all recurring cron schedules. Call after jobs are loaded (e.g. from start/events).
 * Starts boss if not already started, then registers each cron.
 */
export async function registerCrons(): Promise<void> {
  await worker.ensureStarted()

  // Clean up: 9am every Monday
  await cleanUp.scheduleCron('0 9 * * 1', { database: 'database1' })
}
