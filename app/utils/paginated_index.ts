import type { HttpContext } from '@adonisjs/core/http'

type PaginatorLike = {
  all(): unknown[]
  getMeta(): { currentPage: number; perPage: number; total: number; lastPage: number }
}

type TransformerLike = {
  paginate(items: unknown[], meta: PaginatorLike['getMeta'] extends () => infer M ? M : never): unknown
}

export interface PaginatedIndexOptions {
  defaultPerPage?: number
  maxPerPage?: number
}

/**
 * Builds Inertia deferred data for a simple paginated index: runs request.paginationQs(),
 * calls getPaginator(page, perPage), then returns inertia.defer(() => transformer.paginate(all(), meta)).
 * Use in controllers where the index is a single query + paginate + transform.
 *
 * @param request - HttpContext.request
 * @param inertia - HttpContext.inertia
 * @param dataKey - Key for the deferred data (e.g. 'backups', 'notifications')
 * @param getPaginator - Async function that returns a paginator with .all() and .getMeta()
 * @param transformer - Object with .paginate(items, meta) (e.g. DbBackupTransformer)
 * @param options - defaultPerPage (default 20), maxPerPage (optional cap)
 */
export async function paginatedIndex<T extends PaginatorLike>(
  request: HttpContext['request'],
  inertia: HttpContext['inertia'],
  dataKey: string,
  getPaginator: (page: number, perPage: number) => Promise<T>,
  transformer: TransformerLike,
  options: PaginatedIndexOptions = {},
): Promise<Record<string, ReturnType<HttpContext['inertia']['defer']>>> {
  const { defaultPerPage = 20, maxPerPage } = options
  const params = await request.paginationQs()
  const page = params.page ?? 1
  const perPage = Math.min(
    params.perPage ?? defaultPerPage,
    maxPerPage ?? Number.MAX_SAFE_INTEGER,
  )

  const defer = inertia.defer(
    (async () => {
      const paginator = await getPaginator(page, perPage)
      return transformer.paginate(paginator.all(), paginator.getMeta())
    }) as any,
  )

  return { [dataKey]: defer } as Record<string, ReturnType<HttpContext['inertia']['defer']>>
}
