import type { SharedProps } from '@adonisjs/inertia/types'
import { Deferred, Head, router } from '@inertiajs/react'
import { IconDownload, IconPlus, IconRotate2, IconTrash } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

import type { Column, PaginatedResponse } from '#types/extra'
import type { RawDbBackup } from '#types/model-types'
import { timeAgo } from '#utils/date'
import { formatFileSize } from '#utils/functions'
import { DataTable } from '@/components/dashboard/data-table'
import { DashboardPage } from '@/components/dashboard/dashboard-page'
import { LoadingSkeleton } from '@/components/ui'
import { AppCard } from '@/components/ui/app-card'
import { BaseDialog } from '@/components/ui/base-dialog'
import { BaseModal } from '@/components/ui/base-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingOverlay } from '@/components/ui/loading'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Stack } from '@/components/ui/stack'
import { useInertiaParams } from '@/hooks/use-inertia-params'
import { type ServerErrorResponse, serverErrorResponder } from '@/lib/error'
import { getFilenameFromContentDisposition } from '@/lib/download'
import { tablePagination } from '@/lib/pagination'
import api from '@/lib/http'

interface DbBackupsIndexProps extends SharedProps {
  backups: PaginatedResponse<RawDbBackup>
}

const baseColumns: Column<RawDbBackup>[] = [
  {
    key: 'filePath',
    header: 'File path',
    minWidth: 320,
    flex: 1,
    cell: (row) => (
      <span className='font-mono text-sm break-all' title={row.filePath ?? undefined}>
        {row.filePath}
      </span>
    ),
  },
  {
    key: 'fileSize',
    header: 'Size',
    width: 100,
    cell: (row) => formatFileSize(row.fileSize),
  },
  {
    key: 'createdAt',
    header: 'Created',
    width: 140,
    cell: (row) => timeAgo(row.createdAt ?? ''),
  },
]

