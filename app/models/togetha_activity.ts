import logger from '@adonisjs/core/services/logger'
import { afterCreate, BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { ModelObject } from '@adonisjs/lucid/types/model'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Document from './document.js'
import FileUpload from './file_upload.js'
import Lease from './lease.js'
// import Note from './note.js'
import Org from './org.js'
import Payment from './payment.js'
// import Photo from './photo.js'
import Property from './property.js'

import Tenant from './tenant.js'
import User from './user.js'

export const activityTypes = [
  'created',
  'deleted',
  'updated',
  'other',
  'accepted',
  'rejected',
  'renewed',
  'archived',
  'uploaded',
  'completed',
  'commented',
  'signed',
  'paid',
  'verified',
  'approved',
  'restored',
  'assigned',
  'recieved',
  'export',
] as const

export type ActivityType = (typeof activityTypes)[number]
export default class TogethaActivity extends BaseModel {
  static readonly table = 'activities'

  @column({ isPrimary: true })
  declare id: string

  @column() declare type: ActivityType
  @column() declare userId: string
  @column() declare propertyId: string
  @column() declare leaseableEntityId: string
  @column() declare unitId: string
  @column() declare keywords: string
  @column() declare leaseId: string
  @column() declare tenantId: string
  @column() declare teamMemberId: string
  @column() declare paymentId: string
  @column() declare teamId: string
  @column() declare taskId: string
  @column() declare broadcastId: string
  @column() declare templateId: string
  @column() declare photoId: string
  @column() declare calendarEventId: string
  @column() declare roomId: string
  @column() declare contractorId: string
  @column() declare contactId: string
  @column() declare maintenanceId: string
  @column() declare noteId: string
  @column() declare renewalId: string
  @column() declare documentId: string
  @column() declare fileUploadId: string
  @column() declare inviteId: string
  @column() declare referenceId: string
  @column() declare summary: string
  @column() declare orgId: string
  @column() declare isSystemAction: boolean
  @column() declare createdAt: string
  @column() declare updatedAt: string

  @belongsTo(() => User) declare user: BelongsTo<typeof User>
  @belongsTo(() => Tenant) declare tenant: BelongsTo<typeof Tenant>
  @belongsTo(() => Property) declare property: BelongsTo<typeof Property>
  @belongsTo(() => Lease) declare lease: BelongsTo<typeof Lease>
  @belongsTo(() => Org) declare org: BelongsTo<typeof Org>
  @belongsTo(() => FileUpload) declare fileUpload: BelongsTo<typeof FileUpload>
  @belongsTo(() => Document) declare document: BelongsTo<typeof Document>
  @belongsTo(() => Payment) declare payment: BelongsTo<typeof Payment>

  @column() declare data: ModelObject

  @afterCreate()
  public static async createActivity(activity: TogethaActivity) {
    logger.info(`Activity ${activity.summary} has been recorded`)
  }
}
