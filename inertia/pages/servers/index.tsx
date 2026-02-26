import type { SharedProps } from '@adonisjs/inertia/types'
import { Deferred, Head, Link, router } from '@inertiajs/react'
import { IconCalendar, IconChevronRight, IconServer } from '@tabler/icons-react'
import pluralize from 'pluralize'

import { timeAgo } from '#utils/date'
import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { EmptyState, LoadingSkeleton } from '@/components/ui'
import { AppCard } from '@/components/ui/app-card'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { startCase } from '#utils/functions'

interface RailwayProject {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

interface SortOption {
  value: string
  label: string
}

interface ServersIndexProps extends SharedProps {
  projects: RailwayProject[]
  sort: string
  sortOptions: SortOption[]
}

export default function ServersIndex({
  projects = [],
  sort,
  sortOptions = [],
}: ServersIndexProps) {
  const handleSortChange = (value: string) => {
    router.get('/servers', { sort: value })
  }

  return (
    <DashboardLayout>
      <Head title='Servers' />

      <div className='space-y-6'>
        <PageHeader
          title='Servers'
          description='Railway projects. Open a project to view its services, deployments, and logs.'
        />
        {sortOptions.length > 0 && (
          <div className='flex flex-wrap items-center justify-end gap-2 mb-4'>
            <span className='text-sm text-muted-foreground'>Sort:</span>
            <Select value={sort} onValueChange={handleSortChange} itemToStringValue={(v) => startCase(v) ?? ''}>
              <SelectTrigger className='w-[200px]' size='sm'>
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Deferred data='projects' fallback={<LoadingSkeleton type='list' />}>
          <AppCard
            title='Projects'
            description={`${pluralize('project', projects.length)} on Railway`}
            className='space-y-6'>

            <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/servers/${project.id}?name=${encodeURIComponent(project.name)}`}>
                  <Card className='group relative overflow-hidden border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-md'>
                    <div className='flex w-full flex-col items-stretch gap-4 p-5 text-left'>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/20'>
                          <IconServer className='h-6 w-6' />
                        </div>
                        <IconChevronRight className='h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5' />
                      </div>
                      <div className='min-w-0 flex-1 space-y-1'>
                        <h3 className='truncate text-base font-semibold tracking-tight text-foreground'>
                          {project.name}
                        </h3>
                      </div>
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <IconCalendar className='h-3.5 w-3.5 shrink-0' />
                        <span>Updated {timeAgo(project.updatedAt)}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            {projects.length === 0 && (
              <EmptyState
                icon={IconServer}
                title='No projects found'
                description='Add a project on Railway or check your API key.'
                className='rounded-lg border border-dashed border-border bg-muted/30'
              />
            )}
          </AppCard>
        </Deferred>
      </div>
    </DashboardLayout>
  )
}
