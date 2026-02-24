import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { Column, PaginatedResponse } from '#types/extra'
import type { RawActivity } from '#types/model-types'
import { DataTable } from '@/components/dashboard/data-table'
import { Badge } from '@/components/ui/badge'
import { AppCard } from '@/components/ui/app-card'
import { dateFormatter } from '@/lib/date'
import api from '@/lib/http'

const columns: Column<RawActivity>[] = [
  { key: 'summary', header: 'Summary', minWidth: 200, flex: 1 },
  {
    key: 'createdAt',
    header: 'Date',
    width: 140,
    cell: (row) => (row.createdAt ? dateFormatter(row.createdAt) : '—'),
  },
  {
    key: 'isSystemAction',
    header: 'Source',
    width: 90,
    cell: (row) =>
      row.isSystemAction ? (
        <Badge variant='secondary'>System</Badge>
      ) : (
        <Badge variant='outline'>{row.user?.name}</Badge>
      ),
  },
]

type ActivitiesTabProps = {
  orgId: string
}

export function ActivitiesTab({ orgId }: ActivitiesTabProps) {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { data, isPending } = useQuery({
    queryKey: ['org-activities', orgId, page, perPage],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<RawActivity>>(`/orgs/${orgId}/activities`, {
        params: { page, perPage },
      })
      return res.data
    },
  })

  const activities = data?.data ?? []
  const meta = data?.meta

  return (
    <AppCard title='Activities' description='Recent activity for this organisation'>
      <DataTable
        columns={columns}
        data={activities}
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
