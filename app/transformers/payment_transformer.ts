import { BaseTransformer } from '@adonisjs/core/transformers'
import type Payment from '#models/payment'

export default class PaymentTransformer extends BaseTransformer<Payment> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'leaseId',
      'amountPaid',
      'amountDue',
      'description',
      'reference',
      'currencyCode',
      'paymentMethod',
      'orgId',
      'status',
      'createdAt',
      'updatedAt',
    ])
  }
}
