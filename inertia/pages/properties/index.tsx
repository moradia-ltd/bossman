import type { SharedProps } from '@adonisjs/inertia/types'
import { Head, Link } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { Building2, Home, MapPin } from 'lucide-react'
import type { Column, PaginatedResponse } from '#types/extra'
import type { RawLeaseableEntity } from '#types/model-types'
import { formatNumber } from '#utils/functions'
import { DataTable } from '@/components/dashboard/data-table'
import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { StatCard } from '@/components/dashboard/stat-card'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
}

export default function LeaseableEntitiesIndex({ leaseableEntities }: LeaseableEntitiesIndexProps) {
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
  console.log('🚀 ~ LeaseableEntitiesIndex ~ stats:', stats)

  return (
    <DashboardLayout>
      <Head title='Properties' />
      <div className='space-y-6'>
        <PageHeader
          title='Properties'
          description='Standalone properties and blocks of properties available for lease.'
        />

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing={4}>
          <StatCard
            title='Total'
            description='All properties'
            value={formatNumber(stats?.total)}
            icon={Building2}
          />
          <StatCard
            title='Vacant'
            description='Available to let'
            value={formatNumber(stats?.vacant)}
            icon={Home}
            iconClassName='h-4 w-4 text-amber-600'
          />
          <StatCard
            title='Occupied'
            description='Currently let'
            value={formatNumber(stats?.occupied)}
            icon={MapPin}
            iconClassName='h-4 w-4 text-green-600'
          />
        </SimpleGrid>

        <Card>
          <CardHeader>
            <CardTitle>All properties</CardTitle>
            <CardDescription>{leaseableEntities.meta.total} total</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={leaseableEntities.data}
              searchable
              searchPlaceholder='Search by address...'
              searchValue={String(query.search || '')}
              onSearchChange={(value) => searchTable(String(value || ''))}
              pagination={{
                page: leaseableEntities.meta.currentPage,
                pageSize: leaseableEntities.meta.perPage,
                total: leaseableEntities.meta.total,
                onPageChange: changePage,
                onPageSizeChange: changeRows,
              }}
              emptyMessage='No properties found'
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
