import type { MultipartFile } from '@adonisjs/core/bodyparser'
import type db from '@adonisjs/lucid/services/db'
import type { baseCountries } from '../data/countries.js'

export type AppCountries = (typeof baseCountries)[number]['name']

export type Transaction = Awaited<ReturnType<typeof db.transaction>>
/** px number or CSS width string (e.g. '10rem', '20%') */
export type ColumnWidthValue = number | string

export type Column<T> = {
  key: string
  header: string
  sortable?: boolean
  cell?: (row: T) => React.ReactNode
  /** Minimum column width (px or CSS string). Prevents column from shrinking too much. */
  minWidth?: ColumnWidthValue
  /** Maximum column width (px or CSS string). Prevents long content from stretching this column. */
  maxWidth?: ColumnWidthValue
  /** Fixed or preferred width (px or CSS string). */
  width?: ColumnWidthValue
  /** Flex grow weight. Columns with flex share remaining space proportionally. */
  flex?: number
}
export type PaginationMeta = {
  currentPage: number
  perPage: number
  total: number
  lastPage: number
}

export type PaginatedResponse<T> = {
  data: T[]
  /** Lucid paginator uses "meta" */
  meta?: PaginationMeta
  /** Transformer paginate() uses "metadata"; support both for compatibility */
  metadata?: PaginationMeta
}

export type File = MultipartFile | undefined
export type MultipleFiles = MultipartFile[] | undefined

export const plaidSupportedCountries: string[] = [
  'United Kingdom',
  'Germany',
  'France',
  'Netherlands',
  'Ireland',
  'Spain',
  'Sweden',
  'Denmark',
  'Poland',
  'Portugal',
  'Italy',
  'Lithuania',
  'Latvia',
  'Estonia',
  'Norway',
  'Belgium',
  'United States',
  'Canada',
  'Austria',
  'Finland',
]
export type PlaidSupportedCountries = (typeof plaidSupportedCountries)[number]
