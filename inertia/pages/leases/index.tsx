import type { SharedProps } from '@adonisjs/inertia/types'
import { Deferred, Head, Link } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, CheckCircle, FileText, XCircle } from 'lucide-react'
import type { Column, PaginatedResponse } from '#types/extra'
import type { RawLease } from '#types/model-types'
import { formatCurrency } from '#utils/currency'
import { timeAgo } from '#utils/date'
import { formatNumber } from '#utils/functions'
import { DataTable } from '@/components/dashboard/data-table'
import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { StatCard } from '@/components/dashboard/stat-card'
import { LoadingSkeleton, Stack } from '@/components/ui'
import { AppCard } from '@/components/ui/app-card'
import { SimpleGrid } from '@/components/ui/simplegrid'
import { useInertiaParams } from '@/hooks/use-inertia-params'
import { dateFormatter } from '@/lib/date'
import api from '@/lib/http'
import { StatusBadge } from './components/status'

interface LeasesIndexProps extends SharedProps {
  leases: PaginatedResponse<RawLease>
}

type Stats = { total: number; active: number; pending: number; expired: number }
const columns: Column<RawLease>[] = [
  {
    key: 'name',
    header: 'Lease',
    width: 250,
    cell: (row) => (
      <div className='space-y-1'>
        <Link href={`/leases/${row.id}`} className='font-medium hover:underline'>
          {row.cleanName || row.shortId}
        </Link>
        <Stack>
          <span className='text-xs text-muted-foreground'>
            {dateFormatter(row.startDate)} - {dateFormatter(row.endDate)}
          </span>
        </Stack>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: 130,
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: 'rentAmount',
    width: 200,
    header: 'Rent',
    cell: (row) => formatCurrency(row.rentAmount, row.currency) || '—',
  },
  {
    key: 'Org',
    header: 'Org',
    width: 130,
    cell: (row) => (
      <Link href={`/orgs/${row.org.id}`} className='font-medium hover:underline'>
        {row.org.cleanName}
      </Link>
    ),
  },
  {
    key: 'Created At',
    header: 'Created At',
    width: 130,
    cell: (row) => timeAgo(row.createdAt),
  },
]

export default function LeasesIndex({ leases }: LeasesIndexProps) {
  const { changePage, changeRows, searchTable, query } = useInertiaParams({
    page: 1,
    perPage: 20,
    search: '',
  })

  const { data: stats } = useQuery({
    queryKey: ['leases-stats2'],
    queryFn: async () => await api.get<Stats>('/leases/stats'),
    select: (data) => data?.data,
  })

  return (
    <DashboardLayout>
      <Head title='Leases' />

      <div className='space-y-6'>
        <PageHeader title='Leases' description='All leases for your organisation.' />

        <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <StatCard
            title='Total'
            description='All leases'
            value={formatNumber(stats?.total)}
            icon={FileText}
          />
          <StatCard
            title='Active'
            description='Currently active'
            value={formatNumber(stats?.active)}
            icon={CheckCircle}
            iconClassName='h-4 w-4 text-green-600'
          />
          <StatCard
            title='Pending'
            description='Awaiting completion'
            value={formatNumber(stats?.pending)}
            icon={AlertCircle}
          />
          <StatCard
            title='Expired'
            description='Ended leases'
            value={formatNumber(stats?.expired)}
            icon={XCircle}
          />
        </SimpleGrid>

        <Deferred data="leases" fallback={<LoadingSkeleton type='table' />}>

          <AppCard title='All leases'>
            <DataTable
              columns={columns}
              data={leases?.data}
              searchable
              searchPlaceholder='Search by name...'
              searchValue={String(query.search || '')}
              onSearchChange={(value) => searchTable(String(value || ''))}
              pagination={{
                page: leases?.meta.currentPage,
                pageSize: leases?.meta.perPage,
                total: leases?.meta.total,
                onPageChange: changePage,
                onPageSizeChange: changeRows,
              }}
              emptyMessage='No leases found'
            />
          </AppCard>
        </Deferred>
      </div>
    </DashboardLayout>
  )
}
