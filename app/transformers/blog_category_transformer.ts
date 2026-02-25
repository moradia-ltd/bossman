import { BaseTransformer } from '@adonisjs/core/transformers'

import type BlogCategory from '#models/blog_category'

export default class BlogCategoryTransformer extends BaseTransformer<BlogCategory> {
  toObject() {
    return this.pick(this.resource, ['id', 'name', 'slug', 'description', 'createdAt', 'updatedAt'])
  }
}
