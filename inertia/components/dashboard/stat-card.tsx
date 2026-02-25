import type { Icon } from '@tabler/icons-react'
import type { ReactNode } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HStack } from '@/components/ui/hstack'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  description: string
  value: ReactNode
  icon?: Icon
  iconClassName?: string
}

export function StatCard({ title, description, value, icon: Icon, iconClassName }: StatCardProps) {
  return (
    <Card className='group'>
      <CardHeader className='pb-2'>
        <HStack spacing={3} align='center'>
          {Icon && (
            <span
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary transition-colors group-hover:bg-primary/12',
                iconClassName,
              )}>
              <Icon className='h-5 w-5' />
            </span>
          )}
          <div className='min-w-0'>
            <CardTitle className='text-sm font-medium text-muted-foreground uppercase tracking-wider'>
              {title}
            </CardTitle>
            <CardDescription className='text-xs mt-0.5'>{description}</CardDescription>
          </div>
        </HStack>
      </CardHeader>
      <CardContent className='pt-0'>
        <div className='text-2xl font-semibold tabular-nums tracking-tight'>{value}</div>
      </CardContent>
    </Card>
  )
}
