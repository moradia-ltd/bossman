import { Link } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { ExternalLink, Eye, FileText, Pencil } from 'lucide-react'
import { useState } from 'react'
import type { Column } from '#types/extra'
import type { TogethaCurrencies } from '#utils/currency'
import { formatCurrency } from '#utils/currency'
import { DataTable } from '@/components/dashboard/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { dateFormatter } from '@/lib/date'
import api from '@/lib/http'

const STRIPE_DASHBOARD_INVOICE_URL = (id: string) => `https://dashboard.stripe.com/invoices/${id}`

export type RawOrgInvoice = {
  id: string
  number: string | null
  status: string
  amountPaid: number
  amountDue: number
  total: number
  currency: string
  createdAt: string | null
  hostedInvoiceUrl: string | null
  invoicePdf: string | null
}

const getColumns = (
  orgId: string,
  onView: (invoice: RawOrgInvoice) => void,
): Column<RawOrgInvoice>[] => [
    {
      key: 'number',
      header: 'Invoice',
      minWidth: 120,
      cell: (row) => <span className='font-medium'>{row.number ?? row.id}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: 100,
      cell: (row) => (
        <Badge variant={row.status === 'paid' ? 'default' : 'secondary'} className='capitalize'>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'total',
      header: 'Amount',
      width: 120,
      cell: (row) => formatCurrency(row.total / 100, row.currency as TogethaCurrencies),
    },
    {
      key: 'createdAt',
      header: 'Date',
      width: 120,
      cell: (row) => (row.createdAt ? dateFormatter(row.createdAt) : '—'),
    },
    {
      key: 'actions',
      header: '',
      width: 180,
      cell: (row) => (
        <div className='flex flex-wrap gap-1'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onView(row)}
            className='inline-flex items-center gap-1'>
            <Eye className='h-3.5 w-3.5' />
            View
          </Button>
          {row.status === 'draft' && (
            <>
              <Button variant='ghost' size='sm' asChild>
                <Link
                  href={`/orgs/${orgId}/invoices/${row.id}/line-items/create`}
                  className='inline-flex items-center gap-1'>
                  <Pencil className='h-3.5 w-3.5' />
                  Edit
                </Link>
              </Button>
            </>
          )}
          {row.hostedInvoiceUrl && (
            <Button variant='ghost' size='sm' asChild>
              <a
                href={row.hostedInvoiceUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1'>
                <ExternalLink className='h-3.5 w-3.5' />
                Open
              </a>
            </Button>
          )}
          {row.invoicePdf && (
            <Button variant='ghost' size='sm' asChild>
              <a
                href={row.invoicePdf}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1'>
                <FileText className='h-3.5 w-3.5' />
                PDF
              </a>
            </Button>
          )}
        </div>
      ),
    },
  ]

type InvoicesTabProps = {
  orgId: string
}

export function InvoicesTab({ orgId }: InvoicesTabProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<RawOrgInvoice | null>(null)
  const columns = getColumns(orgId, (invoice) => setSelectedInvoice(invoice))

  const { data: invoices, isPending } = useQuery({
    queryKey: ['org-invoices', orgId],
    queryFn: async () => {
      const res = await api.get<{ data: RawOrgInvoice[] }>(`/orgs/${orgId}/invoices`)
      return res.data
    },
  })

  const invoiceList = invoices?.data ?? []

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Invoices for this organisation (from Stripe)</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={invoiceList}
            loading={isPending}
            emptyMessage='No invoices yet.'
          />
        </CardContent>
      </Card>

      <Sheet open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <SheetContent side='right' className='w-full sm:max-w-md'>
          {selectedInvoice && (
            <>
              <SheetHeader>
                <SheetTitle>Invoice {selectedInvoice.number ?? selectedInvoice.id}</SheetTitle>
                <SheetDescription>Invoice details from Stripe</SheetDescription>
              </SheetHeader>
              <div className='mt-6 space-y-4'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Status</span>
                  <Badge
                    variant={selectedInvoice.status === 'paid' ? 'default' : 'secondary'}
                    className='capitalize'>
                    {selectedInvoice.status}
                  </Badge>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Amount</span>
                  <span>
                    {formatCurrency(
                      selectedInvoice.total / 100,
                      selectedInvoice.currency as TogethaCurrencies,
                    )}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Amount due</span>
                  <span>
                    {formatCurrency(
                      selectedInvoice.amountDue / 100,
                      selectedInvoice.currency as TogethaCurrencies,
                    )}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Date</span>
                  <span>
                    {selectedInvoice.createdAt ? dateFormatter(selectedInvoice.createdAt) : '—'}
                  </span>
                </div>

                <div className='flex flex-col gap-2 pt-4'>
                  {selectedInvoice.status === 'draft' && (
                    <Button asChild>
                      <a
                        href={STRIPE_DASHBOARD_INVOICE_URL(selectedInvoice.id)}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center justify-center gap-2'>
                        <ExternalLink className='h-4 w-4' />
                        Complete on Stripe
                      </a>
                    </Button>
                  )}
                  {selectedInvoice.status === 'draft' && (
                    <Button variant='outline' asChild>
                      <Link
                        href={`/orgs/${orgId}/invoices/${selectedInvoice.id}/line-items/create`}
                        className='inline-flex items-center justify-center gap-2'>
                        <Pencil className='h-4 w-4' />
                        Add line item
                      </Link>
                    </Button>
                  )}
                  {selectedInvoice.hostedInvoiceUrl && (
                    <Button variant='outline' asChild>
                      <a
                        href={selectedInvoice.hostedInvoiceUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center justify-center gap-2'>
                        <ExternalLink className='h-4 w-4' />
                        View hosted invoice
                      </a>
                    </Button>
                  )}
                  {selectedInvoice.invoicePdf && (
                    <Button variant='outline' asChild>
                      <a
                        href={selectedInvoice.invoicePdf}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center justify-center gap-2'>
                        <FileText className='h-4 w-4' />
                        Download PDF
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
