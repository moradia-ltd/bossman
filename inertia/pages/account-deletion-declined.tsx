import { Head, Link } from '@inertiajs/react'
import { ShieldCheck } from 'lucide-react'
import { PublicLayout } from '@/components/layouts/public'
import { Button } from '@/components/ui/button'
import { useInertiaParams } from '@/hooks/use-inertia-params'

const errorMessages: Record<string, string> = {
  missing_token: 'No confirmation token was provided.',
  invalid_action: 'Invalid action. Please use the links from the email.',
  invalid_or_expired: 'This link is invalid or has expired.',
  expired: 'This link has expired.',
}



export default function AccountDeletionDeclined() {
  const { query } = useInertiaParams()
  const { error, declined } = query as { error: string | null, declined: boolean | null }

  const message = declined
    ? "You've declined the account deletion request. Your account remains active."
    : error
      ? (errorMessages[error] ?? 'Something went wrong. Please request a new link if needed.')
      : 'Your account deletion request could not be completed.'

  return (
    <PublicLayout showFooter={false}>
      <Head title='Account deletion' />
      <div className='mx-auto flex max-w-md flex-col items-center justify-center px-6 py-16 text-center'>
        <ShieldCheck className='text-muted-foreground mb-4 h-16 w-16 text-blue-600' />
        <h1 className='text-2xl font-semibold'>
          {declined ? 'Deletion declined' : error ? 'Link invalid or expired' : 'Account deletion'}
        </h1>
        <p className='text-muted-foreground mt-2'>{message}</p>
        <Button asChild className='mt-8'>
          <Link href='/'>Return to home</Link>
        </Button>
      </div>
    </PublicLayout>
  )
}
