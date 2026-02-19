import { Head, Link } from '@inertiajs/react'
import { CheckCircle } from 'lucide-react'
import { PublicLayout } from '@/components/layouts/public'
import { Button } from '@/components/ui/button'

export default function AccountDeleted() {
  return (
    <PublicLayout showFooter={false}>
      <Head title='Account deleted' />
      <div className='mx-auto flex max-w-md flex-col items-center justify-center px-6 py-16 text-center'>
        <CheckCircle className='text-muted-foreground mb-4 h-16 w-16 text-green-600' />
        <h1 className='text-2xl font-semibold'>Your account has been deleted</h1>
        <p className='text-muted-foreground mt-2'>
          Your account and associated data have been permanently removed. We're sorry to see you go.
        </p>
        <Button asChild className='mt-8'>
          <Link href='/'>Return to home</Link>
        </Button>
      </div>
    </PublicLayout>
  )
}
