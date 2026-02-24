import { Link } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { Column, PaginatedResponse } from '#types/extra'
import type { RawLease } from '#types/model-types'
import { formatCurrency } from '#utils/currency'
import { DataTable } from '@/components/dashboard/data-table'
import { AppCard } from '@/components/ui/app-card'
import { dateFormatter } from '@/lib/date'
import api from '@/lib/http'
import { StatusBadge } from '@/pages/leases/components/status'

const columns: Column<RawLease>[] = [
  {
    key: 'name',
    header: 'Lease',
    minWidth: 200,
    flex: 1,
    cell: (row) => (
      <Link href={`/leases/${row.id}`} className='font-medium hover:underline'>
        {row.cleanName ?? row.name ?? row.shortId}
      </Link>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: 140,
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: 'rentAmount',
    header: 'Rent',
    width: 100,
    cell: (row) => formatCurrency(row.rentAmount, row.currency) ?? '—',
  },
  {
    key: 'startDate',
    header: 'Start',
    width: 110,
    cell: (row) => (row.startDate ? dateFormatter(row.startDate) : '—'),
  },
  {
    key: 'endDate',
    header: 'End',
    width: 110,
    cell: (row) => (row.endDate ? dateFormatter(row.endDate) : '—'),
  },
]

type LeasesTabProps = {
  propertyId: string
}

export function LeasesTab({ propertyId }: LeasesTabProps) {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { data, isPending } = useQuery({
    queryKey: ['property-leases', propertyId, page, perPage],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<RawLease>>(
        `/leaseable-entities/${propertyId}/leases`,
        { params: { page, perPage } },
      )
      return res.data
    },
  })

  const leases = data?.data ?? []
  const meta = data?.meta

  return (
    <AppCard title='Leases' description={`Leases for this property (${meta?.total ?? 0} total)`}>
      <DataTable
        columns={columns}
        data={leases}
        loading={isPending}
        emptyMessage='No leases for this leaseable entity.'
        pagination={
          meta
            ? {
                page: meta.currentPage,
                pageSize: meta.perPage,
                total: meta.total,
                onPageChange: setPage,
                onPageSizeChange: (size) => {
                  setPerPage(size)
                  setPage(1)
                },
              }
            : undefined
        }
      />
    </AppCard>
  )
}
