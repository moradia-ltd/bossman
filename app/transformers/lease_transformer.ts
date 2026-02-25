import { BaseTransformer } from '@adonisjs/core/transformers'

import type Lease from '#models/lease'
import OrgTransformer from '#transformers/org_transformer'

export default class LeaseTransformer extends BaseTransformer<Lease> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'rentAmount',
        'shortId',
        'name',
        'cleanName',
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
      ]),
      org: OrgTransformer.transform(this.whenLoaded(this.resource.org)),
    }
  }
}
