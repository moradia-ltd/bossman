import type { SharedProps } from '@adonisjs/inertia/types'
import { Deferred, Head, Link } from '@inertiajs/react'

import type { PaginatedResponse } from '#types/extra'
import type { RawBlogPost } from '#types/model-types'
import {
  BlogFeaturedPostCard,
  BlogPostCard,
} from '@/components/blog'
import { PublicLayout } from '@/components/layouts/public'
import { LoadingSkeleton } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { HStack } from '@/components/ui/hstack'
import { SimpleGrid } from '@/components/ui/simplegrid'

interface BlogIndexProps extends SharedProps {
  posts?: PaginatedResponse<RawBlogPost>
}

export default function BlogIndex({ posts }: BlogIndexProps) {
  const data = posts?.data ?? []
  const meta = posts?.metadata
  const isFirstPage = !meta || meta.currentPage === 1
  const featured = isFirstPage ? data[0] : null
  const rest = isFirstPage ? data.slice(1) : data

  return (
    <PublicLayout>
      <Head title='Blog' />
      <div className='relative'>
        <div className='pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-primary/10 to-transparent' />
        <div className='max-w-screen-xl mx-auto px-6 py-12 space-y-10'>
          <div className='flex flex-col gap-3'>
            <Badge className='w-fit' variant='secondary'>
              Blog
            </Badge>
            <h1 className='text-4xl sm:text-5xl font-bold tracking-tight'>
              Product updates, guides, and announcements
            </h1>
            <p className='text-muted-foreground text-base sm:text-lg max-w-2xl'>
              Learn what's new, how things work, and how to get the most out of the platform.
            </p>
          </div>

          <Deferred data='posts' fallback={<LoadingSkeleton type='table' />}>
            {!data.length ? (
              <Card className='p-10'>
                <div className='text-center space-y-2'>
                  <div className='text-lg font-semibold'>No posts yet</div>
                  <div className='text-sm text-muted-foreground'>Check back soon for updates.</div>
                </div>
              </Card>
            ) : (
              <>
                {featured ? <BlogFeaturedPostCard post={featured} /> : null}

                {rest.length ? (
                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
                    {rest.map((post) => (
                      <BlogPostCard key={post.id} post={post} />
                    ))}
                  </SimpleGrid>
                ) : null}

                {meta ? (
                  <HStack justify='between' align='center' className='flex-col sm:flex-row gap-4'>
                    <div className='flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground'>
                      <span>
                        Page {meta.currentPage} of {meta.lastPage} • {meta.total} posts
                      </span>
                      <span className='inline-flex items-center gap-1 flex-wrap'>
                        Show
                        {[12, 24, 48].map((n, i) => (
                          <span key={n} className='inline-flex items-center'>
                            {i > 0 ? ' · ' : null}
                            <Link
                              href={`/blog?page=1&perPage=${n}`}
                              className={
                                meta.perPage === n
                                  ? 'font-medium text-foreground'
                                  : 'hover:text-foreground underline-offset-2 hover:underline'
                              }>
                              {n}
                            </Link>
                          </span>
                        ))}
                      </span>
                    </div>
                    <HStack spacing={2} align='center'>
                      <Button
                        variant='outline'
                        size='sm'
                        disabled={meta.currentPage <= 1}
                        asChild={meta.currentPage > 1}>
                        <Link
                          href={
                            meta.currentPage <= 1
                              ? '/blog'
                              : `/blog?page=${meta.currentPage - 1}&perPage=${meta.perPage}`
                          }>
                          Previous
                        </Link>
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        disabled={meta.currentPage >= meta.lastPage}
                        asChild={meta.currentPage < meta.lastPage}>
                        <Link
                          href={`/blog?page=${meta.currentPage + 1}&perPage=${meta.perPage}`}>
                          Next
                        </Link>
                      </Button>
                    </HStack>
                  </HStack>
                ) : null}
              </>
            )}
          </Deferred>
        </div>
      </div>
    </PublicLayout>
  )
}
