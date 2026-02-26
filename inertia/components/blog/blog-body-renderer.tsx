import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import * as React from 'react'

import { cn } from '@/lib/utils'

const BLOG_BODY_EXTENSIONS = [StarterKit]

function isTiptapDoc(
  body: unknown,
): body is { type: 'doc'; content?: unknown[] } {
  return (
    body != null &&
    typeof body === 'object' &&
    'type' in body &&
    (body as { type: string }).type === 'doc'
  )
}

export interface BlogBodyRendererProps {
  body: unknown
  className?: string
}

/**
 * Renders blog post body JSON as HTML. Expects Tiptap/ProseMirror doc format.
 * Falls back to empty content for invalid or non-Tiptap body.
 */
export function BlogBodyRenderer({ body, className }: BlogBodyRendererProps) {
  const html = React.useMemo(() => {
    if (!isTiptapDoc(body)) return ''
    try {
      return generateHTML(body as Parameters<typeof generateHTML>[0], BLOG_BODY_EXTENSIONS)
    } catch {
      return ''
    }
  }, [body])

  if (!html.trim()) {
    return <div className={cn('text-sm text-muted-foreground', className)}>No content.</div>
  }

  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none text-base leading-7 text-foreground/90',
        'prose-p:mb-4 prose-ul:my-4 prose-ol:my-4 prose-li:my-0.5',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
