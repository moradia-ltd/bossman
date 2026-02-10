import { worker } from '#boss/base'
import { backup } from '#boss/jobs/backup'
import schedules from './schedules.js'

/**
 * Register all recurring cron schedules. Call after jobs are loaded (e.g. from start/events).
 * Starts boss if not already started, then registers each cron.
 */
export async function registerCrons(): Promise<void> {
  await worker.ensureStarted()

  await backup.scheduleCron(schedules.EVERY_6_HOURS, { database: 'prod' })
}
