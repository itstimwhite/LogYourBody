import { parseDateString, formatDateForDB, formatDateForDisplay } from '../date-utils'

describe('Date Utilities', () => {
  describe('parseDateString', () => {
    it('should parse date string and return Date at noon', () => {
      const date = parseDateString('2024-01-15')
      
      expect(date.getFullYear()).toBe(2024)
      expect(date.getMonth()).toBe(0) // January is 0
      expect(date.getDate()).toBe(15)
      expect(date.getHours()).toBe(12) // Noon
      expect(date.getMinutes()).toBe(0)
      expect(date.getSeconds()).toBe(0)
    })

    it('should handle different date formats', () => {
      const date1 = parseDateString('2024-12-31')
      expect(date1.getFullYear()).toBe(2024)
      expect(date1.getMonth()).toBe(11) // December
      expect(date1.getDate()).toBe(31)

      const date2 = parseDateString('2024-01-01')
      expect(date2.getFullYear()).toBe(2024)
      expect(date2.getMonth()).toBe(0)
      expect(date2.getDate()).toBe(1)
    })

    it('should handle leap year dates', () => {
      const date = parseDateString('2024-02-29')
      expect(date.getFullYear()).toBe(2024)
      expect(date.getMonth()).toBe(1) // February
      expect(date.getDate()).toBe(29)
    })
  })

  describe('formatDateForDB', () => {
    it('should format Date object to YYYY-MM-DD', () => {
      const date = new Date(2024, 0, 15) // January 15, 2024
      const formatted = formatDateForDB(date)
      
      expect(formatted).toBe('2024-01-15')
    })

    it('should format date string to YYYY-MM-DD', () => {
      const formatted = formatDateForDB('2024-03-20')
      
      expect(formatted).toBe('2024-03-20')
    })

    it('should handle single digit months and days', () => {
      const date = new Date(2024, 8, 5) // September 5, 2024
      const formatted = formatDateForDB(date)
      
      expect(formatted).toBe('2024-09-05')
    })

    it('should preserve timezone by using noon time', () => {
      // This test ensures that dates don't shift due to timezone
      const originalDateString = '2024-01-15'
      const formatted = formatDateForDB(originalDateString)
      
      expect(formatted).toBe('2024-01-15')
    })
  })

  describe('formatDateForDisplay', () => {
    it('should format date string for display with default format', () => {
      const formatted = formatDateForDisplay('2024-01-15')
      
      expect(formatted).toBe('January 15, 2024')
    })

    it('should accept custom format string', () => {
      const formatted = formatDateForDisplay('2024-01-15', 'MM/dd/yyyy')
      
      expect(formatted).toBe('01/15/2024')
    })

    it('should handle different months correctly', () => {
      expect(formatDateForDisplay('2024-12-25')).toBe('December 25, 2024')
      expect(formatDateForDisplay('2024-07-04')).toBe('July 4, 2024')
      expect(formatDateForDisplay('2024-02-29')).toBe('February 29, 2024')
    })

    it('should support various format patterns', () => {
      const date = '2024-03-15'
      
      expect(formatDateForDisplay(date, 'yyyy-MM-dd')).toBe('2024-03-15')
      expect(formatDateForDisplay(date, 'dd/MM/yyyy')).toBe('15/03/2024')
      expect(formatDateForDisplay(date, 'MMM d, yyyy')).toBe('Mar 15, 2024')
      expect(formatDateForDisplay(date, 'EEEE, MMMM d, yyyy')).toMatch(/Friday, March 15, 2024/)
    })
  })

  describe('Timezone Safety', () => {
    it('should handle dates consistently regardless of local timezone', () => {
      const testDates = [
        '2024-01-01', // New Year
        '2024-06-15', // Mid-year
        '2024-12-31', // New Year's Eve
      ]

      testDates.forEach(dateString => {
        const parsed = parseDateString(dateString)
        const formatted = formatDateForDB(parsed)
        
        expect(formatted).toBe(dateString)
      })
    })

    it('should prevent date shifting when formatting', () => {
      // Test edge cases that might shift dates
      const edgeCases = [
        { input: '2024-01-01', expected: 'January 1, 2024' },
        { input: '2024-12-31', expected: 'December 31, 2024' },
        { input: '2024-03-31', expected: 'March 31, 2024' },
        { input: '2024-02-29', expected: 'February 29, 2024' }, // Leap year
      ]

      edgeCases.forEach(({ input, expected }) => {
        const formatted = formatDateForDisplay(input)
        expect(formatted).toBe(expected)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid date strings gracefully', () => {
      // Test with invalid date
      const invalidDate = parseDateString('invalid-date')
      expect(invalidDate.toString()).toContain('Invalid Date')
    })

    it('should handle empty strings', () => {
      const emptyDate = parseDateString('')
      expect(emptyDate.toString()).toContain('Invalid Date')
    })
  })
})