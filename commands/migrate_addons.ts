import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Addon from '#models/addon'

export default class MigrateAddons extends BaseCommand {
  static commandName = 'migrate:addons'
  static description = ''

  static options: CommandOptions = {
    startApp: true
  }

  async run() {
    const devAddons = await Addon.all({ connection: 'dev' })

    for (const addon of devAddons) {
      await Addon.firstOrCreate(
        { stripePriceId: addon.stripePriceId },
        {
          name: addon.name,
          longDescription: addon.longDescription,
          shortDescription: addon.shortDescription,
          billingType: addon.billingType,
          features: addon.features,
          priceAmount: addon.priceAmount,
          isActive: addon.isActive,
          priceCurrency: addon.priceCurrency,
          stripePriceId: addon.stripePriceId,
          slug: addon.slug,
          sortOrder: addon.sortOrder
        },
        { connection: 'prod' }
      )


    }


    this.logger.info('Dont forget to copy over prices and')
  }
}
