import { BaseTransformer } from '@adonisjs/core/transformers'
import type Lease from '#models/lease'

export default class LeaseTransformer extends BaseTransformer<Lease> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'rentAmount',
      'shortId',
      'name',
      'depositAmount',
      'depositPaymentDate',
      'status',
      'frequency',
      'contractUrl',
      'paymentDay',
      'leaseableEntityId',
      'depositDueDate',
      'propertyId',
      'unitId',
      'roomId',
      'currency',
      'isManuallyCreated',
      'orgId',
      'tenantId',
      'startDate',
      'endDate',
      'earlyTerminationDate',
      'isPermanentlyRolling',
      'archivedAt',
      'approval',
      'application',
      'rollingStatus',
      'createdAt',
      'updatedAt',
    ])
  }
}
