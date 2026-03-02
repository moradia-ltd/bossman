import fs from 'fs'

import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import axios from 'axios'

import env from '#start/env'

const strapi = axios.create({
  baseURL: 'https://cms.togetha.co.uk/api',
  headers: { Authorization: `Bearer ${env.get('STRAPI_API')}` },
})

export default class MigrateVideo extends BaseCommand {
  static commandName = 'migrate:video'
  static description = ''

  static options: CommandOptions = {}

  async run() {
    const response = await strapi.get('/videos?pagination[pageSize]=100&sort=publishedAt:desc')
    const videos = response.data.data
    this.logger.info(`Found ${videos.length} videos`)

    fs.writeFileSync('videos.json', JSON.stringify(videos, null, 2))
  }
}
