import { useId } from 'react'
import { cn } from '@/lib/utils'

interface LogoFullProps {
  className?: string
  /** Height in Tailwind units (e.g. h-7). Text color is controlled by parent via className (e.g. text-white in dark). */
  heightClass?: string
}

/**
 * Inline full logo (mark + "togetha." wordmark). The wordmark uses currentColor
 * so parent can set text color (e.g. text-white in dark mode) without touching the logo asset.
 */
export function LogoFull({ className, heightClass = 'h-7' }: LogoFullProps) {
  const gradientId = useId()
  return (
    <span className={cn('inline-block shrink-0', className)} aria-hidden>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 220 52'
        fill='none'
        className={cn('block object-contain object-left', heightClass)}
        role='img'
        aria-label='Togetha logo'>
        <defs>
          <linearGradient id={gradientId} x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stopColor='#2e9590' />
            <stop offset='100%' stopColor='#00867f' />
          </linearGradient>
        </defs>
        {/* Primary mark - unchanged */}
        <rect x='0' y='0' width='52' height='52' rx='13' ry='13' fill={`url(#${gradientId})`} />
        <polyline
          points='8,38 20,18 33,38'
          stroke='white'
          strokeWidth='3'
          strokeLinecap='round'
          strokeLinejoin='round'
          opacity='0.38'
        />
        <polyline
          points='19,38 32,16 44,38'
          stroke='white'
          strokeWidth='3'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <circle cx='32' cy='16' r='3.5' fill='white' />
        <circle cx='32' cy='16' r='6' fill='none' stroke='white' strokeWidth='1.5' opacity='0.28' />
        <line x1='6' y1='43' x2='46' y2='43' stroke='white' strokeWidth='2.5' strokeLinecap='round' opacity='0.18' />
        <rect x='27' y='31' width='9' height='12' rx='2' fill='white' fillOpacity='0.9' />
        {/* Wordmark: currentColor so parent controls text color (e.g. white in dark mode) */}
        <text
          x='60'
          y='36'
          fontFamily='system-ui, -apple-system, sans-serif'
          fontWeight='800'
          fontSize='22'
          letterSpacing='-0.04em'
          fill='currentColor'>
          togetha<tspan fill='currentColor'>.</tspan>
        </text>
      </svg>
    </span>
  )
}
