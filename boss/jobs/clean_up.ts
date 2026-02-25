import vine from '@vinejs/vine'

import { worker } from '#boss/base'

export const cleanUp = worker
  .createJob('clean-up')
  .input(vine.object({ database: vine.string() }))
  .retry({ limit: 10, backoff: true, delay: 10 })
  .deadLetter('failed-cleanup')
