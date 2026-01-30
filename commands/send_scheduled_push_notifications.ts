/**
 * Send pending push notifications that are due (scheduled_at <= now).
 * Run via cron every minute for scheduled sends, e.g.:
 *   * * * * * cd /path/to/app && node ace push:send-scheduled
 */
import { BaseCommand } from '@adonisjs/core/ace'
import db from '@adonisjs/lucid/services/db'
import PushNotification from '#models/push_notification'
import { sendOneSignalPush } from '#services/one_signal_service'
import env from '#start/env'

export default class SendScheduledPushNotifications extends BaseCommand {
  static commandName = 'push:send-scheduled'
  static description = 'Send pending push notifications that are due (scheduled_at <= now)'

  static options = {
    startApp: true,
  }

  async run() {
    const appEnv = this.app.env.get('NODE_ENV') === 'production' ? 'prod' : 'dev'
    const conn = db.connection(appEnv)

    const now = new Date().toISOString()
    const pending = await PushNotification.query({ connection: appEnv })
      .where('status', 'pending')
      .whereNotNull('scheduled_at')
      .where('scheduled_at', '<=', now)
      .orderBy('scheduled_at', 'asc')
      .limit(50)

    if (pending.length === 0) {
      this.logger.info('No scheduled push notifications due.')
      return
    }

    this.logger.info(`Sending ${pending.length} scheduled push notification(s).`)

    for (const notification of pending) {
      try {
        const userIds = await this.resolveUserIds(
          notification.targetType,
          notification.targetUserIds,
          appEnv,
        )
        if (userIds.length === 0) {
          await notification.merge({ status: 'failed', errorMessage: 'No recipients' }).save()
          continue
        }
        const result = await sendOneSignalPush({
          appId: env.get('ONESIGNAL_APP_ID'),
          externalIds: userIds,
          heading: notification.title,
          content: notification.description,
          imageUrl: notification.imageUrl ?? undefined,
          url: notification.url ?? undefined,
        })
        await notification.merge({
          status: result.errors ? 'failed' : 'sent',
          sentAt: result.errors ? null : new Date(),
          oneSignalResponse: result as Record<string, unknown>,
          errorMessage: result.errors ? JSON.stringify(result.errors) : null,
        }).save()
        this.logger.info(`Notification ${notification.id}: ${result.errors ? 'failed' : 'sent'}`)
      } catch (err) {
        await notification.merge({
          status: 'failed',
          errorMessage: err instanceof Error ? err.message : String(err),
        }).save()
        this.logger.error(`Notification ${notification.id}: ${err}`)
      }
    }
  }

  private async resolveUserIds(
    targetType: string,
    targetUserIds: string[] | null,
    appEnv: string,
  ): Promise<string[]> {
    if (targetType === 'specific' && targetUserIds?.length) {
      return targetUserIds
    }
    const conn = db.connection(appEnv)
    const column =
      targetType === 'all_landlords'
        ? 'landlord_id'
        : targetType === 'all_tenants'
          ? 'tenant_id'
          : targetType === 'all_agencies'
            ? 'agency_id'
            : null
    if (targetType === 'all') {
      const result = await conn.rawQuery('SELECT id FROM users')
      const rows = result.rows as { id: string }[]
      return rows.map((r) => r.id)
    }
    if (column) {
      const result = await conn.rawQuery(
        `SELECT id FROM users WHERE ${column} IS NOT NULL AND ${column} != ''`,
      )
      const rows = result.rows as { id: string }[]
      return rows.map((r) => r.id)
    }
    return []
  }
}
