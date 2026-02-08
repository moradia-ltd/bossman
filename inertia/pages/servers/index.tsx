import type { SharedProps } from '@adonisjs/inertia/types'
import { Head } from '@inertiajs/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Calendar,
  ChevronRight,
  Layers,
  Loader2,
  RefreshCw,
  RotateCcw,
  Server,
  Terminal,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { timeAgo } from '#utils/date'
import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { AppCard } from '@/components/ui/app-card'
import { Badge } from '@/components/ui/badge'
import { BaseSheet } from '@/components/ui/base-sheet'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingOverlay } from '@/components/ui/loading'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type ServerErrorResponse, serverErrorResponder } from '@/lib/error'
import api from '@/lib/http'

interface RailwayProject {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

interface RailwayService {
  id: string
  name: string
  icon: string | null
}

interface RailwayEnvironment {
  id: string
  name: string
}

interface RailwayProjectDetail extends RailwayProject {
  services: RailwayService[]
  environments: RailwayEnvironment[]
}

interface RailwayDeployment {
  id: string
  status: string
  createdAt: string
  meta: string | null
  canRedeploy: boolean
  canRollback: boolean
}

interface RailwayLog {
  message: string
  timestamp: string
  level?: string
}

export default function ServersIndex(_props: SharedProps) {
  const queryClient = useQueryClient()
  const [servicesSheetOpen, setServicesSheetOpen] = useState(false)
  const [deploymentsSheetOpen, setDeploymentsSheetOpen] = useState(false)
  const [logsSheetOpen, setLogsSheetOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<{
    id: string
    name: string
    projectId: string
    environmentId: string
  } | null>(null)
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<string | null>(null)

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['railway', 'projects'],
    queryFn: async () => {
      const res = await api.get<RailwayProject[]>('/railway/projects')
      return res.data ?? []
    },
  })

  const { data: projectDetail, isLoading: projectDetailLoading } = useQuery({
    queryKey: ['railway', 'project', selectedProjectId],
    queryFn: async () => {
      const res = await api.get<RailwayProjectDetail>(`/railway/projects/${selectedProjectId}`)
      return res.data
    },
    enabled: !!selectedProjectId && servicesSheetOpen,
  })

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

  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['railway', 'deployment-logs', selectedDeploymentId],
    queryFn: async () => {
      if (!selectedDeploymentId) return []
      const res = await api.get<RailwayLog[]>(
        `/railway/deployments/${selectedDeploymentId}/logs/runtime`,
      )
      return res.data ?? []
    },
    enabled: !!selectedDeploymentId && logsSheetOpen,
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

  const openProjectServices = (projectId: string) => {
    setSelectedProjectId(projectId)
    setServicesSheetOpen(true)
    setDeploymentsSheetOpen(false)
    setLogsSheetOpen(false)
    setSelectedService(null)
    setSelectedDeploymentId(null)
  }

  const openServiceDeployments = (service: RailwayService) => {
    if (!projectDetail?.environments?.length) return
    const envId = projectDetail.environments[0].id
    setSelectedService({
      id: service.id,
      name: service.name,
      projectId: projectDetail.id,
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
      <Head title='Servers' />

      <div className='space-y-6'>
        <PageHeader
          title='Servers'
          description='Railway projects and services. Open a project to view its services, then a service to see recent deployments and logs.'
        />

        {projectsLoading ? (
          <LoadingOverlay />
        ) : (
          <AppCard
            title='Projects'
            description={`${projects.length} project${projects.length === 1 ? '' : 's'} on Railway`}
            className='space-y-6'>
            <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className='group relative overflow-hidden border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-md'>
                  <button
                    type='button'
                    onClick={() => openProjectServices(project.id)}
                    className='flex w-full flex-col items-stretch gap-4 p-5 text-left'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/20'>
                        <Server className='h-6 w-6' />
                      </div>
                      <ChevronRight className='h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5' />
                    </div>
                    <div className='min-w-0 flex-1 space-y-1'>
                      <h3 className='truncate text-base font-semibold tracking-tight text-foreground'>
                        {project.name}
                      </h3>
                      {project.description ? (
                        <p className='line-clamp-2 text-sm text-muted-foreground'>
                          {project.description}
                        </p>
                      ) : (
                        <p className='text-sm italic text-muted-foreground'>No description</p>
                      )}
                    </div>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <Calendar className='h-3.5 w-3.5 shrink-0' />
                      <span>Updated {timeAgo(project.updatedAt)}</span>
                    </div>
                  </button>
                </Card>
              ))}
            </div>
            {projects.length === 0 && (
              <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 py-16 text-center'>
                <Box className='mb-3 h-12 w-12 text-muted-foreground' />
                <p className='font-medium text-foreground'>No projects found</p>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Add a project on Railway or check your API key.
                </p>
              </div>
            )}
          </AppCard>
        )}
      </div>

