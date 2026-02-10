import vine from '@vinejs/vine'
import { worker } from '#boss/base'
import BackupService from '#services/backup_service'

export const backup = worker
  .createJob('backup')
  .input(
    vine.object({
      database: vine.enum(['prod', 'dev']),
    }),
  )
  .retry({ limit: 10, backoff: true, delay: 10 })
  .deadLetter('failed-backup')

backup.work(async (payload) => {
  const backupService = new BackupService()
  await backupService.createBackup(payload.database)
})
