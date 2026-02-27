import { Head, Link } from '@inertiajs/react'
import { IconArrowLeft, IconCalendar, IconClock, IconPencil } from '@tabler/icons-react'

import type { RawBlogPost } from '#types/model-types'
import { BlogBodyRenderer } from '@/components/blog/blog-body-renderer'
import { PublicLayout } from '@/components/layouts/public'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface BlogShowProps {
  post: RawBlogPost
}

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
  return Math.max(1, Math.round(words / 220))
}

export default function BlogShow({ post }: BlogShowProps) {
  const publishedLabel = post.publishedAt ? formatDate(post.publishedAt) : null
  const minutes = getReadingMinutes(post.excerpt || '')
  const coverUrl = getCoverImageUrl(post)

  return (
    <PublicLayout>
      <Head title={post.title} />
      <div className='relative'>
        <div className='pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-primary/10 to-transparent' />

        <div className='max-w-screen-xl mx-auto px-6 py-10 space-y-8'>
          <div>
            <div className='flex flex-wrap items-center gap-2'>
              <Button variant='ghost' asChild leftIcon={<IconArrowLeft className='h-4 w-4' />}>
                <Link href='/blog'>Back to blog</Link>
              </Button>
              <Button variant='outline' size='sm' asChild leftIcon={<IconPencil className='h-4 w-4' />}>
                <Link href={`/blog/manage/${post.id}/edit`}>Edit</Link>
              </Button>
            </div>
          </div>

          <div className='grid gap-8'>
            <article className='space-y-6 max-w-3xl'>
              {coverUrl ? (
                <Card className='overflow-hidden'>
                  <div className='aspect-[16/9] bg-muted'>
                    <img
                      src={coverUrl}
                      alt={getCoverImageAlt(post)}
                      className='h-full w-full object-cover'
                      loading='eager'
                    />
                  </div>
                </Card>
              ) : null}

              <div className='space-y-3'>
                <div className='flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground'>
                  {publishedLabel ? (
                    <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
                      <IconCalendar className='h-3.5 w-3.5' />
                      {publishedLabel}
                    </span>
                  ) : null}
                  {minutes ? (
                    <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
                      <IconClock className='h-3.5 w-3.5' />
                      {minutes} min read
                    </span>
                  ) : null}
                </div>

                <h1 className='text-4xl sm:text-5xl font-bold tracking-tight'>{post.title}</h1>
                {post.excerpt ? (
                  <p className='text-muted-foreground text-base sm:text-lg max-w-3xl'>
                    {post.excerpt}
                  </p>
                ) : null}
              </div>

              <BlogBodyRenderer body={post.body} />
            </article>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
