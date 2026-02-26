import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  IconBold,
  IconItalic,
  IconList,
  IconListNumbers,
  IconQuote,
  IconStrikethrough,
} from '@tabler/icons-react'

/** Default empty Tiptap document (ProseMirror schema) */
export const EMPTY_TIPTAP_DOC = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
} as const

export type TiptapJson = Record<string, unknown> | unknown[]

function isTiptapDoc(value: unknown): value is { type: 'doc'; content?: unknown[] } {
  return (
    value != null &&
    typeof value === 'object' &&
    'type' in value &&
    (value as { type: string }).type === 'doc'
  )
}

function normalizeInitialContent(value: TiptapJson | null | undefined): TiptapJson {
  if (value == null) return EMPTY_TIPTAP_DOC
  if (isTiptapDoc(value)) return value
  return EMPTY_TIPTAP_DOC
}

export interface RichTextEditorProps {
  value: TiptapJson | null | undefined
  onChange: (json: TiptapJson) => void
  placeholder?: string
  className?: string
  /** Optional: set to post.id on edit page so editor remounts when switching posts */
  editorKey?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing…',
  className,
  editorKey,
}: RichTextEditorProps) {
  const initialContent = React.useMemo(() => normalizeInitialContent(value), [editorKey])

  const editor = useEditor({
    key: editorKey,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          'min-h-[240px] w-full px-3 py-2 prose prose-sm dark:prose-invert max-w-none focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as TiptapJson)
    },
  })

  if (!editor) {
    return (
      <div
        className={cn(
          'min-h-[240px] w-full rounded-lg border border-input bg-muted/30 animate-pulse',
          className,
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-input bg-background overflow-hidden',
        className,
      )}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/40 p-1">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold">
        <IconBold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic">
        <IconItalic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough">
        <IconStrikethrough className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-border" aria-hidden />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet list">
        <IconList className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered list">
        <IconListNumbers className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Quote">
        <IconQuote className="h-4 w-4" />
      </ToolbarButton>
    </div>
  )
}

function ToolbarButton({
  onClick,
  isActive,
  title,
  children,
}: {
  onClick: () => void
  isActive: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={onClick}
      title={title}
      aria-pressed={isActive}>
      <span
        className={cn(
          'flex items-center justify-center',
          isActive && 'text-primary',
        )}>
        {children}
      </span>
    </Button>
  )
}
