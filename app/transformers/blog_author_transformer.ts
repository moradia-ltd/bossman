import { BaseTransformer } from '@adonisjs/core/transformers'
import type BlogAuthor from '#models/blog_author'

export default class BlogAuthorTransformer extends BaseTransformer<BlogAuthor> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'name',
      'slug',
      'email',
      'avatarUrl',
      'bio',
      'createdAt',
      'updatedAt',
    ])
  }
}
