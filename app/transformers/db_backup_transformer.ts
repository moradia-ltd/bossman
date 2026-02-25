import { BaseTransformer } from '@adonisjs/core/transformers'

import type DbBackup from '#models/db_backup'

export default class DbBackupTransformer extends BaseTransformer<DbBackup> {
  toObject() {
    return this.pick(this.resource, ['id', 'filePath', 'fileSize', 'createdAt', 'updatedAt'])
  }
}
