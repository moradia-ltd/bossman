import { BaseTransformer } from '@adonisjs/core/transformers'

import type Org from '#models/org'

export default class OrgTransformer extends BaseTransformer<Org> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'name',
      'description',
      'settings',
      'planId',
      'subscriptionId',
      'customPlanFeatures',
      'paymentCustomerId',
      'isMainOrg',
      'ownerRole',
      'creatorEmail',
      'parentOrgId',
      'hasActiveSubscription',
      'isSalesOrg',
      'pages',
      'companyName',
      'companyWebsite',
      'companyEmail',
      'country',
      'isWhiteLabelEnabled',
      'whiteLabelDetails',
      'customPaymentSchedule',
      'isFavourite',
      'isTestAccount',
      'companyLogo',
      'companyFavicon',
      'cleanName',
      'email',
      'createdAt',
      'updatedAt',
    ])
  }
}
