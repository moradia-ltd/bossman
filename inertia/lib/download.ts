/**
 * Extract filename from Content-Disposition header (e.g. from download responses).
 */
export function getFilenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null
  const match = header.match(/filename="?([^";\n]+)"?/)
  return match ? match[1].trim() : null
}
