import { createHash } from 'node:crypto'

import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

import { banUser } from '#boss/jobs/ban_user'
import AccountBan from '#models/account_ban'
import DeleteAccountRequest from '#models/delete_account_request'
import Org from '#models/org'
import { generateShortId } from '#services/app.functions'
import mailer from '#services/email_service'
import env from '#start/env'
import { banUserValidator, bulkOrgIdsValidator } from '#validators/org_action'

function hashDeleteRequestToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

const appUrl = env.get('APP_URL')

export default class OrgActionsController {
  async getBanStatus({ request, params, response }: HttpContext) {
    const { orgId } = params
    const connection = request.appEnv()
    const org = await Org.query({ connection }).where('id', orgId).firstOrFail()

    const ban = await AccountBan.query({ connection })
      .where('orgId', org.id)
      .orderBy('createdAt', 'desc')
      .first()

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
      .where('orgId', org.id)
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

  async makeFavourite({ request, params, response }: HttpContext) {
    const { orgId } = params
    const connection = request.appEnv()
    const org = await Org.query({ connection }).where('id', orgId).firstOrFail()
    org.isFavourite = true
    await org.save()
    return response.ok({ message: 'Marked as favourite', isFavourite: true })
  }

  async undoFavourite({ request, params, response }: HttpContext) {
    const { orgId } = params
    const connection = request.appEnv()
    const org = await Org.query({ connection }).where('id', orgId).firstOrFail()
    org.isFavourite = false
    await org.save()
    return response.ok({ message: 'Removed from favourites', isFavourite: false })
  }

  async makeTestAccount({ request, params, response }: HttpContext) {
    const { orgId } = params
    const connection = request.appEnv()
    const org = await Org.query({ connection }).where('id', orgId).firstOrFail()
    org.isTestAccount = true
    await org.save()
    return response.ok({ message: 'Marked as test account', isTestAccount: true })
  }

  async undoTestAccount({ request, params, response }: HttpContext) {
    const { orgId } = params
    const connection = request.appEnv()
    const org = await Org.query({ connection }).where('id', orgId).firstOrFail()
    org.isTestAccount = false
    await org.save()
    return response.ok({ message: 'Removed test account flag', isTestAccount: false })
  }

  async toggleSalesAccount({ request, params, response }: HttpContext) {
    const { orgId } = params
    const connection = request.appEnv()
    const org = await Org.query({ connection }).where('id', orgId).firstOrFail()
    org.isSalesOrg = !org.isSalesOrg
    await org.save()
    return response.ok({
      message: org.isSalesOrg ? 'Marked as sales account' : 'Removed sales account flag',
      isSalesOrg: org.isSalesOrg,
    })
  }

  async bulkMakeFavourite({ request, response }: HttpContext) {
    const connection = request.appEnv()
    const { orgIds } = await request.validateUsing(bulkOrgIdsValidator)
    const count = await Org.query({ connection })
      .whereIn('id', orgIds)
      .update({ isFavourite: true })
    return response.ok({ message: `${count} org(s) marked as favourite`, updated: count })
  }

  async bulkUndoFavourite({ request, response }: HttpContext) {
    const connection = request.appEnv()
    const { orgIds } = await request.validateUsing(bulkOrgIdsValidator)
    const count = await Org.query({ connection })
      .whereIn('id', orgIds)
      .update({ isFavourite: false })
    return response.ok({ message: `${count} org(s) removed from favourites`, updated: count })
  }

  async bulkMakeTestAccount({ request, response }: HttpContext) {
    const connection = request.appEnv()
    const { orgIds } = await request.validateUsing(bulkOrgIdsValidator)
    const count = await Org.query({ connection })
      .whereIn('id', orgIds)
      .update({ isTestAccount: true })
    return response.ok({ message: `${count} org(s) marked as test account`, updated: count })
  }

  async bulkUndoTestAccount({ request, response }: HttpContext) {
    const connection = request.appEnv()
    const { orgIds } = await request.validateUsing(bulkOrgIdsValidator)
    const count = await Org.query({ connection })
      .whereIn('id', orgIds)
      .update({ isTestAccount: false })
    return response.ok({ message: `${count} org(s) removed test account flag`, updated: count })
  }

  async requestDeleteCustomUser({ params, request, response, now }: HttpContext) {
    const { orgId } = params
    const connection = request.appEnv()
    const org = await Org.query({ connection }).where('id', orgId).preload('owner').firstOrFail()

    const token = generateShortId(48)
    const tokenHash = hashDeleteRequestToken(token)
    const expiresAt = DateTime.now().plus({ days: 7 })

    await DeleteAccountRequest.create(
      {
        orgId: org.id,
        tokenHash,
        expiresAt,
      },
      { connection },
    )

    const baseUrl = `${appUrl}/confirm-delete-custom-user?token=${encodeURIComponent(token)}&connection=${encodeURIComponent(connection)}`
    const acceptUrl = `${baseUrl}&action=accept`
    const declineUrl = `${baseUrl}&action=decline`

    const email = org.creatorEmail
    const fullName = org.cleanName ?? 'User'

    await mailer.send({
      type: 'custom-user-delete-request',
      data: { email, fullName, acceptUrl, declineUrl },
    })

    return response.ok({
      message:
        'Delete request email sent. The user can accept or decline from the link in the email.',
    })
  }
}
