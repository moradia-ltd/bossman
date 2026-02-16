import axios from 'axios'
import env from '#start/env'

export interface OneSignalSendOptions {
  /** External user IDs (e.g. TogethaUser ids) - max 20,000 */
  externalIds: string[]
  /** Notification title (required) */
  heading: string
  /** Notification body (required) */
  content: string
  /** Optional image URL (big_picture for Android, ios_attachments for iOS) */
  imageUrl?: string
  /** Optional URL to open on tap */
  url?: string
  /** Optional ISO 8601 date string to send at a later time */
  sendAfter?: string
}

export interface OneSignalSendResult {
  id?: string
  recipients?: number
  errors?: Record<string, string>
}

interface OneSignalApiResponse {
  id?: string
  recipients?: number
  errors?: Record<string, string> | string[]
}

/**
 * Normalize OneSignal errors (can be array or object) into Record<string, string>.
 */
function normalizeErrors(errors: Record<string, string> | string[] | undefined): Record<string, string> | undefined {
  if (!errors) return undefined
  if (Array.isArray(errors)) {
    const msg = errors.length > 0 ? errors.join('; ') : 'Unknown error'
    return { request: msg }
  }
  return errors
}

/**
 * Send a push notification via OneSignal REST API.
 * Uses include_aliases with external_id (user ids).
 *
 * Required in .env:
 * - ONESIGNAL_APP_ID: Your OneSignal App ID (Settings > Keys & IDs)
 * - ONESIGNAL_API_KEY: Your App API Key (Settings > Keys & IDs — create an App API Key, not Org key)
 * - ONESIGNAL_API_ENDPOINT: Full URL e.g. https://api.onesignal.com/notifications
 */
export async function sendOneSignalPush(
  options: OneSignalSendOptions,
): Promise<OneSignalSendResult> {
  const endpoint = String(env.get('ONESIGNAL_API_ENDPOINT')).trim()
  const appId = String(env.get('ONESIGNAL_APP_ID')).trim()
  const apiKey = String(env.get('ONESIGNAL_API_KEY')).trim()

  if (!apiKey || apiKey === 'ONESIGNAL_API_KEY' || apiKey.length < 10) {
    return {
      errors: {
        request:
          'Invalid or missing ONESIGNAL_API_KEY. Set your App API Key in .env (Settings > Keys & IDs in OneSignal dashboard, create an App API Key).',
      },
    }
  }

  const body: Record<string, unknown> = {
    app_id: appId,
    target_channel: 'push',
    contents: { en: options.content },
    headings: { en: options.heading },
  }

  if (options.externalIds.length > 0) {
    body.include_aliases = { external_id: options.externalIds }
  } else {
    body.included_segments = ['All']
  }

  if (options.imageUrl) {
    body.big_picture = options.imageUrl
    body.ios_attachments = { id1: options.imageUrl }
    body.chrome_web_image = options.imageUrl
  }

  if (options.url) body.url = options.url

  if (options.sendAfter) body.send_after = options.sendAfter

  try {
    const { data } = await axios.post<OneSignalApiResponse>(endpoint, body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${apiKey}`,
      },
    })

    const errors = normalizeErrors(data.errors)
    return {
      id: data.id,
      recipients: data.recipients,
      errors,
    }
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data) {
      const data = err.response.data as OneSignalApiResponse
      const errors = normalizeErrors(data.errors)
      return {
        errors: errors ?? {
          request: err.response.statusText || String(err.response.status),
        },
      }
    }
    return {
      errors: {
        request: err instanceof Error ? err.message : 'Request failed',
      },
    }
  }
}