      {/* Services sheet */}
      <BaseSheet
        open={servicesSheetOpen}
        onOpenChange={setServicesSheetOpen}
        title={projectDetail?.name ?? (projectDetailLoading ? 'Loading…' : 'Services')}
        description={
          selectedProjectId && !projectDetail?.name && !projectDetailLoading
            ? 'Project not found.'
            : 'Select a service to view deployments and logs.'
        }
        side='right'
        className='w-full sm:max-w-lg'>
        {projectDetailLoading ? (
          <div className='flex min-h-[200px] items-center justify-center py-12'>
            <Loader2 className='h-10 w-10 animate-spin text-primary' />
          </div>
        ) : projectDetail?.services?.length ? (
          <ScrollArea className='max-h-[60vh]'>
            <div className='space-y-2 pr-2'>
              {projectDetail.services.map((service) => (
                <Card
                  key={service.id}
                  className='overflow-hidden border-border bg-card transition-colors hover:border-primary/25 hover:bg-muted/40'>
                  <button
                    type='button'
                    onClick={() => openServiceDeployments(service)}
                    className='flex w-full items-center gap-4 p-4 text-left'>
                    <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
                      <Server className='h-5 w-5' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='font-semibold text-foreground'>{service.name}</p>
                      <p className='mt-0.5 text-xs text-muted-foreground'>
                        View deployments & logs
                      </p>
                    </div>
                    <ChevronRight className='h-5 w-5 shrink-0 text-muted-foreground' />
                  </button>
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className='flex min-h-[200px] flex-col items-center justify-center py-12 text-center'>
            <Layers className='mb-3 h-12 w-12 text-muted-foreground' />
            <p className='font-medium text-foreground'>No services</p>
            <p className='mt-1 text-sm text-muted-foreground'>
              This project has no services yet.
            </p>
          </div>
        )}
      </BaseSheet>

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
              <Loader2 className='h-10 w-10 animate-spin text-primary' />
            </div>
          ) : deployments.length > 0 ? (
            <ScrollArea className='max-h-[60vh]'>
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
                              {new Date(d.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className='flex shrink-0 gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              className='gap-1.5'

                              onClick={() => restartMutation.mutate(d.id)}
                              disabled={restartMutation.isPending}>
                              {restartMutation.isPending ? (
                                <Loader2 className='h-3.5 w-3.5 animate-spin' />
                              ) : (
                                <RotateCcw className='h-3.5 w-3.5' />
                              )}
                              Restart
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              className='gap-1.5'
                              onClick={() => redeployMutation.mutate(d.id)}
                              disabled={redeployMutation.isPending || !d.canRedeploy}>
                              {redeployMutation.isPending ? (
                                <Loader2 className='h-3.5 w-3.5 animate-spin' />
                              ) : (
                                <RefreshCw className='h-3.5 w-3.5' />
                              )}
                              Redeploy
                            </Button>
                          </div>
                        </div>
                        <Button
                          variant='secondary'
                          size='sm'
                          className='w-full justify-start gap-2 bg-muted/60'
                          onClick={() => openDeploymentLogs(d.id)}>
                          <Terminal className='h-4 w-4 shrink-0' />
                          View runtime logs
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className='flex min-h-[200px] flex-col items-center justify-center py-12 text-center'>
              <RefreshCw className='mb-3 h-12 w-12 text-muted-foreground' />
              <p className='font-medium text-foreground'>No deployments</p>
              <p className='mt-1 text-sm text-muted-foreground'>
                No deployments for this service yet.
              </p>
            </div>
          )}
      </BaseSheet>

      {/* Runtime logs sheet */}
      <BaseSheet
        open={logsSheetOpen}
        onOpenChange={setLogsSheetOpen}
        title='Runtime logs'
        description='Most recent runtime output for this deployment.'
        side='right'
        className='w-full sm:max-w-2xl'>
        {logsLoading ? (
            <div className='flex min-h-[200px] items-center justify-center py-12'>
              <Loader2 className='h-10 w-10 animate-spin text-primary' />
            </div>
          ) : (
            <ScrollArea className='max-h-[70vh]'>
              <div className='rounded-lg border border-border bg-[#0d1117] p-4 font-mono text-[13px] shadow-inner'>
                <div className='mb-3 flex items-center gap-2 border-b border-white/10 pb-2'>
                  <span className='h-2.5 w-2.5 rounded-full bg-emerald-500' />
                  <span className='text-xs uppercase tracking-wider text-zinc-500'>
                    Runtime output
                  </span>
                </div>
                {logs.length > 0 ? (
                  <div className='space-y-0.5'>
                    {logs.map((log, i) => (
                      <div
                        key={`${log.timestamp ?? ''}-${i}`}
                        className='flex gap-3 rounded py-1.5 pl-1 hover:bg-white/5'>
                        <span className='shrink-0 select-none text-zinc-500'>
                          {log.timestamp ? new Date(log.timestamp).toISOString() : '—'}
                        </span>
                        <span className='min-w-0 break-words text-zinc-300'>{log.message}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='py-6 text-center text-zinc-500'>No runtime logs.</p>
                )}
              </div>
            </ScrollArea>
          )}
      </BaseSheet>
    </DashboardLayout>
  )
}
