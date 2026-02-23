import { Head, Link } from '@inertiajs/react'
import { IconCircleCheck, IconShieldCheck } from '@tabler/icons-react'
import { PublicLayout } from '@/components/layouts/public'
import { Button } from '@/components/ui/button'
import { useInertiaParams } from '@/hooks/use-inertia-params'

const errorMessages: Record<string, string> = {
  missing_token: 'No confirmation token was provided.',
  invalid_action: 'Invalid action. Please use the links from the email.',
  invalid_or_expired: 'This link is invalid or has expired.',
  expired: 'This link has expired.',
}

type Result = 'deleted' | 'declined'

export default function AccountDeletionResult() {
  const { query } = useInertiaParams()
  const result = (query?.result as Result | undefined) ?? 'declined'
  const error = query?.error as string | undefined
  const isDeleted = result === 'deleted'

  const message = isDeleted
    ? "Your account and associated data have been permanently removed. We're sorry to see you go."
    : error
      ? (errorMessages[error] ?? 'Something went wrong. Please request a new link if needed.')
      : "You've declined the account deletion request. Your account remains active."

  const title = isDeleted
    ? 'Your account has been deleted'
    : error
      ? 'Link invalid or expired'
      : 'Deletion declined'

  return (
    <PublicLayout showFooter={false}>
      <Head title={isDeleted ? 'Account deleted' : 'Account deletion'} />
      <div className='mx-auto flex max-w-md flex-col items-center justify-center px-6 py-16 text-center'>
        {isDeleted ? (
          <IconCircleCheck className='text-muted-foreground mb-4 h-16 w-16 text-green-600' />
        ) : (
          <IconShieldCheck className='text-muted-foreground mb-4 h-16 w-16 text-blue-600' />
        )}
        <h1 className='text-2xl font-semibold'>{title}</h1>
        <p className='text-muted-foreground mt-2'>{message}</p>
        <Button asChild className='mt-8'>
          <Link href='/'>Return to home</Link>
        </Button>
      </div>
    </PublicLayout>
  )
}
