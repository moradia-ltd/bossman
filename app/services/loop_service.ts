import axios from 'axios'
import env from '#start/env'

const loops = axios.create({
  baseURL: 'https://app.loops.so/api/v1',
  headers: { Authorization: `Bearer ${env.get('LOOPS_API_KEY')}` },
})

export interface LoopUser {
  id: string
  email: string
  firstName: string
  lastName: null
  source: string
  subscribed: boolean
  userGroup: string
  userId: null
  mailingLists: MailingLists
  optInStatus: string
}

export interface MailingLists {
  [key: string]: string | boolean
}

export class LoopService {
  async findUser(email: string) {
    const { data } = await loops.get(`/contacts/find?email=${email}`)
    return data
  }
}
