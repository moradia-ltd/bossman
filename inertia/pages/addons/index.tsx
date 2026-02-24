import type { SharedProps } from '@adonisjs/inertia/types'
import { Head, Link } from '@inertiajs/react'
import { IconChevronRight, IconPackage, IconPlus } from '@tabler/icons-react'
import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { EmptyState } from '@/components/ui'
import { AppCard } from '@/components/ui/app-card'
import { Badge } from '@/components/ui/badge'
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
  return (
    <DashboardLayout>
      <Head title='Addons' />

      <div className='space-y-6'>
        <PageHeader
          title='Addons'
          description='Create and manage addons. Each addon can have a price and billing type configured.'
          actions={
            <Button asChild leftIcon={<IconPlus className='h-4 w-4' />}>
              <Link href='/addons/create'>New addon</Link>
            </Button>
          }
        />

        {addons.length === 0 ? (
          <EmptyState
            icon={IconPackage}
            title='No addons'
            description='Create your first addon using the button above. You can set the price on the create page.'
            className='rounded-lg border border-dashed border-border bg-muted/30'
          />
        ) : (
          <AppCard
            title='Addons'
            description={`${addons.length} addon${addons.length === 1 ? '' : 's'}`}>
            <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
              {addons.map((addon) => (
                <Link key={addon.id} href={`/addons/${addon.id}/edit`}>
                  <Card className='group relative flex flex-col border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-md'>
                    <div className='flex w-full flex-col items-stretch gap-4 p-5 text-left'>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/20'>
                          <IconPackage className='h-6 w-6' />
                        </div>
                        <IconChevronRight className='h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5' />
                      </div>
                      <div className='min-w-0 flex-1 space-y-1'>
                        <h3 className='truncate text-base font-semibold tracking-tight text-foreground'>
                          {addon.name}
                        </h3>
                        <p className='text-xs text-muted-foreground'>/{addon.slug}</p>
                        {addon.shortDescription ? (
                          <p className='line-clamp-2 text-sm text-muted-foreground'>
                            {addon.shortDescription}
                          </p>
                        ) : (
                          <p className='text-sm italic text-muted-foreground'>No description</p>
                        )}
                      </div>
                      <div className='flex flex-wrap items-center gap-2'>
                        <Badge variant='outline' className='text-xs'>
                          {BILLING_LABELS[addon.billingType]}
                        </Badge>
                        {addon.isActive ? (
                          <Badge variant='success' className='text-xs'>
                            Active
                          </Badge>
                        ) : (
                          <Badge variant='secondary' className='text-xs'>
                            Inactive
                          </Badge>
                        )}
                        {addon.priceAmount != null && addon.priceCurrency ? (
                          <span className='ml-auto text-sm font-medium tabular-nums'>
                            {addon.priceCurrency} {addon.priceAmount}
                          </span>
                        ) : (
                          <span className='ml-auto text-xs text-muted-foreground'>No price</span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </AppCard>
        )}
      </div>
    </DashboardLayout>
  )
}
