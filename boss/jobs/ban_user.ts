import logger from '@adonisjs/core/services/logger'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'
import { worker } from '#boss/base'
import AccountBan from '#models/account_ban'

export const banUser = worker
  .createJob('ban-user')
  .input(
    vine.object({
      orgId: vine.string(),
      userId: vine.string(),
      reason: vine.string(),
      metadata: vine
        .object({
          accountBannedBy: vine.object({
            id: vine.string(),
            name: vine.string(),
            email: vine.string(),
          }),
        })
        .optional(),
      banStartsAt: vine.string().optional(),
      connection: vine.string(),
    }),
  )
  .retry({ limit: 3, backoff: true, delay: 60 })
  .deadLetter('failed-ban-user')

banUser.work(async (payload) => {
  logger.info(`Ban user job for  userId=${payload.userId}, reason=${payload.reason}`)

  const ban = await AccountBan.create(
    {
      userId: payload.userId,
      orgId: payload.orgId,
      reason: payload.reason,
      metadata: {
        ...payload.metadata,
        accountBannedBy: {
          id: payload.userId,
          name: payload.metadata?.accountBannedBy?.name,
          email: payload.metadata?.accountBannedBy?.email,
        },
      },
      banStartsAt: DateTime.fromISO(payload.banStartsAt ?? ''),
    },
    { connection: payload.connection },
  )
  // TODO: perform actual ban (e.g. disable user/org in DB, revoke sessions)
})
