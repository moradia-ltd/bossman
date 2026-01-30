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

/**
 * Send a push notification via OneSignal REST API.
 * Uses include_aliases with external_id (user ids).
 */
export async function sendOneSignalPush(
  options: OneSignalSendOptions,
): Promise<OneSignalSendResult> {
  const endpoint = env.get('ONESIGNAL_API_ENDPOINT')
  const appId = env.get('ONESIGNAL_APP_ID')
  const apiKey = env.get('ONESIGNAL_API_KEY')

  const body: Record<string, unknown> = {
    app_id: appId,
    target_channel: 'push',
    contents: { en: options.content },
    headings: { en: options.heading },
  }

  if (options.externalIds.length > 0) {
    body.include_aliases = { external_id: options.externalIds }
  } else {
    // No recipients - use a segment that might exist, or API will return no recipients
    body.included_segments = ['All']
  }

  if (options.imageUrl) {
    body.big_picture = options.imageUrl
    body.ios_attachments = { id1: options.imageUrl }
    body.chrome_web_image = options.imageUrl
  }

  if (options.url) {
    body.url = options.url
  }

  if (options.sendAfter) {
    body.send_after = options.sendAfter
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Key ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  const data = (await res.json()) as {
    id?: string
    recipients?: number
    errors?: Record<string, string>
  }

  if (!res.ok) {
    return {
      errors: data.errors ?? { request: res.statusText || 'Request failed' },
    }
  }

  return {
    id: data.id,
    recipients: data.recipients,
    errors: data.errors,
  }
}
