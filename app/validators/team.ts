import vine from '@vinejs/vine'
import { PAGE_KEYS } from '#utils/page_access'

const email = vine.string().toLowerCase().trim().email()

export const inviteToTeamValidator = vine.compile(
  vine.object({
    email,
    role: vine.enum(['owner', 'admin', 'member']).optional(),
    allowedPages: vine.array(vine.enum(PAGE_KEYS)).optional(),
    enableProdAccess: vine.boolean().optional(),
  }),
)

export const acceptTeamInviteGuestValidator = vine.compile(
  vine.object({
    token: vine.string().trim(),
    fullName: vine.string().trim().minLength(2).maxLength(255),
    password: vine.string().minLength(8),
    confirmPassword: vine.string().confirmed({ confirmationField: 'password' }),
  }),
)

export const acceptTeamInviteAuthedValidator = vine.compile(
  vine.object({
    token: vine.string().trim(),
  }),
)

export const updateMemberValidator = vine.compile(
  vine.object({
    allowedPages: vine.array(vine.enum(PAGE_KEYS)).optional(),
    enableProdAccess: vine.boolean().optional(),
    dataAccessMode: vine.enum(['all', 'selected']).optional(),
    allowedLeaseableEntityIds: vine.array(vine.string()).optional(),
    allowedLeaseIds: vine.array(vine.string()).optional(),
  }),
)

export const updateInvitationValidator = vine.compile(
  vine.object({
    allowedPages: vine.array(vine.enum(PAGE_KEYS)).optional(),
    enableProdAccess: vine.boolean().optional(),
  }),
)
