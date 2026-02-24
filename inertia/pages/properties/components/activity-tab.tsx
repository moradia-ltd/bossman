import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { Column, PaginatedResponse } from '#types/extra'
import type { RawActivity } from '#types/model-types'
import { DataTable } from '@/components/dashboard/data-table'
import { AppCard } from '@/components/ui/app-card'
import { Badge } from '@/components/ui/badge'
import { dateFormatter } from '@/lib/date'
import api from '@/lib/http'

const columns: Column<RawActivity>[] = [
  { key: 'summary', header: 'Summary' },
  {
    key: 'createdAt',
    header: 'Date',

    cell: (row) => (row.createdAt ? dateFormatter(row.createdAt) : '—'),
  },
  {
    key: 'isSystemAction',
    header: 'Source',

    cell: (row) =>
      row.isSystemAction ? (
        <Badge variant='secondary'>System</Badge>
      ) : (
        <Badge variant='outline'>{row.user?.name}</Badge>
      ),
  },
]

type ActivityTabProps = {
  propertyId: string
}

export function ActivityTab({ propertyId }: ActivityTabProps) {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { data, isPending } = useQuery({
    queryKey: ['property-activity', propertyId, page, perPage],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<RawActivity>>(
        `/leaseable-entities/${propertyId}/activity`,
        { params: { page, perPage } },
      )
      return res.data
    },
  })

  const activity = data?.data ?? []
  const meta = data?.meta

  return (
    <AppCard title='Activity' description='Recent activity for this property'>
      <DataTable
        columns={columns}
        data={activity}
        loading={isPending}
        emptyMessage='No activity yet.'
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
