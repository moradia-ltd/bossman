import type { RawBlogPost } from '#types/model-types'

export function getCoverImageUrl(post: RawBlogPost): string | null {
  const c = post.coverImage
  if (c && 'url' in c && typeof (c as { url?: string }).url === 'string') {
    return (c as { url: string }).url.trim()
  }
  const alt = post.coverImageAltUrl
  if (alt) {
    return alt.trim()
  }
  return null
}

export function getCoverImageAlt(post: RawBlogPost): string {
  const url = post.coverImageAltUrl
  if (url && typeof url === 'string' && !url.startsWith('http')) return url
  return post.title
}

export function formatBlogDate(value: string): string {
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

export function getReadingMinutes(text: string): number | null {
  const trimmed = String(text || '').trim()
  if (!trimmed) return null
  const words = trimmed.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

export function isPublished(post: RawBlogPost): boolean {
  return Boolean(post.publishedAt)
}

/** Used by edit form to detect if cover is "Link" (URL) vs "Upload" */
export function getInitialIsUploadedPhotoLink(post: RawBlogPost): boolean {
  const alt = post.coverImageAltUrl
  if (alt && (alt.startsWith('http://') || alt.startsWith('https://'))) return true
  return false
}

export const COVER_PHOTO_OPTIONS = [
  { value: false, label: 'Upload photo', description: 'Upload an image file' },
  { value: true, label: 'Link', description: 'Use an image URL' },
] as const
