import type { SharedProps } from '@adonisjs/inertia/types'
import { Link, router, usePage } from '@inertiajs/react'
import { IconArrowRight, IconMenu2 } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'

interface PublicLayoutProps {
  children: React.ReactNode
  showHeader?: boolean
  actions?: React.ReactNode
  headerSticky?: boolean
  headerBorder?: boolean
  showFooter?: boolean
  footer?: React.ReactNode
}

function PublicNavbarActions({ extraActions }: { extraActions?: React.ReactNode }) {
  const page = usePage<SharedProps>()
  const isLoggedIn = Boolean(page.props.isLoggedIn)

  return (
    <div className='flex items-center gap-2'>
      {/* Desktop links */}
      <div className='hidden md:flex items-center gap-2'>
        <Button variant='ghost' asChild>
          <Link href='/'>Home</Link>
        </Button>
        <Button variant='ghost' asChild>
          <Link href='/blog'>Blog</Link>
        </Button>
      </div>

      {/* Desktop auth CTAs + optional extra actions */}
      <div className='hidden md:flex items-center gap-2'>
        {isLoggedIn ? (
          <Button asChild rightIcon={<IconArrowRight className='h-4 w-4' />}>
            <Link href='/dashboard'>Dashboard</Link>
          </Button>
        ) : (
          <Button asChild rightIcon={<IconArrowRight className='h-4 w-4' />}>
            <Link href='/login'>Sign In</Link>
          </Button>
        )}
        {extraActions}
      </div>

      <ThemeToggle />

      {/* Mobile menu (prevents header overflow) */}
      <div className='md:hidden'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' aria-label='Open menu'>
              <IconMenu2 className='h-5 w-5' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => router.visit('/')}>Home</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.visit('/blog')}>Blog</DropdownMenuItem>
            <DropdownMenuSeparator />
            {isLoggedIn ? (
              <DropdownMenuItem onClick={() => router.visit('/dashboard')}>Dashboard</DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => router.visit('/login')}>Sign In</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function PublicLayout({
  children,
  showHeader = true,
  actions,
  headerSticky = true,
  showFooter = true,
  footer,
}: PublicLayoutProps) {
  return (
    <div className='min-h-screen  dark:bg-background flex flex-col'>
      {showHeader && (
        <header
          className={cn(
            'z-50 transition-shadow duration-300',
            headerSticky &&
              'sticky top-0 bg-background/80 supports-[backdrop-filter]:bg-background/60 supports-[backdrop-filter]:backdrop-blur-md border-b border-border/50',
          )}>
          <div className='max-w-screen-xl mx-auto px-6 py-5 flex items-center justify-between'>
            <Link href='/' className='flex items-center gap-2 w-fit' aria-label={import.meta.env.VITE_APP_NAME}>
              <img src='/logo-full.svg' alt={import.meta.env.VITE_APP_NAME} className='h-8' />
            </Link>
            <PublicNavbarActions extraActions={actions} />
          </div>
        </header>
      )}
      <main className='flex-1'>{children}</main>

      {showFooter && (
        <>
          {footer ?? (
            <footer className='border-t border-border py-8 px-6'>
              <div className='max-w-screen-xl mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-center gap-3'>
                  <img src='/logo-full.svg' alt='' className='h-7' aria-hidden />
                  <div className='leading-tight'>
                    <div className='font-semibold text-foreground'>
                      {import.meta.env.VITE_APP_NAME}
                    </div>
                    <div className='text-sm text-muted-foreground mt-0.5'>
                      {import.meta.env.VITE_APP_DESCRIPTION}
                    </div>
                  </div>
                </div>
                <div className='text-sm text-muted-foreground flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3'>
                  <a href='mailto:support@ekoatlantic.com' className='hover:text-foreground'>
                    {import.meta.env.VITE_SUPPORT_EMAIL}
                  </a>
                  <span className='hidden sm:inline'>•</span>
                  <span>© {new Date().getFullYear()} {import.meta.env.VITE_APP_NAME}</span>
                </div>
              </div>
            </footer>
          )}
        </>
      )}
    </div>
  )
}
