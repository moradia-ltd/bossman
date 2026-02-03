import type { SharedProps } from '@adonisjs/inertia/types'
import { Head, Link, router } from '@inertiajs/react'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { RawTeamMember } from '#types/model-types'
import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { AppCard } from '@/components/ui/app-card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, type RadioGroupOption } from '@/components/ui/radio-group'
import { Stack } from '@/components/ui/stack'
import { type ServerErrorResponse, serverErrorResponder } from '@/lib/error'
import api from '@/lib/http'

interface MemberShowProps extends SharedProps {
  member: RawTeamMember
  dataAccessOptions: {
    leaseableEntities: Array<{ id: string; address: string }>
    leases: Array<{ id: string; name: string }>
  }
}

const dataAccessModeOptions: RadioGroupOption[] = [
  {
    value: 'all',
    label: 'All',
    description: 'Member can see all properties and leases',
  },
  {
    value: 'selected',
    label: 'Selected',
    description: 'Member can only see the properties and leases you choose below',
  },
]

export default function MemberShow({ member, dataAccessOptions }: MemberShowProps) {
  const [dataAccessMode, setDataAccessMode] = useState<'all' | 'selected'>(
    member.dataAccessMode ?? 'all',
  )
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<Set<string>>(
    new Set(member.allowedLeaseableEntityIds ?? []),
  )
  const [selectedLeaseIds, setSelectedLeaseIds] = useState<Set<string>>(
    new Set(member.allowedLeaseIds ?? []),
  )

  const updateMutation = useMutation({
    mutationFn: (payload: {
      dataAccessMode: 'all' | 'selected'
      allowedLeaseableEntityIds: string[]
      allowedLeaseIds: string[]
    }) =>
      api.put(`/members/${member.id}`, {
        dataAccessMode: payload.dataAccessMode,
        allowedLeaseableEntityIds:
          payload.dataAccessMode === 'selected' ? payload.allowedLeaseableEntityIds : [],
        allowedLeaseIds: payload.dataAccessMode === 'selected' ? payload.allowedLeaseIds : [],
      }),
    onSuccess: () => {
      toast.success('Data access updated')
      router.reload()
    },
    onError: (err: ServerErrorResponse) => {
      toast.error(serverErrorResponder(err) || 'Failed to update data access')
    },
  })

  const toggleProperty = (id: string, checked: boolean) => {
    setSelectedPropertyIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const toggleLease = (id: string, checked: boolean) => {
    setSelectedLeaseIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleSave = () => {
    updateMutation.mutate({
      dataAccessMode,
      allowedLeaseableEntityIds: Array.from(selectedPropertyIds),
      allowedLeaseIds: Array.from(selectedLeaseIds),
    })
  }

  const displayName = member.user?.fullName || member.user?.email || 'Member'
  const isSelected = dataAccessMode === 'selected'

  return (
    <DashboardLayout>
      <Head title={`${displayName} – Team member`} />
      <div className='space-y-6'>
        <PageHeader
          title={displayName}
          description='Manage this team member’s data access to properties and leases.'
          backHref='/teams'
        />



        <AppCard title='Member' description='Basic info'>
          <Stack spacing={3}>
            <div>
              <span className='text-sm text-muted-foreground'>Email</span>
              <p className='font-medium'>{member.user?.email ?? '—'}</p>
            </div>
            <div>
              <span className='text-sm text-muted-foreground'>Role</span>
              <p className='font-medium capitalize'>{member.role ?? '—'}</p>
            </div>
          </Stack>
        </AppCard>

        <AppCard
          title='Data access'
          description='Choose whether this member can see all customer data or only selected properties and leases.'>
          <Stack spacing={4}>
            <div className='space-y-3'>
              <Label>Access level</Label>
              <RadioGroup
                value={dataAccessMode}
                onChange={(v) => setDataAccessMode(v as 'all' | 'selected')}
                options={dataAccessModeOptions}
                cols={2}
              />
            </div>

            {isSelected && (
              <>
                <div className='space-y-2'>
                  <Label>Properties (leaseable entities)</Label>
                  <p className='text-xs text-muted-foreground'>
                    Select which properties this member can access.
                  </p>
                  <div className='max-h-48 overflow-y-auto rounded-lg border border-border p-3 space-y-2'>
                    {dataAccessOptions.leaseableEntities.length === 0 ? (
                      <p className='text-sm text-muted-foreground'>No properties found.</p>
                    ) : (
                      dataAccessOptions.leaseableEntities.map((e) => (
                        <div
                          key={e.id}
                          className='flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded p-1 -m-1'>
                          <Checkbox
                            id={`prop-${e.id}`}
                            checked={selectedPropertyIds.has(e.id)}
                            onCheckedChange={(v) => toggleProperty(e.id, v === true)}
                          />
                          <label
                            htmlFor={`prop-${e.id}`}
                            className='text-sm truncate cursor-pointer flex-1'>
                            {e.address || e.id}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label>Leases</Label>
                  <p className='text-xs text-muted-foreground'>
                    Select which leases this member can access.
                  </p>
                  <div className='max-h-48 overflow-y-auto rounded-lg border border-border p-3 space-y-2'>
                    {dataAccessOptions.leases.length === 0 ? (
                      <p className='text-sm text-muted-foreground'>No leases found.</p>
                    ) : (
                      dataAccessOptions.leases.map((l) => (
                        <div
                          key={l.id}
                          className='flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded p-1 -m-1'>
                          <Checkbox
                            id={`lease-${l.id}`}
                            checked={selectedLeaseIds.has(l.id)}
                            onCheckedChange={(v) => toggleLease(l.id, v === true)}
                          />
                          <label
                            htmlFor={`lease-${l.id}`}
                            className='text-sm truncate cursor-pointer flex-1'>
                            {l.name || l.id}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            <Button onClick={handleSave} isLoading={updateMutation.isPending} loadingText='Saving…'>
              Save data access
            </Button>
          </Stack>
        </AppCard>
      </div>
    </DashboardLayout>
  )
}
