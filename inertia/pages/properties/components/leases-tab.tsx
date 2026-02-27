import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import type { PaginatedResponse } from '#types/extra'
import type { RawLease } from '#types/model-types'
import { DataTable } from '@/components/dashboard/data-table'
import { leasesTableColumns } from '@/components/leases'
import { AppCard } from '@/components/ui/app-card'
import api from '@/lib/http'
import { tablePaginationFromMeta } from '@/lib/pagination'

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
        columns={leasesTableColumns}
        data={leases}
        loading={isPending}
        emptyMessage='No leases for this leaseable entity.'
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
