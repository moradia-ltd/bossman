import { BaseTransformer } from '@adonisjs/core/transformers'
import type LeaseableEntity from '#models/leaseable_entity'

export default class LeaseableEntityTransformer extends BaseTransformer<LeaseableEntity> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'propertyId',
      'description',
      'unitId',
      'roomId',
      'type',
      'subType',
      'bedrooms',
      'bathrooms',
      'floor',
      'floorPlan',
      'size',
      'isFurnished',
      'isVacant',
      'isLetOnly',
      'isForSale',
      'isHmo',
      'address',
      'orgId',
      'metadata',
      'createdAt',
      'updatedAt',
    ])
  }
}
