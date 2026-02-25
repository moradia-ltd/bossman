import { BaseTransformer } from '@adonisjs/core/transformers'
import type TeamInvitation from '#models/team_invitation'

export default class TeamInvitationTransformer extends BaseTransformer<TeamInvitation> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'email',
      'role',
      'invitedUserRole',
      'enableProdAccess',
      'allowedPages',
      'createdAt',
      'updatedAt',
    ])
  }
}
