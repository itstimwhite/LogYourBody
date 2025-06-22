import { format } from 'date-fns'

/**
 * Formats a date string to avoid timezone issues
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Date object set at noon to avoid timezone shifts
 */
export function parseDateString(dateString: string): Date {
  // Add noon time to avoid timezone shifts when parsing
  return new Date(dateString + 'T12:00:00')
}

/**
 * Formats a date for database storage
 * @param date - Date object or string
 * @returns YYYY-MM-DD formatted string
 */
export function formatDateForDB(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseDateString(date) : date
  return format(dateObj, 'yyyy-MM-dd')
}

/**
 * Formats a date for display
 * @param dateString - Date in YYYY-MM-DD format
 * @param formatStr - date-fns format string
 * @returns Formatted date string
 */
export function formatDateForDisplay(dateString: string, formatStr: string = 'MMMM d, yyyy'): string {
  return format(parseDateString(dateString), formatStr)
}