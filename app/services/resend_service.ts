import axios from 'axios'
import env from '#start/env'

/** Resend list item (summary, no html/text). */
export interface ResendEmailListItem {
  id: string
  to: string[]
  from: string
  created_at: string
  subject: string
  bcc: string[] | null
  cc: string[] | null
  reply_to: string | null
  last_event: string
  scheduled_at: string | null
}

/** Resend list response (cursor-based pagination). */
export interface ResendListResponse {
  object: 'list'
  has_more: boolean
  data: ResendEmailListItem[]
}

/** Resend single email (full details including html/text). */
export interface ResendEmail {
  object: 'email'
  id: string
  to: string[]
  from: string
  created_at: string
  subject: string
  html: string | null
  text: string | null
  bcc: string[]
  cc: string[]
  reply_to: string | null
  last_event: string
  scheduled_at: string | null
  tags?: Array<{ name: string; value: string }>
}

const api = axios.create({
  baseURL: 'https://api.resend.com',
  headers: {
    Authorization: `Bearer ${env.get('RESEND_API_KEY')}`,
  },
})

export const resendService = {
  /**
   * List sent emails. Cursor-based: use `after` (id of last item) for next page,
   * `before` (id of first item) for previous page.
   * @see https://resend.com/docs/api-reference/emails/list-emails
   */
  async list(params?: {
    limit?: number
    after?: string
    before?: string
  }): Promise<ResendListResponse> {
    const { data } = await api.get<ResendListResponse>('/emails', { params })
    return data
  },

  /**
   * Retrieve a single email by id (includes html/text).
   * @see https://resend.com/docs/api-reference/emails/retrieve-email
   */
  async get(id: string): Promise<ResendEmail> {
    const { data } = await api.get<ResendEmail>(`/emails/${id}`)
    return data
  },
}
