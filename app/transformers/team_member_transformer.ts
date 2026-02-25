import { BaseTransformer } from '@adonisjs/core/transformers'
import type TeamMember from '#models/team_member'

export default class TeamMemberTransformer extends BaseTransformer<TeamMember> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'userId',
      'role',
      'enableProdAccess',
      'dataAccessMode',
      'propertiesAccessMode',
      'leasesAccessMode',
      'allowedLeaseableEntityIds',
      'allowedLeaseIds',
      'createdAt',
      'updatedAt',
    ])
  }
}
