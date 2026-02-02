import type { HttpContext } from '@adonisjs/core/http'
import { banUser } from '#boss/jobs/ban_user'
import AccountBan from '#models/account_ban'
import Org from '#models/org'
import mailer from '#services/email_service'
import { banUserValidator } from '#validators/org_action'

export default class OrgActionsController {
  async getBanStatus({ request, params, response }: HttpContext) {
    const { orgId } = params
    const connection = request.appEnv()
    const org = await Org.query({ connection }).where('id', orgId).firstOrFail()
    const ban = await AccountBan.query({ connection })
      .where('orgId', org.id)
      .orderBy('createdAt', 'desc')
      .firstOrFail()

    return response.ok({ isBanned: ban?.isBanActive ?? false })
  }

  async banUser({ request, params, auth, response, now }: HttpContext) {
    const { orgId } = params
    const body = await request.validateUsing(banUserValidator)
    const connection = request.appEnv()
    const org = await Org.query({ connection }).where('id', orgId).preload('owner').firstOrFail()
    const { id, fullName, email } = auth.getUserOrFail()
    const bannedBy = { id, name: fullName ?? '', email }
    const metadata = { ...body.metadata, accountBannedBy: bannedBy }

    const when = body.banStartsAt ?? now.toJSDate()

    const jobData = {
      orgId: org.id,
      userId: org.owner.id,
      reason: body.reason,
      metadata,
      connection,
      banStartsAt: body.banStartsAt?.toISOString() ?? now.toJSDate().toISOString(),
    }

    await banUser.schedule(jobData, when)

    return response.ok({ message: 'User banned successfully' })
  }

  // unban user
  async unbanUser({ request, params, now, response }: HttpContext) {
    const { orgId } = params
    const connection = request.appEnv()
    const org = await Org.query({ connection }).where('id', orgId).firstOrFail()

    //find the most recent ban for the user
    const ban = await AccountBan.query({ connection })
      .where('userId', org.owner.id)
      .orderBy('createdAt', 'desc')
      .firstOrFail()

    // update the ban to set the expiresAt to null
    ban?.merge({ expiresAt: null, removedAt: now, isBanActive: false })
    await ban.save()

    await mailer.send({
      type: 'access-restored',
      data: { email: org.email, fullName: org.cleanName },
    })

    return response.ok({ message: 'User unbanned successfully' })
  }
}
