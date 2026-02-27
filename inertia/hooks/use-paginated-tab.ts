import { useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import type { PaginatedResponse } from '#types/extra'
import { tablePaginationFromMeta } from '@/lib/pagination'
import type { TablePaginationConfig } from '@/lib/pagination'

export interface UsePaginatedTabOptions {
  defaultPerPage?: number
}

/**
 * Hook for paginated tab content: manages page/perPage state, fetches via fetch(page, perPage),
 * and returns data, loading, and a DataTable-ready pagination config (with reset-to-page-1 on pageSize change).
 */
export function usePaginatedTab<T>(
  queryKey: unknown[],
  fetch: (page: number, perPage: number) => Promise<PaginatedResponse<T>>,
  options: UsePaginatedTabOptions = {},
) {
  const { defaultPerPage = 10 } = options
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(defaultPerPage)

  const { data, isPending } = useQuery({
    queryKey: [...queryKey, page, perPage],
    queryFn: () => fetch(page, perPage),
  })

  const onPageSizeChange = useCallback((size: number) => {
    setPerPage(size)
    setPage(1)
  }, [])

  const meta = data?.metadata ?? data?.meta
  const pagination: TablePaginationConfig | undefined = tablePaginationFromMeta(meta, {
    onPageChange: setPage,
    onPageSizeChange,
  })

  return {
    data: data?.data ?? [],
    loading: isPending,
    pagination,
  }
}
