import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { AppCard } from '@/components/ui/app-card'
import { BaseModal } from '@/components/ui/base-modal'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { HStack } from '@/components/ui/hstack'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Stack } from '@/components/ui/stack'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type ServerErrorResponse, serverErrorResponder } from '@/lib/error'
import api from '@/lib/http'

export type PageKey =
  | 'dashboard'
  | 'teams'
  | 'blog'
  | 'orgs'
  | 'leases'
  | 'properties'
  | 'pushNotifications'
  | 'dbBackups'

export const PAGE_OPTIONS: Array<{
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
  {
    key: 'pushNotifications',
    label: 'Push notifications',
    description: 'Send and manage push notifications',
  },
  { key: 'dbBackups', label: 'DB backups', description: 'Create and manage database backups' },
]

export function togglePageInSet(pages: PageKey[], key: PageKey, next: boolean): PageKey[] {
  const set = new Set(pages)
  if (next) set.add(key)
  else set.delete(key)
  set.add('dashboard')
  return Array.from(set)
}

export interface InvitationRow {
  id: string
  email: string
  role: string
  createdAt: string
  invitedBy: string | null
  allowedPages: PageKey[] | null
}

export function TeamInvitationsInviteButton() {
  const queryClient = useQueryClient()
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitePages, setInvitePages] = useState<PageKey[]>(PAGE_OPTIONS.map((o) => o.key))

  const inviteMutation = useMutation({
    mutationFn: (payload: { email: string; allowedPages: PageKey[] }) =>
      api.post('/invitations', {
        email: payload.email,
        allowedPages: payload.allowedPages,
      }),
    onSuccess: async () => {
      setInviteEmail('')
      setInvitePages(PAGE_OPTIONS.map((o) => o.key))
      toast.success('Invite sent successfully')
      await queryClient.invalidateQueries({
        queryKey: ['dashboard-invitations'],
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

  return (
    <BaseModal
      title='Invite member'
      description='Select the pages this person can access, then send the invite.'
      trigger={
        <Button
          leftIcon={<Plus className='h-4 w-4' />}
          isLoading={inviteMutation.isPending}
          loadingText='Sending invite...'>
          Invite member
        </Button>
      }
      primaryText='Send invite'
      secondaryText='Cancel'
      primaryVariant='default'
      secondaryVariant='outline'
      isLoading={inviteMutation.isPending}
      primaryDisabled={!inviteEmail.trim()}
      onPrimaryAction={async () => {
        const email = inviteEmail.trim()
        if (!email) return
        inviteMutation.mutate({
          email,
          allowedPages: invitePages,
        })
      }}
      onSecondaryAction={() => {
        setInviteEmail('')
        setInvitePages(PAGE_OPTIONS.map((o) => o.key))
      }}
      className='max-w-2xl'>
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
    </BaseModal>
  )
}

export function TeamInvitations() {
  const queryClient = useQueryClient()
  const [editInvitation, setEditInvitation] = useState<InvitationRow | null>(null)
  const [editInvitationPages, setEditInvitationPages] = useState<PageKey[]>(
    PAGE_OPTIONS.map((o) => o.key),
  )

  const invitationsQuery = useQuery({
    queryKey: ['dashboard-invitations'],
    queryFn: async () => {
      const res = await api.get<{
        data: {
          invitations: Array<{
            id: string
            email: string
            role: string
            createdAt: string
            invitedBy: string | null
            allowedPages: PageKey[] | null
          }>
        }
      }>('/members/invitations')
      return res.data.data
    },
  })

  const invitationRows = invitationsQuery.data?.invitations ?? []

  const updateInvitationMutation = useMutation({
    mutationFn: async ({
      invitationId,
      allowedPages,
    }: {
      invitationId: string
      allowedPages: PageKey[]
    }) => {
      await api.put(`/invitations/${invitationId}`, { allowedPages })
    },
    onSuccess: () => {
      setEditInvitation(null)
      toast.success('Invitation updated')
      queryClient.invalidateQueries({ queryKey: ['dashboard-invitations'] })
    },
    onError: (err: ServerErrorResponse) => {
      toast.error(serverErrorResponder(err) || 'Failed to update invitation')
    },
  })

  const openEditInvitation = (inv: InvitationRow) => {
    setEditInvitation(inv)
    setEditInvitationPages(
      inv.allowedPages?.length ? [...inv.allowedPages] : PAGE_OPTIONS.map((o) => o.key),
    )
  }

  return (
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
          if (!editInvitation) return
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
                        setEditInvitationPages((prev) =>
                          togglePageInSet(prev, opt.key, v === true),
                        )
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
    </>
  )
}
