import { Head } from '@inertiajs/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { Column } from '#types/extra'
import type { RawTeam } from '#types/model-types'
import { DataTable } from '@/components/dashboard/data-table'
import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BaseModal } from '@/components/ui/base-modal'
import { Button } from '@/components/ui/button'
import { AppCard } from '@/components/ui/app-card'
import { Checkbox } from '@/components/ui/checkbox'
import { HStack } from '@/components/ui/hstack'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Stack } from '@/components/ui/stack'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { type ServerErrorResponse, serverErrorResponder } from '@/lib/error'
import api from '@/lib/http'

type PageKey =
  | 'dashboard'
  | 'teams'
  | 'blog'
  | 'orgs'
  | 'leases'
  | 'properties'
  | 'pushNotifications'
  | 'dbBackups'

const PAGE_OPTIONS: Array<{
  key: PageKey
  label: string
  description: string
  required?: boolean
}> = [
    { key: 'dashboard', label: 'Dashboard', description: 'Overview and activity', required: true },
    { key: 'teams', label: 'Teams', description: 'Manage teams and invites' },
    { key: 'blog', label: 'Blog', description: 'Manage blog posts, tags, categories, authors' },
    { key: 'orgs', label: 'Organisations', description: 'Organisations and customers' },
    { key: 'leases', label: 'Leases', description: 'Leases and tenancies' },
    { key: 'properties', label: 'Properties', description: 'Properties and leaseable entities' },
    { key: 'pushNotifications', label: 'Push notifications', description: 'Send and manage push notifications' },
    { key: 'dbBackups', label: 'DB backups', description: 'Create and manage database backups' },
  ]

interface TeamMemberRow {
  id: string
  fullName: string | null
  email: string | null
  role: string
  createdAt: string
  allowedPages: PageKey[] | null
}

function togglePageInSet(pages: PageKey[], key: PageKey, next: boolean): PageKey[] {
  const set = new Set(pages)
  if (next) set.add(key)
  else set.delete(key)
  set.add('dashboard')
  return Array.from(set)
}

interface InvitationRow {
  id: string
  email: string
  role: string
  createdAt: string
  invitedBy: string | null
  allowedPages: PageKey[] | null
}

const memberColumns: Column<TeamMemberRow>[] = [
  { key: 'fullName', header: 'Name', sortable: true },
  { key: 'email', header: 'Email', sortable: true },
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
      if (!row.allowedPages?.length) return <span className='text-sm text-muted-foreground'>All</span>
      const label = row.allowedPages
        .map((k) => PAGE_OPTIONS.find((o) => o.key === k)?.label || k)
        .join(', ')
      return <span className='text-sm text-muted-foreground'>{label}</span>
    },
  },
  {
    key: 'createdAt',
    header: 'Joined',
    sortable: true,
    cell: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'),
  },
]

