import type { SharedProps } from '@adonisjs/inertia/types'
import { Deferred, Head, Link } from '@inertiajs/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  IconChevronDown,
  IconChevronRight,
  IconLoader2,
  IconRefresh,
  IconRocket,
  IconRotate2,
  IconServer,
  IconTerminal2,
} from '@tabler/icons-react'

import { RuntimeLogsSheet } from './components/runtime-logs-sheet'
import { useState } from 'react'
import { toast } from 'sonner'
import { timeAgo } from '#utils/date'
import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { EmptyState, LoadingSkeleton } from '@/components/ui'
import { AppCard } from '@/components/ui/app-card'
import { Badge } from '@/components/ui/badge'
import { BaseSheet } from '@/components/ui/base-sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { type ServerErrorResponse, serverErrorResponder } from '@/lib/error'
import api from '@/lib/http'

interface RailwayService {
  id: string
  name: string
  icon: string | null
}

interface RailwayEnvironment {
  id: string
  name: string
}

interface RailwayProjectDetail {
  id: string
  name: string
  description: string | null
  services: RailwayService[]
  environments: RailwayEnvironment[]
}

interface RailwayDeploymentMeta {
  commitMessage?: string
  [key: string]: unknown
}

interface RailwayDeployment {
  id: string
  status: string
  createdAt: string
  meta: string | RailwayDeploymentMeta | null
  canRedeploy: boolean
  canRollback: boolean
}

function deploymentTitle(d: RailwayDeployment): string {
  const m = d.meta
  if (typeof m === 'string' && m) return m
  if (m && typeof m === 'object' && typeof m.commitMessage === 'string') return m.commitMessage
  return `Deployment ${timeAgo(d.createdAt)}`
}

interface ProjectShowProps extends SharedProps {
  projectName?: string | null
  project?: RailwayProjectDetail | null
}

