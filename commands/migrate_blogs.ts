import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import axios from 'axios'

import env from '#start/env'

const strapi = axios.create({
  baseURL: 'https://cms.togetha.co.uk/api',
  headers: { Authorization: `Bearer ${env.get('STRAPI_API')}` },
})

export default class MigrateBlogs extends BaseCommand {
  static commandName = 'migrate:blogs'
  static description = ''

  static options: CommandOptions = {}

  async run() {
    const response = await strapi.get('/blog-posts?pagination[pageSize]=100&sort=publishedAt:desc')
    const blogPosts = response.data.data[3]
    console.log('🚀 ~ MigrateBlogs ~ run ~ blogPosts:', blogPosts)
  }
}
