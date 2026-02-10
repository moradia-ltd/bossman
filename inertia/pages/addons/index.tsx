import type { SharedProps } from '@adonisjs/inertia/types'
import { Head, Link } from '@inertiajs/react'
import { Package, Plus } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { EmptyState } from '@/components/ui'
import { AppCard } from '@/components/ui/app-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type BillingType = 'one_off' | 'recurring_monthly' | 'recurring_yearly' | 'usage'

interface AddonRow {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  billingType: BillingType
  priceAmount: string | null
  priceCurrency: string | null
  isActive: boolean
  sortOrder: number
}

interface AddonsIndexProps extends SharedProps {
  addons: AddonRow[]
}

const BILLING_LABELS: Record<BillingType, string> = {
  one_off: 'One-off',
  recurring_monthly: 'Monthly',
  recurring_yearly: 'Yearly',
  usage: 'Usage',
}

export default function AddonsIndex({ addons }: AddonsIndexProps) {
  console.log(addons)
  return (
    <DashboardLayout>
      <Head title='Addons' />

      <div className='flex gap-6'>
        <div className='min-w-0 flex-1 space-y-6'>
          <PageHeader
            title='Addons'
            description='Create and manage addons. Each addon can have a price configured on the create page.'
            actions={
              <Button asChild leftIcon={<Plus className='h-4 w-4' />}>
                <Link href='/addons/create'>New addon</Link>
              </Button>
            }
          />

          {addons.length === 0 ? (
            <EmptyState
              icon={Package}
              title='No addons'
              description='Create your first addon using the button above. You can set the price on the create page.'
              className='rounded-lg border border-dashed border-border bg-muted/30'
            />
          ) : (
            <AppCard title='Addons' description='Your addons.'>
              <div className='space-y-3'>
                {addons.map((addon) => (
                  <Card
                    key={addon.id}
                    className='flex items-center justify-between gap-4 border-border p-4'>
                    <div className='min-w-0 flex-1'>
                      <p className='font-medium text-foreground'>{addon.name}</p>
                      <p className='text-xs text-muted-foreground'>/{addon.slug}</p>
                      {addon.shortDescription ? (
                        <p className='mt-1 text-sm text-muted-foreground line-clamp-1'>
                          {addon.shortDescription}
                        </p>
                      ) : null}
                    </div>
                    <div className='flex shrink-0 items-center gap-2'>
                      <span className='rounded-md bg-muted px-2 py-0.5 text-xs'>
                        {BILLING_LABELS[addon.billingType]}
                      </span>
                      {addon.priceAmount != null && addon.priceCurrency ? (
                        <span className='text-sm font-medium'>
                          {addon.priceCurrency} {addon.priceAmount}
                        </span>
                      ) : (
                        <span className='text-xs text-muted-foreground'>No price</span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </AppCard>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
