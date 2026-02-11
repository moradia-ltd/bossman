import vine from '@vinejs/vine'

const billingType = vine.enum(['one_off', 'recurring_monthly', 'recurring_yearly', 'usage'])

export const createAddonValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    shortDescription: vine.string().trim().maxLength(2000).optional(),
    longDescription: vine.string().trim().optional(),
    priceAmount: vine.string().trim().optional(),
    priceCurrency: vine.string().trim().maxLength(3),
    billingType,
    features: vine.array(vine.string().trim()).optional(),
    isActive: vine.boolean().optional(),
    sortOrder: vine.number().min(0).optional(),
  }),
)

export const updateAddonValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    shortDescription: vine.string().trim().maxLength(2000).optional(),
    longDescription: vine.string().trim().optional(),
    priceAmount: vine.string().trim().optional(),
    priceCurrency: vine.string().trim().maxLength(3).optional(),
    billingType: billingType.optional(),
    features: vine.array(vine.string().trim()).optional(),
    isActive: vine.boolean().optional(),
    sortOrder: vine.number().min(0).optional(),
  }),
)
