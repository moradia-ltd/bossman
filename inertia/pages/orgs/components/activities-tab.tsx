import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import type { Column, PaginatedResponse } from '#types/extra'
import type { RawActivity } from '#types/model-types'
import { activityTabColumns } from '@/components/dashboard/activity-columns'
import { DataTable } from '@/components/dashboard/data-table'
import { AppCard } from '@/components/ui/app-card'
import api from '@/lib/http'

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
        columns={activityTabColumns}
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
