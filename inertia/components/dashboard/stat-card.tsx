import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HStack } from '@/components/ui/hstack'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  description: string
  value: ReactNode
  icon?: LucideIcon
  iconClassName?: string
}

export function StatCard({ title, description, value, icon: Icon, iconClassName }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <HStack spacing={2} align='center'>
          {Icon && <Icon className={cn('h-4 w-4', iconClassName)} />}
          <CardTitle className='text-md font-medium'>{title}</CardTitle>
        </HStack>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-semibold'>{value}</div>
      </CardContent>
    </Card>
  )
}
