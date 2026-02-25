import logger from '@adonisjs/core/services/logger'

import { registerCrons } from '#boss/crons'
import { loadJobs } from '#boss/jobs'

/**
 * Load all job definitions and start boss (create queues, register crons).
 * This module is preloaded so the server does not accept requests until boss is ready.
 */
await loadJobs()
await registerCrons().catch((err) => {
  logger.error(err, 'Boss crons failed to register')
})
