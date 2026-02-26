import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import axios from 'axios'

import BlogPost from '#models/blog_post'
import env from '#start/env'

const strapi = axios.create({
  baseURL: 'https://cms.togetha.co.uk/api',
  headers: { Authorization: `Bearer ${env.get('STRAPI_API')}` },
})

export default class MigrateBlogs extends BaseCommand {
  static commandName = 'migrate:blogs'
  static description = ''

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const response = await strapi.get('/blog-posts?pagination[pageSize]=100&sort=publishedAt:desc')
    const blogPosts = response.data.data
    this.logger.info(`Found ${blogPosts.length} blog posts`)

    for (const blogPost of blogPosts) {
      const actualPost = blogPost.attributes
      this.logger.info(`About to migrate blog post  ${actualPost.slug}`)
      try {
        const post = await BlogPost.firstOrCreate(
          { slug: actualPost.slug },
          {
            title: actualPost.title,
            body: actualPost.body,
            slug: actualPost.slug,
            excerpt: actualPost.description || actualPost.summary,
            publishedAt: actualPost.publishedAt,
            coverImageAltUrl: actualPost.cover_image_alt_url,
            createdAt: actualPost.createdAt,
            updatedAt: actualPost.updatedAt,
          },
          { connection: 'dev' },
        )

        this.logger.success(`Migrated blog post ${post.title}`)
      } catch (err) {
        console.error(err)
        this.logger.info(`Error migrating blog post ${blogPost.title}`)
      }
    }

    process.exit(0)
  }
}
