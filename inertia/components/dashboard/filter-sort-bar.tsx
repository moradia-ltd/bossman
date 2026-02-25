import { IconX } from '@tabler/icons-react'

import { startCase } from '#utils/functions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

export type FilterSortField =
  | {
      type: 'switch'
      key: string
      label: string
      value: boolean
    }
  | {
      type: 'select'
      key: string
      label: string
      value: string
      options: { value: string; label: string }[]
      placeholder?: string
      allValue?: string
      triggerClassName?: string
    }

export type SortOrderOption = { value: 'asc' | 'desc'; label: string }

export interface SortConfig {
  sortBy: string
  sortByOptions: { value: string; label: string }[]
  sortOrder: 'asc' | 'desc'
  sortOrderOptions: SortOrderOption[]
  sortByTriggerClassName?: string
  sortOrderTriggerClassName?: string
}

export interface ActiveChip {
  label: string
  onRemove: () => void
}

export interface FilterSortBarProps {
  filters: FilterSortField[]
  sort?: SortConfig
  onFilterChange: (updates: Record<string, string | boolean>) => void
  onClear: () => void
  hasActiveFilters: boolean
  activeChips?: ActiveChip[]
  className?: string
}

export function FilterSortBar({
  filters,
  sort,
  onFilterChange,
  onClear,
  hasActiveFilters,
  activeChips = [],
  className,
}: FilterSortBarProps) {
  return (
    <div className={className ?? 'space-y-4 border-b border-border pb-4'}>
      <div className='flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end'>
        <div className='flex flex-wrap items-center gap-6'>
          {filters.map((field) => {
            if (field.type === 'switch') {
              const id = `filter-${field.key}`
              return (
                <div key={field.key} className='flex items-center gap-2'>
                  <Switch
                    id={id}
                    checked={field.value}
                    onCheckedChange={(checked) => onFilterChange({ [field.key]: checked })}
                  />
                  <Label htmlFor={id} className='text-sm text-muted-foreground cursor-pointer'>
                    {field.label}
                  </Label>
                </div>
              )
            }
            const allVal = field.allValue ?? 'All'
            return (
              <div key={field.key} className='flex items-center gap-2'>
                <Label className='text-sm text-muted-foreground shrink-0'>{field.label}</Label>
                <Select
                  itemToStringLabel={(v) => startCase(v as string)}
                  value={field.value || allVal}
                  onValueChange={(v) =>
                    onFilterChange({
                      [field.key]: v === allVal ? '' : (v ?? ''),
                    })
                  }>
                  <SelectTrigger className={(field.triggerClassName ?? 'w-[140px] h-9').trim()}>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={allVal}>
                      {field.placeholder ?? `All ${field.label}`}
                    </SelectItem>
                    {field.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )
          })}
          {sort && (
            <>
              <div className='flex items-center gap-2'>
                <Label className='text-sm text-muted-foreground shrink-0'>Sort by</Label>
                <Select
                  itemToStringLabel={(v) => startCase(v as string)}
                  value={sort.sortBy}
                  onValueChange={(v) => v != null && onFilterChange({ sortBy: v })}>
                  <SelectTrigger className={sort.sortByTriggerClassName ?? 'w-[160px] h-9'}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sort.sortByOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='flex items-center gap-2'>
                <Select
                  itemToStringLabel={(v) => startCase(v as string)}
                  value={sort.sortOrder}
                  onValueChange={(v) =>
                    (v === 'asc' || v === 'desc') && onFilterChange({ sortOrder: v })
                  }>
                  <SelectTrigger className={sort.sortOrderTriggerClassName ?? 'w-[100px] h-9'}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sort.sortOrderOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
        {hasActiveFilters && (
          <Button variant='ghost' size='sm' className='text-muted-foreground h-9' onClick={onClear}>
            Clear filters
          </Button>
        )}
      </div>
      {activeChips.length > 0 && (
        <div className='flex flex-wrap items-center gap-2'>
          {activeChips.map((chip) => (
            <Badge key={chip.label} variant='secondary' className='gap-1 pl-2 pr-1 py-1'>
              {chip.label}
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-5 w-5 rounded-full hover:bg-muted'
                onClick={chip.onRemove}>
                <IconX className='h-3 w-3' />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
