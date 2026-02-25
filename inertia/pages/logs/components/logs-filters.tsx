import { startCase } from 'lodash'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const EVENT_OPTIONS = [
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
] as const

const MODEL_OPTIONS = [
  { value: 'TeamMember', label: 'Team member' },
  { value: 'TeamInvitation', label: 'Team invitation' },
  { value: 'Lease', label: 'Lease' },
  { value: 'PushNotification', label: 'Push notification' },
  { value: 'DbBackup', label: 'Db backup' },
  { value: 'Property', label: 'Property' },
  { value: 'FileUpload', label: 'File upload' },
  { value: 'TenancyProcess', label: 'Tenancy process' },
] as const

export interface LogsFiltersProps {
  event: string
  auditableType: string
  onEventChange: (value: string) => void
  onAuditableTypeChange: (value: string) => void
}

export function LogsFilters({
  event,
  auditableType,
  onEventChange,
  onAuditableTypeChange,
}: LogsFiltersProps) {
  return (
    <div className='flex flex-wrap items-end gap-4'>
      <div className='flex flex-col gap-2'>
        <Label className='text-sm font-medium text-muted-foreground'>Event</Label>
        <Select
          itemToStringLabel={(v) => startCase(v as string)}
          value={event === '' ? 'all' : event}
          onValueChange={(v) => onEventChange(v === 'all' ? '' : (v ?? ''))}>
          <SelectTrigger className='w-[140px]'>
            <SelectValue placeholder='Event' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All events</SelectItem>
            {EVENT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='flex flex-col gap-2'>
        <Label className='text-sm font-medium text-muted-foreground'>Model</Label>
        <Select
          itemToStringLabel={(v) => startCase(v as string)}
          value={auditableType === '' ? 'all' : auditableType}
          onValueChange={(v) => onAuditableTypeChange(v === 'all' ? '' : (v ?? ''))}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Model type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All models</SelectItem>
            {MODEL_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
