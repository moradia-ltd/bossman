import { BaseTransformer } from '@adonisjs/core/transformers'
import type Session from '#models/session'

export default class SessionTransformer extends BaseTransformer<Session> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'userId',
      'ipAddress',
      'userAgent',
      'expiresAt',
      'createdAt',
      'updatedAt',
    ])
  }
}
