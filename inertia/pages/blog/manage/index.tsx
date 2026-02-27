import type { SharedProps } from '@adonisjs/inertia/types'
import { Deferred, Head, Link, router } from '@inertiajs/react'
import { IconEdit, IconPlus, IconTags, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'

import type { Column, PaginatedResponse } from '#types/extra'
import type { RawBlogPost } from '#types/model-types'
import { BlogStatusBadge, isPublished } from '@/components/blog'
import { DataTable } from '@/components/dashboard/data-table'
import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { LoadingSkeleton } from '@/components/ui'
import { AppCard } from '@/components/ui/app-card'
import { Button } from '@/components/ui/button'
import { useInertiaParams } from '@/hooks/use-inertia-params'
import { tablePagination } from '@/lib/pagination'

interface BlogAdminIndexProps extends SharedProps {
  posts?: PaginatedResponse<RawBlogPost>
}

export default function BlogAdminIndex({ posts }: BlogAdminIndexProps) {
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null)
  const { changePage, changeRows, searchTable, query } = useInertiaParams({
    page: 1,
    perPage: 10,
    search: '',
  })


  const columns: Column<RawBlogPost>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      cell: (row) => (
        <div className='space-y-1'>
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='font-medium'>{row.title}</span>
            <BlogStatusBadge post={row} className='shrink-0' />
          </div>
        </div>
      ),
    },
    {
      key: 'publishedAt',
      header: 'Published',
      cell: (row) => (row.publishedAt ? new Date(row.publishedAt).toLocaleDateString() : '—'),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className='flex items-center justify-end gap-2'>
          <Link href={`/blog/manage/${row.id}/edit`}  >
            <Button variant='ghost' size='icon' asChild leftIcon={<IconEdit className='h-4 w-4' />}>
              Edit
            </Button>
          </Link>
          {row.publishedAt ? (
            <Button variant='ghost' size='icon' asChild>
              <Link href={`/blog/${row.slug}`}>View</Link>
            </Button>
          ) : null}
          <Button
            variant='ghost'
            size='icon'
            leftIcon={<IconTrash className='h-4 w-4' />}
            className='text-destructive hover:text-destructive'
            isLoading={isDeletingId === row.id}
            onClick={() => {
              if (!confirm('Delete this post?')) return
              setIsDeletingId(row.id)
              router.delete(`/blog/manage/${row.id}`, {
                preserveScroll: true,
                onFinish: () => setIsDeletingId(null),
              })
            }}>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <Head title='Blog admin' />
      <div className='space-y-6'>
        <PageHeader
          title='Blog'
          description='Create and manage posts and categories.'
          actions={
            <>
              <Button variant='outline' asChild>
                <Link href='/blog'>View public blog</Link>
              </Button>
              <Button variant='outline' leftIcon={<IconTags />} asChild>
                <Link href='/blog/manage/categories'>Categories</Link>
              </Button>
              <Button leftIcon={<IconPlus />} asChild>
                <Link href='/blog/manage/create'>New post</Link>
              </Button>
            </>
          }
        />

        <Deferred data='posts' fallback={<LoadingSkeleton type='table' />}>
          <AppCard title='Posts' description='Search, paginate, and manage your posts.'>
            <DataTable
              columns={columns}
              data={posts?.data ?? []}
              searchable
              searchPlaceholder='Search posts...'
              searchValue={String(query.search || '')}
              onSearchChange={(value) => searchTable(String(value || ''))}
              pagination={tablePagination(posts, {
                onPageChange: changePage,
                onPageSizeChange: changeRows,
              })}
              emptyMessage='No posts found'
            />
          </AppCard>
        </Deferred>
      </div>
    </DashboardLayout>
  )
}
