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

/** Pagination object shape expected by DataTable */
export interface TablePaginationConfig {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

/**
 * Build DataTable pagination prop from meta + callbacks.
 * Returns undefined when meta is missing so the table hides pagination.
 */
export function tablePaginationFromMeta(
  meta: PaginationMeta | undefined,
  callbacks: {
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
  },
): TablePaginationConfig | undefined {
  if (!meta) return undefined
  return {
    page: meta.currentPage,
    pageSize: meta.perPage,
    total: meta.total,
    onPageChange: callbacks.onPageChange,
    onPageSizeChange: callbacks.onPageSizeChange,
  }
}

/**
 * One-liner: get DataTable pagination from a paginated response and callbacks.
 * Uses getPaginationMeta + tablePaginationFromMeta.
 */
export function tablePagination<T>(
  response: PaginatedResponse<T> | undefined | null,
  callbacks: {
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
  },
): TablePaginationConfig | undefined {
  return tablePaginationFromMeta(getPaginationMeta(response), callbacks)
}
