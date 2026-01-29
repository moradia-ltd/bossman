import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'active':
      return (
        <Badge variant='default' className='gap-1'>
          <CheckCircle className='h-3 w-3' />
          Active
        </Badge>
      )
    case 'pending':
      return (
        <Badge variant='secondary' className='gap-1'>
          <AlertCircle className='h-3 w-3' />
          Pending
        </Badge>
      )
    case 'terminated':
      return (
        <Badge variant='destructive' className='gap-1'>
          <XCircle className='h-3 w-3' />
          Terminated
        </Badge>
      )
    case 'inactive':
      return (
        <Badge variant='outline' className='gap-1'>
          <XCircle className='h-3 w-3' />
          Inactive
        </Badge>
      )
    default:
      return <Badge variant='outline'>{status}</Badge>
  }
}

export { StatusBadge }
