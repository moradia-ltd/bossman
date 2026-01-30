import type { SharedProps } from '@adonisjs/inertia/types'
import { Head } from '@inertiajs/react'
import { Database, Plus } from 'lucide-react'
import type { Column, PaginatedResponse } from '#types/extra'
import { timeAgo } from '#utils/date'
import { DataTable } from '@/components/dashboard/data-table'
import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useInertiaParams } from '@/hooks/use-inertia-params'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export type RawDbBackup = {
  id: number
  filePath: string | null
  fileSize: number
  createdAt: string
  updatedAt: string
}

interface DbBackupsIndexProps extends SharedProps {
  backups: PaginatedResponse<RawDbBackup>
}

const columns: Column<RawDbBackup>[] = [
  {
    key: 'id',
    header: 'ID',
    width: 80,
    cell: (row) => <span className='text-muted-foreground'>{row.id}</span>,
  },
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
]

export default function DbBackupsIndex({ backups }: DbBackupsIndexProps) {
  const { changePage, changeRows } = useInertiaParams({ page: 1, perPage: 20 })

  return (
    <DashboardLayout>
      <Head title='Backups' />
      <div className='space-y-6'>
        <PageHeader
          title='Backups'
          description='View database backup history.'
          actions={
            <Button type='button' variant='secondary' disabled>
              <Plus className='mr-2 h-4 w-4' />
              Create
            </Button>
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