export default function ServersProjectShow({ projectName, project }: ProjectShowProps) {
  const safeProject = project ?? null
  const displayName = safeProject?.name ?? projectName ?? 'Project'
  const queryClient = useQueryClient()
  const [deploymentsSheetOpen, setDeploymentsSheetOpen] = useState(false)
  const [logsSheetOpen, setLogsSheetOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<{
    id: string
    name: string
    projectId: string
    environmentId: string
  } | null>(null)
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<string | null>(null)

  const { data: deployments = [], isLoading: deploymentsLoading } = useQuery({
    queryKey: ['railway', 'deployments', selectedService?.id, selectedService?.environmentId],
    queryFn: async () => {
      if (!selectedService) return []
      const res = await api.get<RailwayDeployment[]>(
        `/railway/services/${selectedService.id}/deployments?environmentId=${selectedService.environmentId}&projectId=${selectedService.projectId}` as Parameters<
          typeof api.get
        >[0],
      )
      return res.data ?? []
    },
    enabled: !!selectedService && deploymentsSheetOpen,
  })

  const restartMutation = useMutation({
    mutationFn: (deploymentId: string) => api.post(`/railway/deployments/${deploymentId}/restart`),
    onSuccess: () => {
      toast.success('Restart triggered.')
      if (selectedService) {
        queryClient.invalidateQueries({
          queryKey: ['railway', 'deployments', selectedService.id, selectedService.environmentId],
        })
      }
    },
    onError: (err: ServerErrorResponse) => {
      toast.error(serverErrorResponder(err) || 'Failed to restart.')
    },
  })

  const redeployMutation = useMutation({
    mutationFn: (deploymentId: string) => api.post(`/railway/deployments/${deploymentId}/redeploy`),
    onSuccess: () => {
      toast.success('Redeploy triggered.')
      if (selectedService) {
        queryClient.invalidateQueries({
          queryKey: ['railway', 'deployments', selectedService.id, selectedService.environmentId],
        })
      }
    },
    onError: (err: ServerErrorResponse) => {
      toast.error(serverErrorResponder(err) || 'Failed to redeploy.')
    },
  })

  const deployMutation = useMutation({
    mutationFn: (deploymentId: string) => api.post(`/railway/deployments/${deploymentId}/redeploy`),
    onSuccess: () => {
      toast.success('Deploy triggered.')
      if (selectedService) {
        queryClient.invalidateQueries({
          queryKey: ['railway', 'deployments', selectedService.id, selectedService.environmentId],
        })
      }
    },
    onError: (err: ServerErrorResponse) => {
      toast.error(serverErrorResponder(err) || 'Failed to deploy.')
    },
  })

  const openServiceDeployments = (service: RailwayService) => {
    if (!safeProject?.environments?.length) return
    const envId = safeProject.environments[0].id
    setSelectedService({
      id: service.id,
      name: service.name,
      projectId: safeProject.id,
      environmentId: envId,
    })
    setDeploymentsSheetOpen(true)
    setSelectedDeploymentId(null)
  }

  const openDeploymentLogs = (deploymentId: string) => {
    setSelectedDeploymentId(deploymentId)
    setLogsSheetOpen(true)
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'default'
      case 'BUILDING':
      case 'DEPLOYING':
      case 'PENDING':
        return 'secondary'
      case 'FAILED':
      case 'CRASHED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <DashboardLayout>
      <Head title={`Project: ${displayName}`} />

      <div className='space-y-6'>
        <PageHeader title={displayName} backHref='/servers' />

        <Deferred data='project' fallback={<LoadingSkeleton type='list' />}>
          {safeProject === null ? (
            <EmptyState
              icon={IconServer}
              title={projectName ? `${projectName} not found` : 'Project not found'}
              description='This Railway project may not exist or you may not have access.'
              action={
                <Link href='/servers' className='text-primary hover:underline'>
                  Back to Servers
                </Link>
              }
              className='rounded-lg border border-dashed border-border bg-muted/30'
            />
          ) : safeProject ? (
            <AppCard
              title='Services'
              description={`${safeProject.services.length} service${safeProject.services.length === 1 ? '' : 's'} in this project. Click a service to view deployments and logs.`}
              className='space-y-6'>
              {safeProject.services.length > 0 ? (
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  {safeProject.services.map((service) => (
                    <Card
                      key={service.id}
                      className='group overflow-hidden border-border bg-card transition-colors hover:border-primary/25 hover:bg-muted/40'>
                      <button
                        type='button'
                        onClick={() => openServiceDeployments(service)}
                        className='flex w-full items-center gap-4 p-4 text-left'>
                        <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
                          <IconServer className='h-5 w-5' />
                        </div>
                        <div className='min-w-0 flex-1'>
                          <p className='font-semibold text-foreground'>{service.name}</p>
                          <p className='mt-0.5 text-xs text-muted-foreground'>
                            View deployments & logs
                          </p>
                        </div>
                        <IconChevronRight className='h-5 w-5 shrink-0 text-muted-foreground' />
                      </button>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={IconServer}
                  title='No services'
                  description='This project has no services yet.'
                  className='rounded-lg border border-dashed border-border bg-muted/30'
                />
              )}
            </AppCard>
          ) : null}
        </Deferred>
      </div>

      {/* Deployments sheet */}
      <BaseSheet
        open={deploymentsSheetOpen}
        onOpenChange={setDeploymentsSheetOpen}
        title={`${selectedService?.name ?? 'Service'} — Deployments`}
        description='Last 5 deployments. Open logs or use Restart / Redeploy.'
        side='right'
        className='w-full sm:max-w-xl'>
        {deploymentsLoading ? (
          <div className='flex min-h-[200px] items-center justify-center py-12'>
            <IconLoader2 className='h-10 w-10 animate-spin text-primary' />
          </div>
        ) : deployments.length > 0 ? (
          <div className='min-h-0 overflow-hidden'>

            <div className='space-y-3 pr-2'>
              {deployments.map((d, index) => (
                <Card
                  key={d.id}
                  className='overflow-hidden border-border bg-card transition-colors hover:border-primary/25'>
                  <div
                    className={`border-l-4 ${d.status === 'SUCCESS'
                      ? 'border-l-green-500'
                      : d.status === 'FAILED' || d.status === 'CRASHED'
                        ? 'border-l-destructive'
                        : 'border-l-amber-500'
                      }`}>
                    <div className='flex flex-col gap-3 p-4'>
                      <p className='text-sm font-medium text-foreground truncate' title={deploymentTitle(d)}>
                        {deploymentTitle(d)}
                      </p>
                      <div className='flex flex-wrap items-center justify-between gap-2'>
                        <div className='flex min-w-0 flex-wrap items-center gap-2'>
                          <Badge variant={statusColor(d.status)} className='shrink-0 capitalize'>
                            {d.status.toLowerCase()}
                          </Badge>
                          {index === 0 && (
                            <Badge variant='secondary' className='shrink-0'>
                              Latest
                            </Badge>
                          )}
                          <span className='text-xs text-muted-foreground'>
                            {timeAgo(d.createdAt)}
                          </span>
                        </div>
                        {index === 0 && (
                          <div className='flex shrink-0 items-center gap-2'>
                            {d.status === 'PENDING' && (
                              <Button
                                variant='default'
                                size='xs'
                                leftIcon={<IconRocket className='h-3.5 w-3.5' />}
                                onClick={() => deployMutation.mutate(d.id)}
                                disabled={deployMutation.isPending}
                                isLoading={deployMutation.isPending}
                                loadingText='Deploying…'>
                                Deploy service
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='outline' size='xs'>
                                  Actions
                                  <IconChevronDown className='h-3.5 w-3.5' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem
                                  onClick={() => restartMutation.mutate(d.id)}
                                  disabled={restartMutation.isPending}>
                                  <IconRotate2 className='mr-2 h-4 w-4' />
                                  Restart
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => redeployMutation.mutate(d.id)}
                                  disabled={redeployMutation.isPending || !d.canRedeploy}>
                                  <IconRefresh className='mr-2 h-4 w-4' />
                                  Redeploy
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </div>
                      <Button
                        variant='secondary'
                        size='sm'
                        className='w-full justify-start gap-2 bg-muted/60'
                        onClick={() => openDeploymentLogs(d.id)}>
                        <IconTerminal2 className='h-4 w-4 shrink-0' />
                        View runtime logs
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

          </div>
        ) : (
          <EmptyState
            icon={IconRefresh}
            title='No deployments'
            description='No deployments for this service yet.'
            className='min-h-[200px] py-12'
          />
        )}
      </BaseSheet>

      <RuntimeLogsSheet
        open={logsSheetOpen}
        onOpenChange={setLogsSheetOpen}
        deploymentId={selectedDeploymentId}
      />
    </DashboardLayout>
  )
}
