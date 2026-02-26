import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  type MDXEditorMethods,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import * as React from 'react'

import { cn } from '@/lib/utils'

export interface MarkdownEditorProps {
  value: string
  onChange: (markdown: string) => void
  className?: string
  /** Optional: when set, editor content is synced when value changes (e.g. post.id for edit page) */
  editorKey?: string
}

export function MarkdownEditor({
  value,
  onChange,
  className,
  editorKey,
}: MarkdownEditorProps) {
  const ref = React.useRef<MDXEditorMethods>(null)

  React.useEffect(() => {
    if (!ref.current || value === undefined) return
    ref.current.setMarkdown(value)
  }, [editorKey])

  return (
    <div className={cn('rounded-lg border border-input bg-background overflow-hidden', className)}>
      <MDXEditor
        ref={ref}
        markdown={value}
        onChange={onChange}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
        ]}
        className="min-h-[280px] prose prose-sm dark:prose-invert max-w-none"
      />
    </div>
  )
}
