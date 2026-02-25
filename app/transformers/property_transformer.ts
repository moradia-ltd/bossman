import { BaseTransformer } from '@adonisjs/core/transformers'

import type Property from '#models/property'

export default class PropertyTransformer extends BaseTransformer<Property> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'orgId',
      'landlordId',
      'addressLineOne',
      'addressLineTwo',
      'city',
      'postCode',
      'state',
      'country',
      'propertyType',
      'noOfUnits',
      'noOfFloors',
      'leaseableEntityId',
      'createdAt',
      'updatedAt',
    ])
  }
}
