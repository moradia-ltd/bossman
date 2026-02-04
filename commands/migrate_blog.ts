import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import axios from 'axios'
import env from '#start/env'

export const strapiUrl = 'https://cms.togetha.co.uk/api'
const strapiOptions = {
  headers: {
    Authorization: `Bearer ${env.get('STRAPI_API')}`,
  },
}

const strapiApi = axios.create({
  baseURL: strapiUrl,
  headers: strapiOptions.headers,
})
export async function getAllBlogs() {
  try {
    const response = await strapiApi.get(
      `/blog-posts?pagination[pageSize]=100&sort=publishedAt:desc`,
    )

    const blog = response?.data

    return blog
  } catch (error) {
    console.error(error)
  }
}

export default class MigrateBlog extends BaseCommand {
  static commandName = 'migrate:blog'
  static description = 'Migrate blog posts from Strapi to Adonis'

  static options: CommandOptions = {}

  async run() {
    const blogPosts = await getAllBlogs()
    console.log(blogPosts.data)
  }
}
