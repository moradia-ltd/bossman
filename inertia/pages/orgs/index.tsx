import type { SharedProps } from '@adonisjs/inertia/types'
import { Head, Link, router } from '@inertiajs/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Briefcase, Building2, FlaskConical, Plus, Star, User } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { Column, PaginatedResponse } from '#types/extra'
import type { RawOrg } from '#types/model-types'
import { timeAgo } from '#utils/date'
import { formatNumber } from '#utils/functions'
import { DataTable } from '@/components/dashboard/data-table'
import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { StatCard } from '@/components/dashboard/stat-card'
import { AppCard } from '@/components/ui/app-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SimpleGrid } from '@/components/ui/simplegrid'
import { useInertiaParams } from '@/hooks/use-inertia-params'
import { type ServerErrorResponse, serverErrorResponder } from '@/lib/error'
import api from '@/lib/http'

type OrgsStats = { total: number; landlords: number; agencies: number }

const columns: Column<RawOrg>[] = [
  {
    key: 'cleanName',
    header: 'Name',
    cell: (row) => (
      <div className='space-y-1'>
        <Link href={`/orgs/${row.id}`} className='font-medium hover:underline'>
          {row.cleanName}
        </Link>
        {row.companyName && row.companyName !== row.cleanName && (
          <div className='text-xs text-muted-foreground'>{row.companyName}</div>
        )}
      </div>
    ),
  },
  {
    key: 'ownerRole',
    header: 'Type',
    cell: (row) => (
      <Badge variant='outline' className='capitalize'>
        {row.ownerRole}
      </Badge>
    ),
  },
  {
    key: 'country',
    header: 'Country',
    cell: (row) => row.country ?? '—',
  },
  {
    key: 'hasActiveSubscription',
    header: 'Subscription',
    cell: (row) =>
      row.hasActiveSubscription ? (
        <Badge variant='default'>Active</Badge>
      ) : (
        <Badge variant='secondary'>Inactive</Badge>
      ),
  },
  {
    key: 'isFavourite',
    header: 'Favourite',
    width: 90,
    cell: (row) =>
      row.isFavourite ? (
        <Badge variant='secondary' className='gap-1 w-fit'>
          <Star className='h-3 w-3' />
        </Badge>
      ) : (
        <span className='text-muted-foreground text-sm'>—</span>
      ),
  },
  {
    key: 'isTestAccount',
    header: 'Test',
    width: 110,
    cell: (row) =>
      row.isTestAccount ? (
        <Badge variant='outline' className='gap-1 w-fit'>
          <FlaskConical className='h-3 w-3' />
          Yes
        </Badge>
      ) : (
        <span className='text-muted-foreground text-sm'>—</span>
      ),
  },
  {
    key: 'createdAt',
    header: 'Created at',
    cell: (row) => timeAgo(row.createdAt ?? ''),
  },
]

interface OrgsIndexProps extends SharedProps {
  orgs: PaginatedResponse<RawOrg>
}

export default function OrgsIndex({ orgs }: OrgsIndexProps) {
  const { changePage, changeRows, searchTable, query } = useInertiaParams({
    page: 1,
    perPage: 20,
    search: '',
  })
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const { data: stats } = useQuery({
    queryKey: ['orgs-stats'],
    queryFn: async () => {
      const res = await api.get<OrgsStats>('/orgs/stats')
      return res.data
    },
  })

  const bulkMakeFavouriteMutation = useMutation({
    mutationFn: (orgIds: string[]) => api.post('/orgs/actions/bulk-make-favourite', { orgIds }),
    onSuccess: (_, orgIds) => {
      toast.success(`${orgIds.length} org(s) marked as favourite`)
      setSelectedRows([])
      router.reload()
    },
    onError: (err: ServerErrorResponse) => {
      toast.error(serverErrorResponder(err) || 'Failed to update')
    },
  })

  const bulkUndoFavouriteMutation = useMutation({
    mutationFn: (orgIds: string[]) => api.post('/orgs/actions/bulk-undo-favourite', { orgIds }),
    onSuccess: (_, orgIds) => {
      toast.success(`${orgIds.length} org(s) removed from favourites`)
      setSelectedRows([])
      router.reload()
    },
    onError: (err: ServerErrorResponse) => {
      toast.error(serverErrorResponder(err) || 'Failed to update')
    },
  })

  const bulkMakeTestAccountMutation = useMutation({
    mutationFn: (orgIds: string[]) => api.post('/orgs/actions/bulk-make-test-account', { orgIds }),
    onSuccess: (_, orgIds) => {
      toast.success(`${orgIds.length} org(s) marked as test account`)
      setSelectedRows([])
      router.reload()
    },
    onError: (err: ServerErrorResponse) => {
      toast.error(serverErrorResponder(err) || 'Failed to update')
    },
  })

  const bulkUndoTestAccountMutation = useMutation({
    mutationFn: (orgIds: string[]) => api.post('/orgs/actions/bulk-undo-test-account', { orgIds }),
    onSuccess: (_, orgIds) => {
      toast.success(`${orgIds.length} org(s) removed test account flag`)
      setSelectedRows([])
      router.reload()
    },
    onError: (err: ServerErrorResponse) => {
      toast.error(serverErrorResponder(err) || 'Failed to update')
    },
  })

  const bulkActions = [
    {
      label: 'Make favourite',
      variant: 'outline' as const,
      action: (ids: string[]) => bulkMakeFavouriteMutation.mutate(ids),
    },
    {
      label: 'Undo favourite',
      variant: 'outline' as const,
      action: (ids: string[]) => bulkUndoFavouriteMutation.mutate(ids),
    },
    {
      label: 'Make test account',
      variant: 'outline' as const,
      action: (ids: string[]) => bulkMakeTestAccountMutation.mutate(ids),
    },
    {
      label: 'Undo test account',
      variant: 'outline' as const,
      action: (ids: string[]) => bulkUndoTestAccountMutation.mutate(ids),
    },
  ]

  return (
    <DashboardLayout>
      <Head title='Orgs' />
      <div className='space-y-6'>
        <PageHeader
          title='Customers'
          description='View and manage customers.'
          actions={
            <Button asChild>
              <Link href='/orgs/create'>
                <Plus className='mr-2 h-4 w-4' />
                Create
              </Link>
            </Button>
          }
        />

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing={4}>
          <StatCard
            title='Total'
            description='All customers'
            value={formatNumber(stats?.total)}
            icon={Building2}
          />
          <StatCard
            title='Landlords'
            description='Landlord-owned customers'
            value={formatNumber(stats?.landlords)}
            icon={User}
          />
          <StatCard
            title='Agencies'
            description='Agency-owned customers'
            value={formatNumber(stats?.agencies)}
            icon={Briefcase}
          />
        </SimpleGrid>

        <AppCard title='All customers' description={`${orgs.meta.total} total`}>
          <DataTable
            columns={columns}
            data={orgs.data}
            searchable
            searchPlaceholder='Search by name or company...'
            searchValue={String(query.search || '')}
            onSearchChange={(value) => searchTable(String(value || ''))}
            pagination={{
              page: orgs.meta.currentPage,
              pageSize: orgs.meta.perPage,
              total: orgs.meta.total,
              onPageChange: changePage,
              onPageSizeChange: changeRows,
            }}
            emptyMessage='No customers found'
            selectable
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            getRowId={(row) => String(row.id)}
            bulkActions={bulkActions}
          />
        </AppCard>
      </div>
    </DashboardLayout>
  )
}
