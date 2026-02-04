import { DateTime, Interval } from 'luxon'

type InitialPeriod =
  | 'this week'
  | 'this month'
  | 'next week'
  | 'next month'
  | 'last month'
  | 'this year'

const now = DateTime.local().setLocale('en-GB')
const startOfMonth = now.startOf('month')
const endOfMonth = now.endOf('month')

function formatDate(date: DateTime | string | Date, isLong = false): string {
  const formatIsLong = isLong ? DateTime.DATETIME_MED_WITH_WEEKDAY : DateTime.DATE_MED_WITH_WEEKDAY
  if (typeof date === 'string') return DateTime.fromISO(date).toLocaleString(formatIsLong)
  if (date instanceof Date) return DateTime.fromJSDate(date).toLocaleString(formatIsLong)

  return date.toLocaleString(formatIsLong)
}

export function timeRemaining(start_date: string | Date, end_date: string | Date): string {
  if (!start_date || !end_date) return 'Not set'

  const startDateTime = DateTime.fromJSDate(new Date(start_date)).startOf('day')
  const endDateTime = DateTime.fromJSDate(new Date(end_date)).endOf('day')

  const interval = Interval.fromDateTimes(startDateTime, endDateTime)
  const duration = interval.toDuration(['years', 'months', 'days'])

  return duration.toHuman({ unitDisplay: 'long' })
}

/**
 * Normalize date strings that use a space instead of T, or shorthand offset (+00 vs +00:00).
 * e.g. "2026-02-03 11:32:08.294728+00" -> "2026-02-03T11:32:08.294728+00:00"
 */
function normalizeDateString(s: string): string {
  let normalized = s.trim()
  if (/^\d{4}-\d{2}-\d{2} \d/.test(normalized)) {
    normalized = normalized.replace(' ', 'T')
  }
  const tzMatch = normalized.match(/([+-])(\d{2})(?::(\d{2}))?$/)
  if (tzMatch && tzMatch[2] !== undefined && tzMatch[3] === undefined) {
    normalized = normalized.replace(/([+-])(\d{2})$/, '$1$2:00')
  }
  return normalized
}

export function timeAgo(date: DateTime | string | Date | null | undefined): string {
  if (date === null || date === undefined) return '—'
  if (typeof date === 'string') {
    const normalized = normalizeDateString(date)
    const dt = DateTime.fromISO(normalized, { setZone: true })
    return dt.isValid ? (dt.toRelative() ?? '—') : '—'
  }
  if (date instanceof Date) {
    const dt = DateTime.fromJSDate(date)
    return dt.isValid ? (dt.toRelative() ?? '—') : '—'
  }
  return date.isValid ? (date.toRelative() ?? '—') : '—'
}

export function hasDateExpired(date: DateTime): boolean {
  if (now.toMillis() > date.toMillis()) return true
  return false
}

function getDaysDueText(daysDue: number): string {
  if (daysDue === 0) return 'today'
  if (daysDue === 1) return 'tomorrow'
  if (daysDue === 7) return 'in a week'
  return `in ${daysDue} days`
}

function getInitialDateFromPeriod(initial: InitialPeriod): Interval {
  switch (initial) {
    case 'this week':
      return Interval.fromDateTimes(now.startOf('week'), now.endOf('week'))
    case 'this month':
      return Interval.fromDateTimes(now.startOf('month'), now.endOf('month'))
    case 'next week':
      return Interval.fromDateTimes(
        now.plus({ weeks: 1 }).startOf('week'),
        now.plus({ weeks: 1 }).endOf('week'),
      )
    case 'next month':
      return Interval.fromDateTimes(
        now.plus({ months: 1 }).startOf('month'),
        now.plus({ months: 1 }).endOf('month'),
      )
    case 'last month':
      return Interval.fromDateTimes(
        now.minus({ months: 1 }).startOf('month'),
        now.minus({ months: 1 }).endOf('month'),
      )
    case 'this year':
      return Interval.fromDateTimes(now.startOf('year'), now.endOf('year'))
    default:
      throw new Error('Invalid initial period provided')
  }
}

const DateService = {
  timeRemaining,
  now,
  hasDateExpired,
  getDaysDueText,
  startOfMonth,
  endOfMonth,
  getInitialDateFromPeriod,
  formatDate,
  timeAgo,
}

export default DateService
