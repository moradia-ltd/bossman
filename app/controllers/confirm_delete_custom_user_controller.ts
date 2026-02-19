import { createHash } from 'node:crypto'
import type { HttpContext } from '@adonisjs/core/http'
import DeleteAccountRequest from '#models/delete_account_request'
import mailer from '#services/email_service'

function hashDeleteRequestToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export default class ConfirmDeleteCustomUserController {
  /**
   * Public GET: user clicks Accept or Decline in the email.
   * Validates token, performs action, redirects to result page.
   */
  async respond({ request, response, now }: HttpContext) {
    const token = request.qs().token
    const action = request.qs().action
    const connection = request.qs().connection
    if (connection !== 'dev' && connection !== 'prod') throw new Error('Invalid connection')

    if (!token || typeof token !== 'string') {
      return response.redirect('/account-deletion-result?result=declined&error=missing_token')
    }

    if (action !== 'accept' && action !== 'decline') {
      return response.redirect('/account-deletion-result?result=declined&error=invalid_action')
    }

    const tokenHash = hashDeleteRequestToken(token)
    const deleteRequest = await DeleteAccountRequest.query({ connection })
      .where('token_hash', tokenHash)
      .preload('org')
      .first()

    if (!deleteRequest) {
      return response.redirect('/account-deletion-result?result=declined&error=invalid_or_expired')
    }

    if (deleteRequest.expiresAt.toMillis() < now.toMillis()) {
      return response.redirect('/account-deletion-result?result=declined&error=expired')
    }

    const org = deleteRequest.org

    if (action === 'decline') {
      await deleteRequest.delete()
      return response.redirect('/account-deletion-result?result=declined')
    }

    deleteRequest.merge({ isSuccessful: true })
    await deleteRequest.save()

    // action === 'accept': delete the org, then redirect
    const email = org.creatorEmail
    const fullName = org.cleanName ?? 'User'

    await mailer.send({
      type: 'goodbye',
      data: { email, fullName },
    })

    await org.delete()

    return response.redirect('/account-deletion-result?result=deleted')
  }
}
