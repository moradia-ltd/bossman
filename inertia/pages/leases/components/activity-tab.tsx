import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import type { PaginatedResponse } from '#types/extra'
import type { RawActivity } from '#types/model-types'
import { activityTabColumns } from '@/components/dashboard/activity-columns'
import { DataTable } from '@/components/dashboard/data-table'
import { AppCard } from '@/components/ui/app-card'
import api from '@/lib/http'
import { tablePaginationFromMeta } from '@/lib/pagination'

interface ActivityTabProps {
  leaseId: string
}

export function ActivityTab({ leaseId }: ActivityTabProps) {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { data, isPending } = useQuery({
    queryKey: ['lease-activity', leaseId, page, perPage],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<RawActivity>>(`/leases/${leaseId}/activity`, {
        params: { page, perPage },
      })
      return res.data
    },
  })

  const activity = data?.data ?? []
  const meta = data?.meta

  return (
    <AppCard title='Activity' description='Recent activity for this lease'>
      <DataTable
        columns={activityTabColumns}
        data={activity}
        loading={isPending}
        emptyMessage='No activity yet.'
        pagination={tablePaginationFromMeta(meta, {
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPerPage(size)
            setPage(1)
          },
        })}
      />
    </AppCard>
  )
}
