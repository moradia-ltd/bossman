import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { IconCopy, IconPencil, IconPlus } from '@tabler/icons-react'
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
import { Switch } from '@/components/ui/switch'
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
  | 'analytics'
  | 'dashboard'
  | 'teams'
  | 'blog'
  | 'orgs'
  | 'leases'
  | 'properties'
  | 'pushNotifications'
  | 'dbBackups'
  | 'logs'
  | 'emails'
  | 'servers'
  | 'addons'

export const PAGE_OPTIONS: Array<{
  key: PageKey
  label: string
  description: string
  required?: boolean
}> = [
  { key: 'dashboard', label: 'Dashboard', description: 'Overview and activity', required: true },
  { key: 'analytics', label: 'Analytics', description: 'Analytics and reporting' },
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
  { key: 'logs', label: 'Logs', description: 'View audit events across the app' },
  { key: 'emails', label: 'Emails', description: 'View sent emails (Resend)' },
  { key: 'servers', label: 'Servers', description: 'Railway projects and deployments' },
  { key: 'addons', label: 'Addons', description: 'Manage addons' },
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
  invitedBy?: { fullName?: string | null; email?: string | null } | null
  allowedPages: PageKey[] | null
  enableProdAccess: boolean
}

export function TeamInvitationsInviteButton() {
  const queryClient = useQueryClient()
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitePages, setInvitePages] = useState<PageKey[]>(PAGE_OPTIONS.map((o) => o.key))
  const [enableProdAccess, setEnableProdAccess] = useState(true)

  const inviteMutation = useMutation({
    mutationFn: (payload: { email: string; allowedPages: PageKey[]; enableProdAccess: boolean }) =>
      api.post('/invitations', {
        email: payload.email,
        allowedPages: payload.allowedPages,
        enableProdAccess: payload.enableProdAccess,
      }),
    onSuccess: async () => {
      setInviteEmail('')
      setInvitePages(PAGE_OPTIONS.map((o) => o.key))
      setEnableProdAccess(true)
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
          leftIcon={<IconPlus className='h-4 w-4' />}
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
          enableProdAccess,
        })
      }}
      onSecondaryAction={() => {
        setInviteEmail('')
        setInvitePages(PAGE_OPTIONS.map((o) => o.key))
        setEnableProdAccess(true)
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

        <div className='flex items-center justify-between rounded-lg border border-border p-3'>
          <div>
            <Label htmlFor='inviteProdAccess'>Enabled Prod access</Label>
            <p className='text-xs text-muted-foreground'>
              If off, the invited member will only be able to access the dev database, not
              production.
            </p>
          </div>
          <Switch
            id='inviteProdAccess'
            checked={enableProdAccess}
            onCheckedChange={setEnableProdAccess}
          />
        </div>

        <div className='space-y-2'>
          <Label>Page access</Label>
          <div className='max-h-[280px] overflow-y-auto rounded-lg border border-border p-3'>
            <div className='grid gap-2'>
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
  const [editEnableProdAccess, setEditEnableProdAccess] = useState(true)

  const invitationsQuery = useQuery({
    queryKey: ['dashboard-invitations'],
    queryFn: async () => {
      const res = await api.get<{ data: { invitations: InvitationRow[] } }>('/members/invitations')
      return res.data.data
    },
  })

  const invitationRows = invitationsQuery.data?.invitations ?? []

  const updateInvitationMutation = useMutation({
    mutationFn: async ({
      invitationId,
      allowedPages,
      enableProdAccess,
    }: {
      invitationId: string
      allowedPages: PageKey[]
      enableProdAccess: boolean
    }) => {
      await api.put(`/invitations/${invitationId}`, {
        allowedPages,
        enableProdAccess,
      })
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
    setEditEnableProdAccess(inv.enableProdAccess ?? true)
  }

  const copyInviteLinkMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const res = await api.post<{ inviteLink: string }>(
        `/invitations/${invitationId}/invite-link` as Parameters<typeof api.post>[0],
      )
      return res.data
    },
    onSuccess: async (data) => {
      if (data?.inviteLink) {
        await navigator.clipboard.writeText(data.inviteLink)
        toast.success('Invite link copied to clipboard')
      }
    },
    onError: (err: ServerErrorResponse) => {
      toast.error(serverErrorResponder(err) || 'Failed to get invite link')
    },
  })

  return (
    <>
      {invitationRows.length > 0 && (
        <AppCard title='Pending invitations' description='Invitations waiting for acceptance.'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Page access</TableHead>
                  <TableHead>Prod access</TableHead>
                  <TableHead>Invited by</TableHead>
                  <TableHead>Invited</TableHead>
                  <TableHead className='w-[100px]'>Actions</TableHead>
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
                      {inv.enableProdAccess ? 'Yes' : 'Dev only'}
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {inv.invitedBy?.fullName ?? inv.invitedBy?.email ?? '—'}
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <HStack spacing={1}>
                        <Button
                          variant='ghost'
                          size='icon'
                          aria-label='Copy invite link'
                          onClick={() => copyInviteLinkMutation.mutate(inv.id)}
                          disabled={copyInviteLinkMutation.isPending}>
                          <IconCopy className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          aria-label='Edit page access'
                          onClick={() => openEditInvitation(inv)}>
                          <IconPencil className='h-4 w-4' />
                        </Button>
                      </HStack>
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
            enableProdAccess: editEnableProdAccess,
          })
        }}
        className='max-w-2xl'>
        <Stack spacing={4}>
          <div className='flex items-center justify-between rounded-lg border border-border p-3'>
            <div>
              <Label htmlFor='editProdAccess'>Enabled Prod access</Label>
              <p className='text-xs text-muted-foreground'>
                If off, this member will only access the dev database, not production.
              </p>
            </div>
            <Switch
              id='editProdAccess'
              checked={editEnableProdAccess}
              onCheckedChange={setEditEnableProdAccess}
            />
          </div>
          <div className='space-y-2'>
            <Label>Page access</Label>
            <div className='max-h-[280px] overflow-y-auto rounded-lg border border-border p-3'>
              <div className='grid gap-2'>
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
            </div>
            <p className='text-xs text-muted-foreground'>Dashboard is always included.</p>
          </div>
        </Stack>
      </BaseModal>
    </>
  )
}
