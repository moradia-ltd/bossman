import vine from '@vinejs/vine'

const featureList = vine.object({
  propertyLimit: vine.number(),
  tenantLimit: vine.number(),
  storageLimit: vine.number(),
  teamSizeLimit: vine.number(),
  prioritySupport: vine.boolean(),
  activityLogRetention: vine.number(),
  depositProtection: vine.boolean(),
  advancedReporting: vine.boolean(),
  eSignDocsLimit: vine.number(),
  aiInvocationLimit: vine.number(),
  customTemplatesLimit: vine.number(),
})

const pages = vine.object({
  orgPages: vine.array(
    vine.object({
      label: vine.string(),
      isEnabled: vine.boolean(),
      isRequired: vine.boolean().optional(),
      children: vine.array(vine.string()).optional().nullable(),
    }),
  ),
})
export const createCustomerUserValidator = vine.create(
  vine.object({
    name: vine.string(),
    email: vine.string().email(),
    password: vine.string(),
    accountType: vine.enum(['landlord', 'agency']),
    country: vine.string(),
    contactNumber: vine.string(),
    addressLineOne: vine.string(),
    addressLineTwo: vine.string().optional(),
    city: vine.string(),
    postCode: vine.string(),

    sortCode: vine.string().optional(),
    accountNumber: vine.string().optional(),
    isWhiteLabelEnabled: vine.boolean(),

    customPaymentSchedule: vine.object({
      amount: vine.number(),
      trialPeriodInDays: vine.number(),
      frequency: vine.enum(['monthly', 'quarterly', 'yearly']),
      currency: vine.enum(['gbp', 'eur', 'usd']),
      promoCode: vine.string().optional(),
      paymentMethod: vine.enum(['stripe', 'bank_transfer']),
      planType: vine.enum(['normal', 'custom']),
      plan: vine.enum(['standard', 'essential', 'premium']),
    }),

    pages,

    languagePreferences: vine.object({
      tenants: vine.enum(['tenants', 'residents', 'tenants/residents']),
      properties: vine.enum(['properties', 'units', 'homes', 'houses']),
      tenancies: vine.enum(['tenancies', 'leases', 'contracts']),
    }),

    featureList,

    metadata: vine.object({}).optional(),
  }),
)

export const editCustomerUserValidator = vine.create(
  vine.object({
    name: vine.string(),
    ownerRole: vine.enum(['landlord', 'agency']),
    isWhiteLabelEnabled: vine.boolean(),
    oldEmail: vine.string().email(),
    owner: vine.object({
      name: vine.string(),
      email: vine.string().email(),
      contactNumber: vine.string(),
      addressLineOne: vine.string(),
      addressLineTwo: vine.string().optional(),
      city: vine.string(),
      postCode: vine.string(),
      country: vine.string(),
      sortCode: vine.string().optional(),
      accountNumber: vine.string().optional(),
    }),
    pages,
    featureList,

    settings: vine.object({
      languagePreferences: vine.object({
        tenants: vine.enum(['tenants', 'residents', 'tenants/residents']),
        properties: vine.enum(['properties', 'units', 'homes', 'houses']),
        tenancies: vine.enum(['tenancies', 'leases', 'contracts']),
      }),
    }),

    metadata: vine.object({
      payment: vine
        .object({
          plan: vine.enum(['standard', 'essential', 'premium']),
          amount: vine.number(),
          currency: vine.enum(['gbp', 'eur', 'usd']),
          frequency: vine.enum(['monthly', 'quarterly', 'yearly']),
          paymentMethod: vine.enum(['stripe', 'bank_transfer']),
        })
        .optional(),
    }),
  }),
)

const customPaymentScheduleUpdate = vine.object({
  amount: vine.number().optional(),
  trialPeriodInDays: vine.number().optional(),
  frequency: vine.enum(['monthly', 'quarterly', 'yearly']).optional(),
  currency: vine.enum(['gbp', 'eur', 'usd']).optional(),
  paymentMethod: vine.enum(['stripe', 'bank_transfer']).optional(),
  planType: vine.enum(['normal', 'custom']).optional(),
  plan: vine.enum(['standard', 'essential', 'premium']).optional(),
})

export const updateOrgValidator = vine.create(
  vine.object({
    name: vine.string().optional(),
    creatorEmail: vine.string().email().optional(),
    companyName: vine.string().optional(),
    companyWebsite: vine.string().optional(),
    companyEmail: vine.string().email().optional(),
    country: vine.string().optional(),
    ownerRole: vine.enum(['landlord', 'agency']).optional(),
    isWhiteLabelEnabled: vine.boolean().optional(),
    customPaymentSchedule: customPaymentScheduleUpdate.optional(),
    customPlanFeatures: featureList.optional(),
    pages: pages.optional(),
    settings: vine
      .object({
        preferredCurrency: vine.string().optional(),
        preferredTimezone: vine.string().optional(),
        preferredDateFormat: vine.string().optional(),
        weeklyDigest: vine.boolean().optional(),
        monthlyDigest: vine.boolean().optional(),
        autoArchiveLeases: vine.boolean().optional(),
        enablePayments: vine.boolean().optional(),
        notifications: vine
          .object({
            leaseExpiry: vine.boolean().optional(),
            rentPaymentReminder: vine.boolean().optional(),
          })
          .optional(),
      })
      .optional(),
  }),
)

export type CreateCustomUserPayload = Awaited<
  ReturnType<typeof createCustomerUserValidator.validate>
>
