import { BaseTransformer } from '@adonisjs/core/transformers'

import type Addon from '#models/addon'

export default class AddonTransformer extends BaseTransformer<Addon> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'name',
      'slug',
      'shortDescription',
      'longDescription',
      'priceAmount',
      'priceCurrency',
      'billingType',
      'features',
      'createdAt',
      'updatedAt',
    ])
  }
}