export default function TeamsPage() {
  const queryClient = useQueryClient()
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitePages, setInvitePages] = useState<PageKey[]>(
    PAGE_OPTIONS.map((o) => o.key),
  )

  const [membersPage, setMembersPage] = useState(1)
  const [membersPerPage, setMembersPerPage] = useState(10)
  const [membersSearch, setMembersSearch] = useState('')
  const [editMember, setEditMember] = useState<TeamMemberRow | null>(null)
  const [editMemberPages, setEditMemberPages] = useState<PageKey[]>(PAGE_OPTIONS.map((o) => o.key))
  const [editInvitation, setEditInvitation] = useState<InvitationRow | null>(null)
  const [editInvitationPages, setEditInvitationPages] = useState<PageKey[]>(PAGE_OPTIONS.map((o) => o.key))

  const teamsQuery = useQuery({
    queryKey: ['dashboard-team'],
    queryFn: async () => {
      const res = await api.get<{ data: { teams: RawTeam[] } }>('/teams', {
        params: { kind: 'admin' },
      })
      return res.data.data.teams
    },
  })

  const teams = teamsQuery.data ?? []
  const dashboardTeam = teams[0] ?? null

  // Reset list state when switching (shouldn't happen, but keep safe)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dashboardTeamId = dashboardTeam?.id || ''

  const membersQuery = useQuery({
    queryKey: ['dashboard-team-members', dashboardTeamId, membersPage, membersPerPage, membersSearch],
    enabled: Boolean(dashboardTeamId),
    queryFn: async () => {
      const res = await api.get<{
        data: {
          members: Array<{
            id: string
            role: string
            createdAt: string
            fullName: string | null
            email: string | null
            allowedPages: PageKey[] | null
          }>
          invitations: Array<{
            id: string
            email: string
            role: string
            createdAt: string
            invitedBy: string | null
            allowedPages: PageKey[] | null
          }>
          meta: { currentPage: number; perPage: number; total: number; lastPage: number }
        }
      }>(`/teams/${dashboardTeamId}/members`, {
        params: {
          page: membersPage,
          perPage: membersPerPage,
          search: membersSearch || undefined,
        },
      })
      return res.data.data
    },
  })

  const memberRows = useMemo<TeamMemberRow[]>(() => {
    return (membersQuery.data?.members ?? []).map((m) => ({
      ...m,
      fullName: m.fullName || '—',
      email: m.email || '—',
      role: m.role || 'member',
      createdAt: m.createdAt || '',
      allowedPages: (m.allowedPages as PageKey[] | null) ?? null,
    }))
  }, [membersQuery.data?.members])

  const invitationRows = useMemo<InvitationRow[]>(() => {
    return membersQuery.data?.invitations ?? []
  }, [membersQuery.data?.invitations])

  const inviteMutation = useMutation({
    mutationFn: (payload: { teamId: string; email: string; allowedPages: PageKey[] }) =>
      api.post(`/teams/${payload.teamId}/invitations`, {
        email: payload.email,
        allowedPages: payload.allowedPages,
      }),
    onSuccess: async () => {
      setInviteEmail('')
      setInvitePages(PAGE_OPTIONS.map((o) => o.key))
      toast.success('Invite sent successfully')
      // Invalidate and refetch the members query to show the new invitation
      await queryClient.invalidateQueries({
        queryKey: ['dashboard-team-members', dashboardTeamId],
      })
    },
    onError: (err: ServerErrorResponse) => {
      toast.error(serverErrorResponder(err) || 'Failed to send invite', {
        description: 'Please try again.',
      })
    },
  })

  const toggleInvitePage = (key: PageKey, next: boolean) => {
    if (key === 'dashboard') return
    setInvitePages((prev) => togglePageInSet(prev, key, next))
  }

  const updateMemberMutation = useMutation({
    mutationFn: async ({ memberId, allowedPages }: { memberId: string; allowedPages: PageKey[] }) => {
      if (!dashboardTeam) throw new Error('No team')
      await api.put(`/teams/${dashboardTeam.id}/members/${memberId}`, { allowedPages })
    },
    onSuccess: () => {
      setEditMember(null)
      toast.success('Member updated')
      queryClient.invalidateQueries({ queryKey: ['dashboard-team-members', dashboardTeamId] })
    },
    onError: (err: ServerErrorResponse) => {
      toast.error(serverErrorResponder(err) || 'Failed to update member')
    },
  })

  const updateInvitationMutation = useMutation({
    mutationFn: async ({ invitationId, allowedPages }: { invitationId: string; allowedPages: PageKey[] }) => {
      if (!dashboardTeam) throw new Error('No team')
      await api.put(`/teams/${dashboardTeam.id}/invitations/${invitationId}`, { allowedPages })
    },
    onSuccess: () => {
      setEditInvitation(null)
      toast.success('Invitation updated')
      queryClient.invalidateQueries({ queryKey: ['dashboard-team-members', dashboardTeamId] })
    },
    onError: (err: ServerErrorResponse) => {
      toast.error(serverErrorResponder(err) || 'Failed to update invitation')
    },
  })

  const openEditMember = (row: TeamMemberRow) => {
    setEditMember(row)
    setEditMemberPages(row.allowedPages?.length ? [...row.allowedPages] : PAGE_OPTIONS.map((o) => o.key))
  }
  const openEditInvitation = (inv: InvitationRow) => {
    setEditInvitation(inv)
    setEditInvitationPages(inv.allowedPages?.length ? [...inv.allowedPages] : PAGE_OPTIONS.map((o) => o.key))
  }

  const memberColumnsWithActions: Column<TeamMemberRow>[] = useMemo(
    () => [
      ...memberColumns,
      {
        key: 'actions',
        header: '',
        cell: (row: TeamMemberRow) => (
          <Button
            variant='ghost'
            size='icon'
            aria-label='Edit page access'
            onClick={() => openEditMember(row)}>
            <Pencil className='h-4 w-4' />
          </Button>
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
          actions={
            <BaseModal
              title='Invite member'
              description='Select the pages this person can access, then send the invite.'
              trigger={
                <Button leftIcon={<Plus className='h-4 w-4' />} isLoading={inviteMutation.isPending} loadingText='Sending invite...'>
                  Invite member
                </Button>
              }
              primaryText='Send invite'
              secondaryText='Cancel'
              primaryVariant='default'
              secondaryVariant='outline'
              isLoading={inviteMutation.isPending}
              primaryDisabled={!inviteEmail.trim() || !dashboardTeam}
              onPrimaryAction={async () => {
                if (!dashboardTeam) return
                const email = inviteEmail.trim()
                if (!email) return
                inviteMutation.mutate({
                  teamId: dashboardTeam.id,
                  email,
                  allowedPages: invitePages,
                })
              }}
              onSecondaryAction={() => {
                setInviteEmail('')
                setInvitePages(PAGE_OPTIONS.map((o) => o.key))
              }}
              className='max-w-2xl'>
              {teamsQuery.isLoading ? (
                <div className='text-sm text-muted-foreground py-4'>Loading teams…</div>
              ) : teamsQuery.isError ? (
                <Alert variant='destructive'>
                  <AlertDescription>Failed to load team.</AlertDescription>
                </Alert>
              ) : dashboardTeam ? (
                <Stack spacing={4}>
                  <div className='space-y-2'>
                    <Label htmlFor='inviteEmail'>Invite by email</Label>
                    <Input
                      id='inviteEmail'
                      type='email'
                      placeholder='staff@company.com'
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label>Page access</Label>
                    <div className='grid gap-2 rounded-lg border border-border p-3'>
                      {PAGE_OPTIONS.map((opt) => {
                        const checked = invitePages.includes(opt.key)
                        const disabled = Boolean(opt.required)
                        return (
                          <HStack key={opt.key} spacing={3} align='start'>
                            <Checkbox
                              checked={checked}
                              disabled={disabled}
                              onCheckedChange={(v) => toggleInvitePage(opt.key, v)}
                            />
                            <div className='min-w-0'>
                              <div className='text-sm font-medium'>{opt.label}</div>
                              <div className='text-xs text-muted-foreground'>{opt.description}</div>
                            </div>
                          </HStack>
                        )
                      })}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Dashboard is always included so invitees have a landing page.
                    </p>
                  </div>
                </Stack>
              ) : (
                <div className='text-sm text-muted-foreground py-4'>
                  Team is initializing. Refresh this page in a moment.
                </div>
              )}
            </BaseModal>
          }
        />

        {dashboardTeam ? (
          <>
            {invitationRows.length > 0 && (
              <AppCard
                title='Pending invitations'
                description='Invitations waiting for acceptance.'>
                  <div className='overflow-x-auto'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Page access</TableHead>
                          <TableHead>Invited by</TableHead>
                          <TableHead>Invited</TableHead>
                          <TableHead className='w-10' />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invitationRows.map((inv) => (
                          <TableRow key={inv.id}>
                            <TableCell className='font-medium'>{inv.email}</TableCell>
                            <TableCell>
                              <span className='capitalize'>{inv.role}</span>
                            </TableCell>
                            <TableCell>
                              {!inv.allowedPages?.length ? (
                                <span className='text-sm text-muted-foreground'>All</span>
                              ) : (
                                <span className='text-sm text-muted-foreground'>
                                  {inv.allowedPages
                                    .map((k) => PAGE_OPTIONS.find((o) => o.key === k)?.label || k)
                                    .join(', ')}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className='text-muted-foreground'>
                              {inv.invitedBy || '—'}
                            </TableCell>
                            <TableCell className='text-muted-foreground'>
                              {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '—'}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant='ghost'
                                size='icon'
                                aria-label='Edit page access'
                                onClick={() => openEditInvitation(inv)}>
                                <Pencil className='h-4 w-4' />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
              </AppCard>
            )}

            <AppCard
              title='Team members'
              description='Members with page access.'>
                {membersQuery.isError ? (
                  <Alert variant='destructive'>
                    <AlertDescription>Failed to load team members.</AlertDescription>
                  </Alert>
                ) : (
                  <DataTable
                    columns={memberColumnsWithActions}
                    data={memberRows}
                    searchable
                    searchPlaceholder='Search team members...'
                    searchValue={membersSearch}
                    onSearchChange={(value) => {
                      setMembersSearch(value)
                      setMembersPage(1)
                    }}
                    pagination={
                      membersQuery.data?.meta
                        ? {
                          page: membersQuery.data.meta.currentPage,
                          pageSize: membersQuery.data.meta.perPage,
                          total: membersQuery.data.meta.total,
                          onPageChange: (p) => setMembersPage(p),
                          onPageSizeChange: (pageSize) => {
                            setMembersPerPage(pageSize)
                            setMembersPage(1)
                          },
                        }
                        : undefined
                    }
                    loading={membersQuery.isFetching}
                    emptyMessage='No members found'
                  />
                )}
            </AppCard>
          </>
        ) : null}

        {/* Edit member page access modal */}
        <BaseModal
          title='Edit page access'
          description={
            editMember
              ? `Choose which pages ${editMember.fullName || editMember.email || 'this member'} can access.`
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
            if (!editMember || !dashboardTeam) return
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

        {/* Edit invitation page access modal */}
        <BaseModal
          title='Edit invitation page access'
          description={
            editInvitation
              ? `Choose which pages ${editInvitation.email} will have access to after accepting.`
              : ''
          }
          open={Boolean(editInvitation)}
          onOpenChange={(open) => !open && setEditInvitation(null)}
          primaryText='Save'
          secondaryText='Cancel'
          primaryVariant='default'
          secondaryVariant='outline'
          isLoading={updateInvitationMutation.isPending}
          onSecondaryAction={() => setEditInvitation(null)}
          onPrimaryAction={() => {
            if (!editInvitation || !dashboardTeam) return
            updateInvitationMutation.mutate({
              invitationId: editInvitation.id,
              allowedPages: editInvitationPages,
            })
          }}
          className='max-w-2xl'>
          <Stack spacing={4}>
            <div className='space-y-2'>
              <Label>Page access</Label>
              <div className='grid gap-2 rounded-lg border border-border p-3'>
                {PAGE_OPTIONS.map((opt) => {
                  const checked = editInvitationPages.includes(opt.key)
                  const disabled = Boolean(opt.required)
                  return (
                    <HStack key={opt.key} spacing={3} align='start'>
                      <Checkbox
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={(v) =>
                          setEditInvitationPages((prev) => togglePageInSet(prev, opt.key, v === true))
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
