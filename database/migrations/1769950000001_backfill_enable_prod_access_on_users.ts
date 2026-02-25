import db from '@adonisjs/lucid/services/db'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Backfill from team_members so existing members keep their current setting
    await db.rawQuery(`
      UPDATE users
      SET enable_prod_access = (
        SELECT tm.enable_prod_access FROM team_members tm WHERE tm.user_id = users.id LIMIT 1
      )
      WHERE EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = users.id)
    `)
  }

  async down() {
    // No reversible backfill
  }
}
