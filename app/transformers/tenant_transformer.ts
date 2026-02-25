import { BaseTransformer } from '@adonisjs/core/transformers'
import type Tenant from '#models/tenant'

export default class TenantTransformer extends BaseTransformer<Tenant> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'name',
      'email',
      'phoneNumber',
      'shareCode',
      'dateOfBirth',
      'country',
      'sex',
      'isStudent',
      'metadata',
      'employment',
      'guarantor',
      'createdAt',
      'updatedAt',
    ])
  }
}
