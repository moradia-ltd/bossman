import type { SharedProps } from '@adonisjs/inertia/types'
import { Deferred, Head, Link } from '@inertiajs/react'
import { IconArrowRight, IconCalendar, IconClock } from '@tabler/icons-react'

import type { PaginatedResponse } from '#types/extra'
import type { RawBlogPost } from '#types/model-types'
import { PublicLayout } from '@/components/layouts/public'

function getCoverImageUrl(post: RawBlogPost): string | null {
  const c = post.coverImage
  if (c && typeof c === 'object' && 'url' in c && typeof (c as { url?: string }).url === 'string')
    return (c as { url: string }).url
  const alt = post.coverImageAltUrl
  if (alt && typeof alt === 'string' && (alt.startsWith('http://') || alt.startsWith('https://')))
    return alt
  return null
}

function getCoverImageAlt(post: RawBlogPost): string {
  const url = post.coverImageAltUrl
  if (url && typeof url === 'string' && !url.startsWith('http')) return url
  return post.title
}

import { LoadingSkeleton } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { HStack } from '@/components/ui/hstack'
import { SimpleGrid } from '@/components/ui/simplegrid'
import { Stack } from '@/components/ui/stack'

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
              Learn what’s new, how things work, and how to get the most out of the platform.
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
                {featured ? <FeaturedPostCard post={featured} /> : null}

                {rest.length ? (
                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
                    {rest.map((post) => (
                      <PostCard key={post.id} post={post} />
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

function FeaturedPostCard({ post }: { post: RawBlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className='group block'>
      <Card className='overflow-hidden'>
        <div className='grid gap-0 lg:grid-cols-[1.2fr_1fr] lg:max-h-52'>
          <div className='relative bg-muted min-h-0'>
            <div className='aspect-[16/9] lg:aspect-auto lg:h-full lg:max-h-52'>
              {getCoverImageUrl(post) ? (
                <img
                  src={getCoverImageUrl(post)!}
                  alt={getCoverImageAlt(post)}
                  className='h-full w-full object-cover'
                  loading='lazy'
                />
              ) : (
                <div className='h-full w-full' />
              )}
            </div>
            <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent' />
            <div className='absolute bottom-3 left-3 right-3'>
              <HStack spacing={2} wrap align='center'>
                <MetaDateAndReadTime post={post} className='text-white/90' />
              </HStack>
            </div>
          </div>

          <div className='p-4 lg:p-5 min-h-0'>
            <Stack spacing={3} className='h-full'>
              <Stack spacing={1.5}>
                <div className='text-xs text-muted-foreground'>Featured</div>
                <div className='text-xl sm:text-2xl font-bold tracking-tight group-hover:underline'>
                  {post.title}
                </div>
                {post.excerpt ? (
                  <p className='text-muted-foreground text-sm line-clamp-2'>
                    {post.excerpt}
                  </p>
                ) : null}
              </Stack>

              <HStack justify='between' align='center' className='mt-auto gap-4'>
                <HStack spacing={1} align='center' className='text-sm font-medium'>
                  Read
                  <IconArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
                </HStack>
              </HStack>
            </Stack>
          </div>
        </div>
      </Card>
    </Link>
  )
}

function PostCard({ post }: { post: RawBlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className='group block'>
      <Card className='overflow-hidden h-full flex flex-col'>
        <div className='relative bg-muted'>
          <div className='aspect-[16/9]'>
            {getCoverImageUrl(post) ? (
              <img
                src={getCoverImageUrl(post)!}
                alt={getCoverImageAlt(post)}
                className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]'
                loading='lazy'
              />
            ) : (
              <div className='h-full w-full' />
            )}
          </div>
          <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-80' />
        </div>

        <CardHeader className='space-y-2'>
          <CardTitle className='text-xl leading-snug group-hover:underline line-clamp-2'>
            {post.title}
          </CardTitle>
          {post.excerpt ? (
            <p className='text-sm text-muted-foreground line-clamp-3'>{post.excerpt}</p>
          ) : null}
        </CardHeader>

        <CardFooter className='mt-auto'>
          <MetaDateAndReadTime post={post} className='text-muted-foreground' />
        </CardFooter>
      </Card>
    </Link>
  )
}

function MetaDateAndReadTime({ post, className }: { post: RawBlogPost; className?: string }) {
  const dateLabel = post.publishedAt ? formatDate(post.publishedAt) : null
  const minutes = getReadingMinutes(post.excerpt || '')

  return (
    <HStack spacing={2} align='center' className={['text-xs', className].filter(Boolean).join(' ')}>
      {dateLabel ? (
        <HStack spacing={1} align='center' className='inline-flex'>
          <IconCalendar className='h-3.5 w-3.5' />
          {dateLabel}
        </HStack>
      ) : null}
      {minutes ? (
        <HStack spacing={1} align='center' className='inline-flex'>
          <IconClock className='h-3.5 w-3.5' />
          {minutes} min read
        </HStack>
      ) : null}
    </HStack>
  )
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return value
  }
}

function getReadingMinutes(text: string) {
  const trimmed = String(text || '').trim()
  if (!trimmed) return null
  const words = trimmed.split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 220))
  return minutes
}
