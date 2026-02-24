import type { SharedProps } from '@adonisjs/inertia/types'
import { Deferred, Head, Link } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { IconAlertCircle, IconBuilding, IconHome, IconMapPin } from '@tabler/icons-react'
import type { Column, PaginatedResponse } from '#types/extra'
import type { RawLeaseableEntity } from '#types/model-types'
import { formatNumber } from '#utils/functions'
import { DataTable } from '@/components/dashboard/data-table'
import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { StatCard } from '@/components/dashboard/stat-card'
import { LoadingSkeleton } from '@/components/ui'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AppCard } from '@/components/ui/app-card'
import { Badge } from '@/components/ui/badge'
import { SimpleGrid } from '@/components/ui/simplegrid'
import { useInertiaParams } from '@/hooks/use-inertia-params'
import { dateFormatter } from '@/lib/date'
import api from '@/lib/http'

const columns: Column<RawLeaseableEntity>[] = [
  {
    key: 'address',
    header: 'Address',
    cell: (row) => (
      <Link href={`/properties/${row.id}`} className='font-medium hover:underline'>
        {row.address || '—'}
      </Link>
    ),
  },
  {
    key: 'type',
    header: 'Type',
    cell: (row) => (
      <Badge variant='outline' className='capitalize'>
        {row.type}
      </Badge>
    ),
  },

  {
    key: 'isVacant',
    header: 'Status',
    cell: (row) =>
      row.isVacant ? (
        <Badge variant='secondary'>Vacant</Badge>
      ) : (
        <Badge variant='default'>Occupied</Badge>
      ),
  },
  {
    key: 'createdAt',
    header: 'Published',
    cell: (row) => (row.createdAt ? dateFormatter(row.createdAt) : '—'),
  },
]

type LeaseableEntitiesStats = { total: number; vacant: number; occupied: number }

interface LeaseableEntitiesIndexProps extends SharedProps {
  leaseableEntities: PaginatedResponse<RawLeaseableEntity>
  dataAccessExpired?: boolean
  dataAccessExpiredAt?: string | null
}

export default function LeaseableEntitiesIndex({
  leaseableEntities,
  dataAccessExpired,
  dataAccessExpiredAt,
}: LeaseableEntitiesIndexProps) {
  const { changePage, changeRows, searchTable, query } = useInertiaParams({
    page: 1,
    perPage: 20,
    search: '',
  })

  const { data: stats } = useQuery({
    queryKey: ['leaseable-entities-stats'],
    queryFn: async () => {
      const res = await api.get<LeaseableEntitiesStats>('/leaseable-entities/stats')
      return res.data
    },
  })

  return (
    <DashboardLayout>
      <Head title='Properties' />
      <div className='space-y-6'>
        <PageHeader
          title='Properties'
          description='Standalone properties and blocks of properties available for lease.'
        />

        {dataAccessExpired && (
          <Alert variant='destructive'>
            <IconAlertCircle className='h-4 w-4' />
            <AlertTitle>Access expired</AlertTitle>
            <AlertDescription>
              Your access to properties and leases expired
              {dataAccessExpiredAt ? ` on ${dateFormatter(dataAccessExpiredAt)}. ` : '. '}
              Contact your administrator to restore access.
            </AlertDescription>
          </Alert>
        )}

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing={4}>
          <StatCard
            title='Total'
            description='All properties'
            value={formatNumber(stats?.total)}
            icon={IconBuilding}
          />
          <StatCard
            title='Vacant'
            description='Available to let'
            value={formatNumber(stats?.vacant)}
            icon={IconHome}
            iconClassName='h-4 w-4 text-amber-600'
          />
          <StatCard
            title='Occupied'
            description='Currently let'
            value={formatNumber(stats?.occupied)}
            icon={IconMapPin}
            iconClassName='h-4 w-4 text-green-600'
          />
        </SimpleGrid>

        <Deferred data='leaseableEntities' fallback={<LoadingSkeleton type='table' />}>
          <AppCard
            title='All properties'
            description={`${leaseableEntities?.meta?.total ?? 0} total`}>
            <DataTable
              columns={columns}
              data={leaseableEntities?.data ?? []}
              searchable
              searchPlaceholder='Search by address...'
              searchValue={String(query.search || '')}
              onSearchChange={(value) => searchTable(String(value || ''))}
              pagination={{
                page: leaseableEntities?.meta?.currentPage ?? 1,
                pageSize: leaseableEntities?.meta?.perPage ?? 20,
                total: leaseableEntities?.meta?.total ?? 0,
                onPageChange: changePage,
                onPageSizeChange: changeRows,
              }}
              emptyMessage='No properties found'
            />
          </AppCard>
        </Deferred>
      </div>
    </DashboardLayout>
  )
}
