import type { SharedProps } from '@adonisjs/inertia/types'
import { Deferred, Head } from '@inertiajs/react'
import { Link } from '@inertiajs/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Settings } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { Column, PaginatedResponse } from '#types/extra'
import type { RawTeamMember } from '#types/model-types'
import { timeAgo } from '#utils/date'
import { DataTable } from '@/components/dashboard/data-table'
import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { LoadingSkeleton } from '@/components/ui'
import { AppCard } from '@/components/ui/app-card'
import { BaseModal } from '@/components/ui/base-modal'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { HStack } from '@/components/ui/hstack'
import { Label } from '@/components/ui/label'
import { Stack } from '@/components/ui/stack'
import { useInertiaParams } from '@/hooks/use-inertia-params'
import { type ServerErrorResponse, serverErrorResponder } from '@/lib/error'
import api from '@/lib/http'
import {
  PAGE_OPTIONS,
  type PageKey,
  TeamInvitations,
  TeamInvitationsInviteButton,
  togglePageInSet,
} from '@/pages/dashboard/components/team-invitations'

const memberColumns: Column<RawTeamMember>[] = [
  {
    key: '',
    header: 'Name',
    sortable: true,
    cell(row) {
      return <span className='font-medium'>{row.user.fullName || row.user.email || '—'}</span>
    },
  },
  {
    key: 'email',
    header: 'Email',
    sortable: true,
    cell(row) {
      return <span className='text-sm text-muted-foreground'>{row.user.email || '—'}</span>
    },
  },
  {
    key: 'role',
    header: 'Role',
    sortable: true,
    cell: (row) => <span className='capitalize'>{row.role}</span>,
  },
  {
    key: 'allowedPages',
    header: 'Page access',
    cell: (row) => {
      if (!row.allowedPages?.length)
        return <span className='text-sm text-muted-foreground'>All</span>
      const label = row.allowedPages
        .map((k) => PAGE_OPTIONS.find((o) => o.key === k)?.label || k)
        .join(', ')
      return <span className='text-sm text-muted-foreground'>{label}</span>
    },
  },
  { key: 'createdAt', header: 'Joined', cell: (row) => timeAgo(row.createdAt) },
]

interface TeamsPageProps extends SharedProps {
  members?: PaginatedResponse<RawTeamMember>
}

export default function TeamsPage({ members: membersProp }: TeamsPageProps) {
  const queryClient = useQueryClient()
  const { query, changePage, changeRows, searchTable } = useInertiaParams({
    page: 1,
    perPage: 10,
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'asc',
  })
  const [editMember, setEditMember] = useState<RawTeamMember | null>(null)
  const [editMemberPages, setEditMemberPages] = useState<PageKey[]>(PAGE_OPTIONS.map((o) => o.key))

  const members = membersProp

  const updateMemberMutation = useMutation({
    mutationFn: async ({
      memberId,
      allowedPages,
    }: {
      memberId: string
      allowedPages: string[]
    }) => {
      await api.put(`/members/${memberId}`, { allowedPages })
    },
    onSuccess: () => {
      setEditMember(null)
      toast.success('Member updated')
      queryClient.invalidateQueries({ queryKey: ['dashboard-members'] })
    },
    onError: (err: ServerErrorResponse) => {
      toast.error(serverErrorResponder(err) || 'Failed to update member')
    },
  })

  const openEditMember = (row: RawTeamMember) => {
    setEditMember(row)
    setEditMemberPages(
      row.allowedPages?.length ? [...(row.allowedPages as PageKey[])] : PAGE_OPTIONS.map((o) => o.key),
    )
  }

  const memberColumnsWithActions: Column<RawTeamMember>[] = useMemo(
    () => [
      ...memberColumns,
      {
        key: 'actions',
        header: '',
        cell: (row) => (
          <div className='flex items-center gap-1'>
            <Link
              href={`/teams/members/${row.id}`}
              className='inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground h-9 w-9'
              aria-label='Member settings'>
              <Settings className='h-4 w-4' />
            </Link>
            <Button
              variant='ghost'
              size='icon'
              aria-label='Edit page access'
              onClick={() => openEditMember(row)}>
              <Pencil className='h-4 w-4' />
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <DashboardLayout>
      <Head title='Teams' />
      <div className='space-y-6'>
        <PageHeader
          title='Team members'
          description='Invite users and control which pages they can access.'
          actions={<TeamInvitationsInviteButton />}
        />

        <TeamInvitations />

        <Deferred data="members" fallback={<LoadingSkeleton type='table' />}>
          <AppCard title='Members' description='Users with dashboard access.'>
            <DataTable
              columns={memberColumnsWithActions}
              data={members?.data ?? []}
              searchable
              searchPlaceholder='Search members...'
              searchValue={String(query.search ?? '')}
              onSearchChange={(value) => {
                searchTable(value)
                changePage(1)
              }}
              pagination={
                members?.meta
                  ? {
                      page: members.meta.currentPage,
                      pageSize: members.meta.perPage,
                      total: members.meta.total,
                      onPageChange: (p) => changePage(p),
                      onPageSizeChange: (pageSize) => {
                        changeRows(pageSize)
                        changePage(1)
                      },
                    }
                  : undefined
              }
              emptyMessage='No members found'
            />
          </AppCard>
        </Deferred>

        {/* Edit member page access modal */}
        <BaseModal
          title='Edit page access'
          description={
            editMember
              ? `Choose which pages ${editMember.user.fullName || editMember.user.email || 'this member'} can access.`
              : ''
          }
          open={Boolean(editMember)}
          onOpenChange={(open) => !open && setEditMember(null)}
          primaryText='Save'
          secondaryText='Cancel'
          primaryVariant='default'
          secondaryVariant='outline'
          isLoading={updateMemberMutation.isPending}
          onSecondaryAction={() => setEditMember(null)}
          onPrimaryAction={() => {
            if (!editMember) return
            updateMemberMutation.mutate({
              memberId: editMember.id,
              allowedPages: editMemberPages,
            })
          }}
          className='max-w-2xl'>
          <Stack spacing={4}>
            <div className='space-y-2'>
              <Label>Page access</Label>
              <div className='grid gap-2 rounded-lg border border-border p-3'>
                {PAGE_OPTIONS.map((opt) => {
                  const checked = editMemberPages.includes(opt.key)
                  const disabled = Boolean(opt.required)
                  return (
                    <HStack key={opt.key} spacing={3} align='start'>
                      <Checkbox
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={(v) =>
                          setEditMemberPages((prev) => togglePageInSet(prev, opt.key, v === true))
                        }
                      />
                      <div className='min-w-0'>
                        <div className='text-sm font-medium'>{opt.label}</div>
                        <div className='text-xs text-muted-foreground'>{opt.description}</div>
                      </div>
                    </HStack>
                  )
                })}
              </div>
              <p className='text-xs text-muted-foreground'>Dashboard is always included.</p>
            </div>
          </Stack>
        </BaseModal>
      </div>
    </DashboardLayout>
  )
}
