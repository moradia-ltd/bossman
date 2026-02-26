import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

import BlogCategory from '#models/blog_category'
import BlogPost from '#models/blog_post'
import BlogCategoryTransformer from '#transformers/blog_category_transformer'
import BlogPostTransformer from '#transformers/blog_post_transformer'
import { createBlogPostValidator, updateBlogPostValidator } from '#validators/blog'

export default class BlogPostsController {
  async index({ request, inertia }: HttpContext) {
    const params = await request.paginationQs()
    const posts = await BlogPost.query()
      .whereNotNull('publishedAt')
      .preload('category')
      .orderBy('publishedAt', 'desc')
      .if(params.search, (q) => q.whereILike('title', `%${params.search}%`))
      .sortBy(params.sortBy || 'publishedAt', params.sortOrder || 'desc')
      .paginate(params.page || 1, params.perPage || 12)

    return inertia.render('blog/index', {
      posts: inertia.defer(async () => {
        const p = await posts
        return BlogPostTransformer.paginate(p.all(), p.getMeta()) as never
      }) as never,
    })
  }

  async show({ params, inertia, response }: HttpContext) {
    const post = await BlogPost.query()
      .where('slug', params.slug)
      .whereNotNull('published_at')
      .preload('category')
      .first()

    if (!post) return response.notFound({ error: 'Post not found' })

    return inertia.render('blog/show', { post: BlogPostTransformer.transform(post) as never })
  }

  async adminIndex({ request, inertia }: HttpContext) {
    const params = await request.paginationQs()
    const posts = await BlogPost.query()
      .preload('category')
      .orderBy('createdAt', 'desc')
      .if(params.search, (q) => {
        const term = `%${params.search}%`
        q.whereILike('title', term).orWhereILike('summary', term)
      })
      .sortBy(params.sortBy || 'createdAt', params.sortOrder || 'desc')
      .paginate(params.page || 1, params.perPage || 10)

    return inertia.render('blog/manage/index', {
      posts: inertia.defer(async () => {
        const p = await posts
        return BlogPostTransformer.paginate(p.all(), p.getMeta()) as never
      }),
    })
  }

  async create({ inertia }: HttpContext) {
    const categories = await BlogCategory.query().orderBy('name', 'asc')

    return inertia.render('blog/manage/create', {
      categories: BlogCategoryTransformer.transform(categories) as never,
    })
  }

  async edit({ params, inertia, response }: HttpContext) {
    const post = await BlogPost.query()
      .where('id', params.id)
      .preload('category')
      .first()

    if (!post) return response.notFound({ error: 'Post not found' })

    const categories = await BlogCategory.query().orderBy('name', 'asc')

    return inertia.render('blog/manage/edit', {
      post: BlogPostTransformer.transform(post) as never,
      categories: BlogCategoryTransformer.transform(categories) as never,
    })
  }

  async store({ request, response }: HttpContext) {
    const { publish, ...body } =
      await request.validateUsing(createBlogPostValidator)

    const trx = await db.transaction()
    try {
      const post = await BlogPost.create(body, { client: trx })

      if (publish) post.publishedAt = DateTime.now()
      await post.save()

      await trx.commit()
      return response.redirect('/blog/manage')
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async update({ params, request, response }: HttpContext) {
    const { publish, ...body } =
      await request.validateUsing(updateBlogPostValidator)
    const trx = await db.transaction()
    const post = await BlogPost.findOrFail(params.id, { client: trx })

    try {
      post.merge(body)

      post.publishedAt = publish ? (post.publishedAt ?? DateTime.now()) : null

      await post.save()

      await trx.commit()
      return response.redirect('/blog/manage')
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async destroy({ params, response }: HttpContext) {
    const post = await BlogPost.findOrFail(params.id)
    await post.delete()
    return response.redirect('/blog/manage')
  }
}
