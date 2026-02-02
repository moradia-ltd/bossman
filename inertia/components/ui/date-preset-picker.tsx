'use client'

import { format, isValid, parse } from 'date-fns'
import { CalendarIcon, Check } from 'lucide-react'
import type * as React from 'react'
import { useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export type DatePreset = {
  label: string
  getRange: () => { start: Date; end: Date }
}

export interface DatePresetPickerProps {
  startDate: string
  endDate: string
  onRangeChange: (range: { startDate: string; endDate: string }) => void
  presets?: DatePreset[]
  placeholder?: string
  disabled?: boolean
  buttonClassName?: string
  buttonSize?: React.ComponentProps<typeof Button>['size']
}

function parseDate(value: string): Date | undefined {
  if (!value) return undefined
  const d = parse(value, 'yyyy-MM-dd', new Date())
  return isValid(d) ? d : undefined
}

function toYMD(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

function rangesEqual(
  a: { start: Date; end: Date },
  b: { start: Date; end: Date },
): boolean {
  return toYMD(a.start) === toYMD(b.start) && toYMD(a.end) === toYMD(b.end)
}

const DEFAULT_PRESETS: DatePreset[] = [
  { label: 'Last 7 days', getRange: () => ({ start: new Date(Date.now() - 6 * 864e5), end: new Date() }) },
  { label: 'Last 30 days', getRange: () => ({ start: new Date(Date.now() - 29 * 864e5), end: new Date() }) },
  {
    label: 'Last 3 months',
    getRange: () => {
      const end = new Date()
      const start = new Date(end)
      start.setMonth(start.getMonth() - 2)
      return { start, end }
    },
  },
  {
    label: 'Last 6 months',
    getRange: () => {
      const end = new Date()
      const start = new Date(end)
      start.setMonth(start.getMonth() - 5)
      return { start, end }
    },
  },
  {
    label: 'Last year',
    getRange: () => {
      const end = new Date()
      const start = new Date(end)
      start.setFullYear(start.getFullYear() - 1)
      return { start, end }
    },
  },
]

export function DatePresetPicker({
  startDate,
  endDate,
  onRangeChange,
  presets = DEFAULT_PRESETS,
  placeholder = 'Select date range',
  disabled,
  buttonClassName,
  buttonSize = 'default',
}: DatePresetPickerProps) {
  const [open, setOpen] = useState(false)
  const from = parseDate(startDate)
  const to = parseDate(endDate)

  const rangeForCalendar = useMemo(() => {
    if (!from) return undefined
    return { from, to: to ?? from }
  }, [from, to])

  const activePresetLabel = useMemo(() => {
    if (!from || !to) return null
    const current = { start: from, end: to }
    for (const preset of presets) {
      const p = preset.getRange()
      if (rangesEqual(current, p)) return preset.label
    }
    return null
  }, [from, to, presets])

  const isPresetActive = useCallback(
    (preset: DatePreset) => {
      if (!from || !to) return false
      return rangesEqual({ start: from, end: to }, preset.getRange())
    },
    [from, to],
  )

  const buttonLabel = useMemo(() => {
    if (activePresetLabel) return activePresetLabel
    if (from && to) return `${format(from, 'd MMM yyyy')} – ${format(to, 'd MMM yyyy')}`
    return placeholder
  }, [activePresetLabel, from, to, placeholder])

  const handlePreset = useCallback(
    (preset: DatePreset) => {
      const { start, end } = preset.getRange()
      onRangeChange({ startDate: toYMD(start), endDate: toYMD(end) })
      setOpen(false)
    },
    [onRangeChange],
  )

  const handleCalendarSelect = useCallback(
    (range: { from?: Date; to?: Date } | undefined) => {
      if (!range?.from) return
      const start = range.from
      const end = range.to ?? range.from
      onRangeChange({ startDate: toYMD(start), endDate: toYMD(end) })
      if (range.to) setOpen(false)
    },
    [onRangeChange],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger >
        <Button
          type='button'
          variant='outline'
          size={buttonSize}
          disabled={disabled}
          className={cn(
            'justify-start text-left font-normal',
            (!from || !to) && 'text-muted-foreground',
            buttonClassName,
          )}
          leftIcon={<CalendarIcon className='h-4 w-4' />}
        >
          {buttonLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <div className='flex flex-col sm:flex-row'>
          <div className='border-b border-border p-3 sm:border-b-0 sm:border-r'>
            <p className='text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider'>
              Presets
            </p>
            <div className='flex flex-col gap-1'>
              {presets.map((preset) => {
                const active = isPresetActive(preset)
                return (
                  <Button
                    key={preset.label}
                    type='button'
                    variant={active ? 'secondary' : 'ghost'}
                    size='sm'
                    className={cn(
                      'justify-start font-normal h-8',
                      active && 'bg-primary/60 font-medium ring-1 ring-primary/30',
                    )}
                    leftIcon={active ? <Check className='h-3.5 w-3.5' /> : undefined}
                    onClick={() => handlePreset(preset)}
                  >
                    {preset.label}
                  </Button>
                )
              })}
            </div>
          </div>
          <div className='p-3'>
            <p className='text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider'>
              Custom range
            </p>
            <Calendar
              mode='range'
              selected={rangeForCalendar}
              onSelect={handleCalendarSelect}
              defaultMonth={from ?? new Date()}
              numberOfMonths={2}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
