import { readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const jobDir = join(__dirname, 'jobs')

/**
 * Load all job modules from boss/jobs/ so their work handlers register with boss.
 * Call before registerCrons() / worker.ensureStarted().
 * Add a new .ts file under boss/jobs/ and it will be picked up automatically (after build).
 */
export async function loadJobs(): Promise<void> {
  const files = readdirSync(jobDir).filter(
    (f) => (f.endsWith('.js') || f.endsWith('.ts')) && !f.startsWith('.'),
  )
  for (const file of files) {
    await import(pathToFileURL(join(jobDir, file)).href)
  }
}
