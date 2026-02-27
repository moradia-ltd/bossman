import type { PaginatedResponse, PaginationMeta } from '#types/extra'

/**
 * Get pagination meta from a paginated response (supports both .meta and .metadata).
 */
export function getPaginationMeta<T>(
  response: PaginatedResponse<T> | undefined | null,
): PaginationMeta | undefined {
  if (!response) return undefined
  return response.metadata ?? response.meta
}
