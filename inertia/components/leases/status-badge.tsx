import { IconAlertCircle, IconCircleCheck, IconCircleX } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'

export interface LeaseStatusBadgeProps {
  status: string
}

/** Renders a lease status badge (active, pending, terminated, inactive). */
export function LeaseStatusBadge({ status }: LeaseStatusBadgeProps) {
  switch (status) {
    case 'active':
      return (
        <Badge variant='success' className='gap-1'>
          <IconCircleCheck className='h-3 w-3' />
          Active
        </Badge>
      )
    case 'pending':
      return (
        <Badge variant='warning' className='gap-1'>
          <IconAlertCircle className='h-3 w-3' />
          Pending
        </Badge>
      )
    case 'terminated':
      return (
        <Badge variant='destructive' className='gap-1'>
          <IconCircleX className='h-3 w-3' />
          Terminated
        </Badge>
      )
    case 'inactive':
      return (
        <Badge variant='outline' className='gap-1'>
          <IconCircleX className='h-3 w-3' />
          Inactive
        </Badge>
      )
    default:
      return <Badge variant='outline'>{status}</Badge>
  }
}
