import vine from '@vinejs/vine'

export const banUserValidator = vine.compile(
  vine.object({
    reason: vine.string(),
    metadata: vine
      .object({
        accountBannedBy: vine.object({
          id: vine.string(),
          name: vine.string(),
          email: vine.string(),
        }),
      })
      .optional(),
    banStartsAt: vine
      .date({ formats: ['iso8601'] })
      .optional()
      .requiredWhen('isInstantSend', '=', false),
    isInstantSend: vine.boolean().optional(),
    isTemporarilyPaused: vine.boolean().optional(),
  }),
)
