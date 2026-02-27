import type { SharedProps } from '@adonisjs/inertia/types'
import { Head, router } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { IconServer } from '@tabler/icons-react'
import { useMemo } from 'react'
import pluralize from 'pluralize'

import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { EmptyState, LoadingSkeleton } from '@/components/ui'
import { AppCard } from '@/components/ui/app-card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProjectCard } from '@/components/servers/project-card'
import { SORT_OPTIONS, sortProjects, type SortValue, type SortableProject } from '@/components/servers/sort-utils'
import { startCase } from '#utils/functions'
import api from '@/lib/http'

interface ServersIndexProps extends SharedProps {
  sort: string
}

export default function ServersIndex({ sort }: ServersIndexProps) {
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['railway', 'projects'],
    queryFn: async () => {
      const res = await api.get<SortableProject[]>(
        '/railway/projects' as Parameters<typeof api.get>[0],
      )
      return res.data ?? []
    },
  })

  const sortedProjects = useMemo(
    () => sortProjects(projects, sort as SortValue),
    [projects, sort],
  )

  const handleSortChange = (value: string | null) => {
    if (value) router.get('/servers', { sort: value })
  }

  return (
    <DashboardLayout>
      <Head title='Servers' />

      <div className='space-y-6'>
        <PageHeader
          title='Servers'
          description='Railway projects. Open a project to view its services, deployments, and logs.'
        />
        <div className='flex flex-wrap items-center justify-end gap-2 mb-4'>
          <span className='text-sm text-muted-foreground'>Sort:</span>
          <Select value={sort} onValueChange={handleSortChange} itemToStringValue={(v) => startCase(v) ?? ''}>
            <SelectTrigger className='w-[200px]' size='sm'>
              <SelectValue placeholder='Sort by' />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <LoadingSkeleton type='list' />
        ) : error ? (
          <AppCard title='Projects' className='space-y-6'>
            <EmptyState
              icon={IconServer}
              title='Failed to load projects'
              description={error instanceof Error ? error.message : 'Something went wrong.'}
              className='rounded-lg border border-dashed border-border bg-muted/30'
            />
          </AppCard>
        ) : (
          <AppCard
            title='Projects'
            description={`${pluralize('project', sortedProjects.length)} on Railway`}
            className='space-y-6'>
            <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
              {sortedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            {sortedProjects.length === 0 && (
              <EmptyState
                icon={IconServer}
                title='No projects found'
                description='Add a project on Railway or check your API key.'
                className='rounded-lg border border-dashed border-border bg-muted/30'
              />
            )}
          </AppCard>
        )}
      </div>
    </DashboardLayout>
  )
}
