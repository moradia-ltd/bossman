import type { SharedProps } from '@adonisjs/inertia/types'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { Pencil } from 'lucide-react'
import type { RawLease } from '#types/model-types'
import { formatCurrency } from '#utils/currency'
import DetailRow from '@/components/dashboard/detail-row'
import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { type QuickActionOption, QuickActions } from '@/components/dashboard/quick-actions'
import { Button } from '@/components/ui/button'
import { AppCard } from '@/components/ui/app-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { dateFormatter } from '@/lib/date'
import { ActivityTab } from './components/activity-tab'
import { PaymentsTab } from './components/payments-tab'
import { StatusBadge } from './components/status'

const validTabs = ['details', 'payments', 'activity'] as const
type LeaseTabValue = (typeof validTabs)[number]

interface LeaseShowProps extends SharedProps {
  lease: RawLease
}

export default function LeaseShow({ lease }: LeaseShowProps) {
  const page = usePage()
  const qs = (page.props.qs as { tab?: string }) || {}
  const currentTab = (
    qs.tab && validTabs.includes(qs.tab as LeaseTabValue) ? qs.tab : 'details'
  ) as LeaseTabValue

  const name = lease.cleanName ?? lease.name
  const status = lease.status
  const rentAmount = lease.rentAmount != null ? Number(lease.rentAmount) : null
  const startDate = dateFormatter(lease.startDate)
  const endDate = lease.endDate ? dateFormatter(lease.endDate) : null
  const frequency = lease.frequency
  const depositAmount = lease.depositAmount != null ? Number(lease.depositAmount) : null
  const paymentDay = lease.paymentDay
  const tenantName =
    (lease as RawLease & { tenantName?: string }).tenantName ??
    (lease as RawLease & { metadata?: { tenantName?: string } }).metadata?.tenantName
  const propertyName =
    (lease as RawLease & { propertyAddress?: string }).propertyAddress ??
    (lease as RawLease & { metadata?: { propertyName?: string } }).metadata?.propertyName

  const handleTabChange = (value: string) => {
    if (validTabs.includes(value as LeaseTabValue)) {
      router.get(
        `/leases/${lease.id}`,
        { tab: value },
        {
          preserveState: true,
          preserveScroll: true,
          replace: true,
        },
      )
    }
  }

  const quickActions: QuickActionOption[] = [
    {
      title: 'Edit lease',
      description: 'Open the lease edit page to change details.',
      icon: Pencil,
      dontShowIf: false,
      href: `/leases/${lease.id}/edit`,
    },
  ]

  return (
    <DashboardLayout>
      <Head title={`Lease: ${name}`} />
      <div className='space-y-6'>
        <PageHeader
          title='Lease details'
          backHref='/leases'
          description={name}
          actions={
            <div className='flex flex-wrap items-center gap-2'>
              <QuickActions options={quickActions} className='flex items-center gap-1' />
              <Button variant='outline' size='md' asChild>
                <Link>View Contract</Link>
              </Button>
            </div>
          }
        />

        <Tabs value={currentTab} onValueChange={handleTabChange} className='space-y-6'>
          <TabsList>
            <TabsTrigger value='details'>Details</TabsTrigger>
            <TabsTrigger value='payments'>Payments</TabsTrigger>
            <TabsTrigger value='activity'>Activity</TabsTrigger>
          </TabsList>

          <TabsContent value='details' className='space-y-6'>
            <AppCard
              title='Lease information'
              description='Details and identifiers'>
              <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                  <DetailRow label='Status' value={<StatusBadge status={status} />} />
                  <DetailRow
                    label='Rent'
                    value={rentAmount != null ? formatCurrency(rentAmount, lease.currency) : null}
                  />
                  <DetailRow label='Frequency' value={frequency ? String(frequency) : null} />
                  <DetailRow
                    label='Payment day'
                    value={paymentDay != null ? `Day ${paymentDay}` : null}
                  />
                  <DetailRow label='Start date' value={startDate} />
                  <DetailRow label='End date' value={endDate ?? 'Rolling'} />
                  <DetailRow
                    label='Deposit'
                    value={
                      depositAmount != null ? formatCurrency(depositAmount, lease.currency) : null
                    }
                  />
                  {tenantName && <DetailRow label='Tenant' value={tenantName} />}
                  {propertyName && <DetailRow label='Property' value={propertyName} />}


              </div>
            </AppCard>
          </TabsContent>

          <TabsContent value='payments' className='space-y-6'>
            <PaymentsTab leaseId={lease.id} />
          </TabsContent>

          <TabsContent value='activity' className='space-y-6'>
            <ActivityTab leaseId={lease.id} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