export default function DbBackupsIndex({ backups }: DbBackupsIndexProps) {
  const { changePage, changeRows } = useInertiaParams({ page: 1, perPage: 20 })
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [restoreModalOpen, setRestoreModalOpen] = useState(false)
  const [restoreBackupId, setRestoreBackupId] = useState<string>('')
  const [restoreConnectionUrl, setRestoreConnectionUrl] = useState('')
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const handleDownload = async (row: RawDbBackup) => {
    setDownloadingId(row.id)
    try {
      const res = await fetch(`/db-backups/${row.id}/download`, { credentials: 'include' })
      if (!res.ok) {
        toast.error('Failed to download backup')
        return
      }
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition')
      const filename =
        getFilenameFromContentDisposition(disposition) ?? row.fileName ?? `backup-${row.id}.sql`
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Downloaded')
    } catch {
      toast.error('Failed to download backup')
    } finally {
      setDownloadingId(null)
    }
  }

  const columns: Column<RawDbBackup>[] = [
    ...baseColumns,
    {
      key: 'actions',
      header: '',
      width: 120,
      cell: (row) => (
        <div className='flex items-center gap-1'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            aria-label='Download backup'
            disabled={downloadingId === row.id}
            onClick={() => handleDownload(row)}>
            <IconDownload className='h-4 w-4' />
          </Button>
          <BaseDialog
            title='Delete backup?'
            description='This will remove the backup record and the file from storage. This action cannot be undone.'
            trigger={
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10'
                aria-label='Delete backup'>
                <IconTrash className='h-4 w-4' />
              </Button>
            }
            primaryText='Delete'
            primaryVariant='destructive'
            secondaryText='Cancel'
            onPrimaryAction={() => router.delete(`/db-backups/${row.id}`)}
          />
        </div>
      ),
    },
  ]

  const createBackupMutation = useMutation({
    mutationFn: () => api.post('/db-backups', {}),
    onSuccess: () => {
      toast.success('Backup created')
      router.reload()
    },
    onError: (err: ServerErrorResponse) => {
      toast.error(serverErrorResponder(err) || 'Failed to create backup')
    },
  })

  const restoreBackupMutation = useMutation({
    mutationFn: ({ backupId, connectionUrl }: { backupId: number; connectionUrl: string }) =>
      api.post(`/db-backups/${backupId}/restore`, { connectionUrl }),
    onSuccess: () => {
      toast.success('Restore completed successfully')
      setRestoreModalOpen(false)
      setRestoreBackupId('')
      setRestoreConnectionUrl('')
      router.reload()
    },
    onError: (err: ServerErrorResponse) => {
      toast.error(serverErrorResponder(err) || 'Failed to restore backup')
    },
  })

  const handleCreateBackup = () => {
    setCreateModalOpen(false)
    createBackupMutation.mutate()
  }

  const handleRestore = () => {
    const backupId = Number(restoreBackupId)
    if (!restoreBackupId || Number.isNaN(backupId) || !restoreConnectionUrl.trim()) {
      toast.error('Select a backup and enter a connection URL')
      return
    }
    restoreBackupMutation.mutate({
      backupId,
      connectionUrl: restoreConnectionUrl.trim(),
    })
  }

  return (
    <DashboardPage
      title='Backups'
      description='View database backup history.'
      actions={
        <div className='flex items-center gap-2'>
          <BaseModal
            open={restoreModalOpen}
            onOpenChange={(open) => {
              setRestoreModalOpen(open)
              if (!open) {
                setRestoreBackupId('')
                setRestoreConnectionUrl('')
              }
            }}
            title='Restore backup'
            description='Choose a backup and the database connection URL to restore it to. This will overwrite the target database.'
            trigger={
              <Button type='button' variant='outline'>
                <IconRotate2 className='mr-2 h-4 w-4' />
                Restore
              </Button>
            }
            primaryText='Restore'
            secondaryText='Cancel'
            onPrimaryAction={handleRestore}
            isLoading={restoreBackupMutation.isPending}
            primaryDisabled={!restoreBackupId || !restoreConnectionUrl.trim()}>
            <Stack spacing={4}>
              <div className='space-y-2'>
                <Label htmlFor='restore-backup'>Backup</Label>
                <Select
                  value={restoreBackupId}
                  onValueChange={(value) => setRestoreBackupId(value ?? '')}
                  id='restore-backup'>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select a backup to restore' />
                  </SelectTrigger>
                  <SelectContent>
                    {(backups?.data ?? []).map((backup) => (
                      <SelectItem key={backup.id} value={String(backup.id)}>
                        {backup.fileName ?? backup.filePath ?? `Backup #${backup.id}`} (
                        {backup.createdAt ? new Date(backup.createdAt).toLocaleString() : '—'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='restore-connection-url'>Connection URL</Label>
                <Input
                  id='restore-connection-url'
                  type='url'
                  placeholder='postgresql://user:password@host:5432/dbname'
                  value={restoreConnectionUrl}
                  onChange={(e) => setRestoreConnectionUrl(e.target.value)}
                  className='font-mono text-sm'
                />
                <p className='text-xs text-muted-foreground'>
                  PostgreSQL connection URL of the database to restore into. Existing data may
                  be overwritten.
                </p>
              </div>
            </Stack>
          </BaseModal>
          <BaseModal
            open={createModalOpen}
            onOpenChange={setCreateModalOpen}
            title='Create backup?'
            description='This will create a new database backup and upload it to storage. This may take a moment. Continue?'
            trigger={
              <Button type='button' variant='default'>
                <IconPlus className='mr-2 h-4 w-4' />
                Create
              </Button>
            }
            primaryText='Create backup'
            secondaryText='Cancel'
            onPrimaryAction={handleCreateBackup}
            isLoading={createBackupMutation.isPending}
          />
        </div>
      }>
      <LoadingOverlay
        text={
          downloadingId !== null
            ? 'Downloading...'
            : createBackupMutation.isPending
              ? 'Creating backup...'
              : 'Restoring backup...'
        }
        className='z-[100]'
        isLoading={
          downloadingId !== null ||
          createBackupMutation.isPending ||
          restoreBackupMutation.isPending
        }
      />
      <Deferred data='backups' fallback={<LoadingSkeleton type='table' />}>
          <AppCard title='Backups' description={`${backups?.meta?.total ?? 0} total`}>
            <DataTable
              columns={columns}
              data={backups?.data ?? []}
              emptyMessage='No backups yet.'
              pagination={tablePagination(backups, {
                onPageChange: changePage,
                onPageSizeChange: changeRows,
              })}
            />
          </AppCard>
        </Deferred>
    </DashboardPage>
  )
}
