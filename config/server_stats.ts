import { defineConfig } from 'adonisjs-server-stats'
import {
  appCollector,
  dbPoolCollector,
  httpCollector,
  logCollector,
  processCollector,
  systemCollector,
} from 'adonisjs-server-stats/collectors'

export default defineConfig({
  // How often to collect and broadcast stats (in milliseconds).
  // Higher = fewer HTTP requests and fewer session commits from the stats bar.
  shouldShow: (ctx) => ctx.auth.user?.isGodAdmin,
  intervalMs: 10_000,

  devToolbar: {
    enabled: true,
    tracing: true,
    dashboard: true,
    dashboardPath: 'stats',
    persistDebugData: true,
    excludeFromTracing: ['/admin/api/debug', '/__transmit/events', ' /stats/api/requests'],
  },

  // Real-time transport: 'transmit' for SSE via @adonisjs/transmit, 'none' for polling only
  transport: 'none',
  // Transmit channel name clients subscribe to
  channelName: 'admin/server-stats',
  // HTTP endpoint that serves the latest stats snapshot (set to false to disable)
  endpoint: '/admin/api/server-stats',

  collectors: [
    // CPU usage, event loop lag, heap/RSS memory, uptime, Node.js version
    processCollector(),
    // OS load averages, total/free system memory, system uptime
    systemCollector(),

    // Requests/sec, avg response time, error rate, active connections
    // maxRecords: size of the circular buffer for request tracking
    httpCollector({ maxRecords: 10_000 }),

    // Lucid connection pool: used/free/pending/max connections
    // Requires @adonisjs/lucid
    dbPoolCollector({ connectionName: 'default' }),

    // Log file stats: errors/warnings in a 5-minute window, entries/minute
    logCollector({ logPath: 'logs/adonisjs.log' }),
    // App-level metrics: online users, pending webhooks, pending emails
    // Requires @adonisjs/lucid
    appCollector(),
  ],
})
