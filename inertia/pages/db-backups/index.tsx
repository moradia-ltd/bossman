import type { SharedProps } from '@adonisjs/inertia/types'
import { Head, router } from '@inertiajs/react'
import { useMutation } from '@tanstack/react-query'
import { Database, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Column, PaginatedResponse } from '#types/extra'
import type { RawDbBackup } from '#types/model-types'
import { timeAgo } from '#utils/date'
import { DataTable } from '@/components/dashboard/data-table'
import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { BaseDialog } from '@/components/ui/base-dialog'
import { BaseModal } from '@/components/ui/base-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingOverlay } from '@/components/ui/loading'
import { useInertiaParams } from '@/hooks/use-inertia-params'
import api from '@/lib/http'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface DbBackupsIndexProps extends SharedProps {
  backups: PaginatedResponse<RawDbBackup>
}

const columns: Column<RawDbBackup>[] = [

  {
    key: 'filePath',
    header: 'File path',
    cell: (row) => (
      <span className='font-mono text-sm' title={row.filePath ?? undefined}>
        {row.filePath ?? '—'}
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
  {
    key: 'actions',
    header: '',
    width: 80,
    cell: (row) => (
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
            <Trash2 className='h-4 w-4' />
          </Button>
        }
        primaryText='Delete'
        primaryVariant='destructive'
        secondaryText='Cancel'
        onPrimaryAction={() => router.delete(`/db-backups/${row.id}`)}
      />
    ),
  },
]

export default function DbBackupsIndex({ backups }: DbBackupsIndexProps) {
  const { changePage, changeRows } = useInertiaParams({ page: 1, perPage: 20 })
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const createBackupMutation = useMutation({
    mutationFn: () => api.post('/db-backups', {}),
    onSuccess: () => {
      router.reload()
    },
  })

  const handleCreateBackup = () => {
    setCreateModalOpen(false)
    createBackupMutation.mutate()
  }

  return (
    <DashboardLayout>
      <Head title='Backups' />

      <LoadingOverlay text='Creating backup...' className='z-[100]' isLoading={createBackupMutation.isPending} />
      <div className='space-y-6'>
        <PageHeader
          title='Backups'
          description='View database backup history.'
          actions={
            <BaseModal
              open={createModalOpen}
              onOpenChange={setCreateModalOpen}
              title='Create backup?'
              description='This will create a new database backup and upload it to storage. This may take a moment. Continue?'
              trigger={
                <Button type='button' variant='default'>
                  <Plus className='mr-2 h-4 w-4' />
                  Create
                </Button>
              }
              primaryText='Create backup'
              secondaryText='Cancel'
              onPrimaryAction={handleCreateBackup}
              isLoading={createBackupMutation.isPending}
            />
          }
        />

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Database className='h-5 w-5' />
              Backups
            </CardTitle>
            <CardDescription>{backups.meta.total} total</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={backups.data}
              emptyMessage='No backups yet.'
              pagination={{
                page: backups.meta.currentPage,
                pageSize: backups.meta.perPage,
                total: backups.meta.total,
                onPageChange: changePage,
                onPageSizeChange: changeRows,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
