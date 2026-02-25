import { BaseTransformer } from '@adonisjs/core/transformers'

import type BlogTag from '#models/blog_tag'

export default class BlogTagTransformer extends BaseTransformer<BlogTag> {
  toObject() {
    return this.pick(this.resource, ['id', 'name', 'slug', 'createdAt', 'updatedAt'])
  }
}
