import type { SharedProps } from '@adonisjs/inertia/types'
import { Head, Link, router } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { IconCalendar, IconChevronRight, IconServer } from '@tabler/icons-react'
import { useMemo } from 'react'
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
import api from '@/lib/http'

interface RailwayProject {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

const SORT_VALUES = [
  'updatedAt:desc',
  'updatedAt:asc',
  'name:asc',
  'name:desc',
  'createdAt:desc',
  'createdAt:asc',
] as const

type SortValue = (typeof SORT_VALUES)[number]

const SORT_LABELS: Record<SortValue, string> = {
  'updatedAt:desc': 'Updated (newest first)',
  'updatedAt:asc': 'Updated (oldest first)',
  'name:asc': 'Name A–Z',
  'name:desc': 'Name Z–A',
  'createdAt:desc': 'Created (newest first)',
  'createdAt:asc': 'Created (oldest first)',
}

const SORT_OPTIONS = SORT_VALUES.map((value) => ({
  value,
  label: SORT_LABELS[value],
}))

function sortProjects(projects: RailwayProject[], sort: SortValue): RailwayProject[] {
  const [field, order] = sort.split(':') as [keyof RailwayProject, 'asc' | 'desc']
  return [...projects].sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return order === 'asc' ? -1 : 1
    if (bVal == null) return order === 'asc' ? 1 : -1
    const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
    return order === 'asc' ? cmp : -cmp
  })
}

interface ServersIndexProps extends SharedProps {
  sort: string
}

export default function ServersIndex({ sort }: ServersIndexProps) {
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['railway', 'projects'],
    queryFn: async () => {
      const res = await api.get<RailwayProject[]>(
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
