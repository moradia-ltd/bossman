import * as React from 'react'

import { cn } from '@/lib/utils'

export interface SimpleGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: number | { base?: number; sm?: number; md?: number; lg?: number; xl?: number }
  spacing?: number | string
  minChildWidth?: string
}

// Full class names as literals so Tailwind's content scanner includes them (dynamic strings like `lg:${x}` are not detected)
const GRID_COLS_CLASSES: Record<string, string> = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-2',
  '3': 'grid-cols-3',
  '4': 'grid-cols-4',
  '5': 'grid-cols-5',
  '6': 'grid-cols-6',
  '7': 'grid-cols-7',
  '8': 'grid-cols-8',
  '9': 'grid-cols-9',
  '10': 'grid-cols-10',
  '11': 'grid-cols-11',
  '12': 'grid-cols-12',
  'sm-1': 'sm:grid-cols-1',
  'sm-2': 'sm:grid-cols-2',
  'sm-3': 'sm:grid-cols-3',
  'sm-4': 'sm:grid-cols-4',
  'md-1': 'md:grid-cols-1',
  'md-2': 'md:grid-cols-2',
  'md-3': 'md:grid-cols-3',
  'md-4': 'md:grid-cols-4',
  'lg-1': 'lg:grid-cols-1',
  'lg-2': 'lg:grid-cols-2',
  'lg-3': 'lg:grid-cols-3',
  'lg-4': 'lg:grid-cols-4',
  'xl-1': 'xl:grid-cols-1',
  'xl-2': 'xl:grid-cols-2',
  'xl-3': 'xl:grid-cols-3',
  'xl-4': 'xl:grid-cols-4',
}

const getGridColsClass = (
  cols: number | { base?: number; sm?: number; md?: number; lg?: number; xl?: number },
): string => {
  if (typeof cols === 'number') {
    return GRID_COLS_CLASSES[String(cols)] ?? ''
  }

  const classes: string[] = []
  if (cols.base) classes.push(GRID_COLS_CLASSES[String(cols.base)] ?? '')
  if (cols.sm) classes.push(GRID_COLS_CLASSES[`sm-${cols.sm}`] ?? '')
  if (cols.md) classes.push(GRID_COLS_CLASSES[`md-${cols.md}`] ?? '')
  if (cols.lg) classes.push(GRID_COLS_CLASSES[`lg-${cols.lg}`] ?? '')
  if (cols.xl) classes.push(GRID_COLS_CLASSES[`xl-${cols.xl}`] ?? '')

  return classes.filter(Boolean).join(' ')
}

export const SimpleGrid = React.forwardRef<HTMLDivElement, SimpleGridProps>(
  ({ className, cols = 1, spacing = 4, minChildWidth, children, ...props }, ref) => {
    const spacingValue = typeof spacing === 'number' ? `${spacing * 0.25}rem` : spacing

    const gridColsClass = React.useMemo(() => getGridColsClass(cols), [cols])

    const style = React.useMemo(() => {
      const baseStyle: React.CSSProperties = { gap: spacingValue, ...props.style }

      if (minChildWidth) {
        baseStyle.gridTemplateColumns = `repeat(auto-fit, minmax(${minChildWidth}, 1fr))`
      } else if (typeof cols === 'number' && !(cols >= 1 && cols <= 12)) {
        baseStyle.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`
      } else if (typeof cols === 'object') {
        const baseCols = cols.base ?? 1
        if (baseCols < 1 || baseCols > 12) {
          baseStyle.gridTemplateColumns = `repeat(${baseCols}, minmax(0, 1fr))`
        }
      }

      return baseStyle
    }, [spacingValue, minChildWidth, cols, gridColsClass, props.style])

    return (
      <div
        ref={ref}
        className={cn('grid', gridColsClass || 'grid-cols-1', className)}
        style={style}
        {...props}>
        {children}
      </div>
    )
  },
)

SimpleGrid.displayName = 'SimpleGrid'
