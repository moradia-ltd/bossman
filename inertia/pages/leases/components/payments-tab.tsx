import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { Column, PaginatedResponse } from '#types/extra'
import type { RawPayment } from '#types/model-types'
import { formatCurrency } from '#utils/currency'
import { DataTable } from '@/components/dashboard/data-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dateFormatter } from '@/lib/date'
import api from '@/lib/http'

const columns: Column<RawPayment>[] = [
  {
    key: 'amountDue',
    header: 'Due',
    width: 100,
    cell: (row) => formatCurrency(row.amountDue, row.lease.currency),
  },
  {
    key: 'amountPaid',
    header: 'Paid',
    width: 100,
    cell: (row) => formatCurrency(row.amountPaid, row.lease.currency),
  },
  {
    key: 'status',
    header: 'Status',
    width: 100,
    cell: (row) => <span className='capitalize'>{row.statusAlt}</span>,
  },
  {
    key: 'dueDate',
    header: 'Due date',
    width: 110,
    cell: (row) => (row.dueDate ? dateFormatter(row.dueDate) : '—'),
  },
  {
    key: 'paymentDate',
    header: 'Paid date',
    width: 110,
    cell: (row) => (row.paymentDate ? dateFormatter(row.paymentDate) : '—'),
  },
]

type PaymentsTabProps = {
  leaseId: string
}

export function PaymentsTab({ leaseId }: PaymentsTabProps) {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { data, isPending } = useQuery({
    queryKey: ['lease-payments', leaseId, page, perPage],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<RawPayment>>(`/leases/${leaseId}/payments`, {
        params: { page, perPage },
      })
      return res.data
    },
  })

  const payments = data?.data ?? []
  const meta = data?.meta

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
        <CardDescription>Payment history for this lease</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={payments}
          loading={isPending}
          emptyMessage='No payments yet.'
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
      </CardContent>
    </Card>
  )
}
