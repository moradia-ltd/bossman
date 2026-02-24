import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { Column, PaginatedResponse } from '#types/extra'
import type { RawProperty } from '#types/model-types'
import { DataTable } from '@/components/dashboard/data-table'
import { AppCard } from '@/components/ui/app-card'
import api from '@/lib/http'

const columns: Column<RawProperty>[] = [
  {
    key: 'summarizedAddress',
    header: 'Address',

    flex: 1,
    cell: (row) =>
      row.summarizedAddress ??
      [row.addressLineOne, row.city, row.postCode].filter(Boolean).join(', '),
  },
  {
    key: 'propertyType',
    header: 'Type',
    width: 200,
    cell: (row) => (row.propertyType ? String(row.propertyType) : '—'),
  },
]

type PropertiesTabProps = {
  orgId: string
}

export function PropertiesTab({ orgId }: PropertiesTabProps) {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { data, isPending } = useQuery({
    queryKey: ['org-properties', orgId, page, perPage],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<RawProperty>>(`/orgs/${orgId}/properties`, {
        params: { page, perPage },
      })
      return res.data
    },
  })

  const properties = data?.data ?? []
  const meta = data?.meta

  return (
    <AppCard title='Properties' description='Properties for this organisation'>
      <DataTable
        columns={columns}
        data={properties}
        loading={isPending}
        emptyMessage='No properties yet.'
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
