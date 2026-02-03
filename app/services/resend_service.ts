import axios from 'axios'
import env from '#start/env'

const api = axios.create({
  baseURL: 'https://api.resend.com/emails',
  headers: {
    Authorization: `Bearer ${env.get('RESEND_API_KEY')}`,
  },
})

interface Pagination {
  limit: number
  after: string
  before: string
}

interface Email {
  id: string
  from: string
  to: string
  subject: string
  body: string
}

export class ResendService {
  // Your code here
  listEmails() {
    return api.get('/')
  }
}
