import app from '@adonisjs/core/services/app'
import { defineConfig, services } from '@adonisjs/drive'

import env from '#start/env'

const driveConfig = defineConfig({
  default: env.get('DRIVE_DISK'),

  /**
   * The services object can be used to configure multiple file system
   * services each using the same or a different driver.
   */
  services: {
    fs: services.fs({
      location: app.makePath('storage'),
      serveFiles: true,
      routeBasePath: '/uploads',
      visibility: 'public',
    }),

    blog: services.s3({
      credentials: {
        accessKeyId: 'ee3f7ae12e7ca5012aefed83c6dca5c8',
        secretAccessKey: '6586c7c9a5bb838cefb3fed9b560418006ff4c3e18255c58230b3fb3a6c0dd2b',
      },
      region: 'WEUR',
      bucket: 'strapi-togetha',
      endpoint: env.get('R2_ENDPOINT'),
      // Use the public endpoint for URL generation
      visibility: 'private',
    }),

    backup: services.s3({
      credentials: {
        accessKeyId: 'ee3f7ae12e7ca5012aefed83c6dca5c8',
        secretAccessKey: '6586c7c9a5bb838cefb3fed9b560418006ff4c3e18255c58230b3fb3a6c0dd2b',
        // accessKeyId: env.get('R2_KEY'),
        // secretAccessKey: env.get('R2_SECRET'),
      },
      region: 'WEUR',
      bucket: 'togetha-backups',
      endpoint: env.get('R2_ENDPOINT'),
      // Use the public endpoint for URL generation
      visibility: 'private',
    }),
  },
})

export default driveConfig

declare module '@adonisjs/drive/types' {
  export interface DriveDisks extends InferDriveDisks<typeof driveConfig> {}
}
