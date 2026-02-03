import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    await User.createMany([
      {
        fullName: 'Kenny',
        email: 'kenneth@togetha.co.uk',
        password: 'password',
        role: 'super_admin',
      },
      {
        fullName: 'Tolu',
        email: 'tolulope@togetha.co.uk',
        password: 'password',
        role: 'admin',
      },
    ])
  }
}
