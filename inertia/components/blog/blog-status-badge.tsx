import { IconCalendar, IconClock } from '@tabler/icons-react'

import type { RawBlogPost } from '#types/model-types'
import { formatBlogDate, getReadingMinutes, isPublished } from './blog-utils'
import { Badge } from '@/components/ui/badge'

export interface BlogStatusBadgeProps {
  post: RawBlogPost
  className?: string
}

export function BlogStatusBadge({ post, className }: BlogStatusBadgeProps) {
  return (
    <Badge variant={isPublished(post) ? 'default' : 'secondary'} className={className}>
      {isPublished(post) ? 'Published' : 'Draft'}
    </Badge>
  )
}

export interface BlogMetaLineProps {
  post: RawBlogPost
  /** Include status badge (Published/Draft) */
  showStatus?: boolean
  className?: string
}

/** Inline meta: optional status badge + date + read time (for show page header) */
export function BlogMetaLine({ post, showStatus, className }: BlogMetaLineProps) {
  const dateLabel = post.publishedAt ? formatBlogDate(post.publishedAt) : null
  const minutes = getReadingMinutes(post.excerpt || '')

  return (
    <div
      className={['flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground', className]
        .filter(Boolean)
        .join(' ')}>
      {showStatus ? <BlogStatusBadge post={post} className='shrink-0' /> : null}
      {dateLabel ? (
        <span className='inline-flex items-center gap-1'>
          <IconCalendar className='h-3.5 w-3.5' />
          {dateLabel}
        </span>
      ) : null}
      {minutes !== null ? (
        <span className='inline-flex items-center gap-1'>
          <IconClock className='h-3.5 w-3.5' />
          {minutes} min read
        </span>
      ) : null}
    </div>
  )
}
