import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { HeightWheelPicker, DateWheelPicker } from '../wheel-picker'

describe('HeightWheelPicker', () => {
  it('renders metric height picker', () => {
    const mockOnChange = jest.fn()
    render(
      <HeightWheelPicker
        heightInCm={180}
        units="metric"
        onHeightChange={mockOnChange}
      />
    )
    
    // Should show cm picker
    expect(screen.getByText('cm')).toBeInTheDocument()
  })

  it('renders imperial height picker', () => {
    const mockOnChange = jest.fn()
    render(
      <HeightWheelPicker
        heightInCm={180}
        units="imperial"
        onHeightChange={mockOnChange}
      />
    )
    
    // Should show feet and inches pickers
    expect(screen.getByText('ft')).toBeInTheDocument()
    expect(screen.getByText('in')).toBeInTheDocument()
  })

  it('converts height correctly between units', () => {
    const mockOnChange = jest.fn()
    const { rerender } = render(
      <HeightWheelPicker
        heightInCm={180}
        units="metric"
        onHeightChange={mockOnChange}
      />
    )
    
    // 180cm should be approximately 5'11"
    rerender(
      <HeightWheelPicker
        heightInCm={180}
        units="imperial"
        onHeightChange={mockOnChange}
      />
    )
    
    // Check if the conversion is displayed correctly
    // 180cm = 70.87 inches ≈ 5'11"
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})

describe('DateWheelPicker', () => {
  it('renders date picker with correct values', () => {
    const mockOnChange = jest.fn()
    const testDate = new Date(1990, 0, 15) // Jan 15, 1990
    
    render(
      <DateWheelPicker
        date={testDate}
        onDateChange={mockOnChange}
      />
    )
    
    // Should show month, day, and year pickers
    expect(screen.getByText('Jan')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('1990')).toBeInTheDocument()
  })

  it('limits year selection appropriately', () => {
    const mockOnChange = jest.fn()
    const currentYear = new Date().getFullYear()
    const testDate = new Date(2000, 0, 1)
    
    render(
      <DateWheelPicker
        date={testDate}
        onDateChange={mockOnChange}
        minYear={currentYear - 100}
        maxYear={currentYear - 13}
      />
    )
    
    // Should not allow future years or years less than 13 years ago
    const yearOptions = screen.getAllByRole('option', { hidden: true })
    const years = yearOptions.map(option => option.textContent).filter(text => text && /^\d{4}$/.test(text))
    
    years.forEach(year => {
      const yearNum = parseInt(year!)
      expect(yearNum).toBeGreaterThanOrEqual(currentYear - 100)
      expect(yearNum).toBeLessThanOrEqual(currentYear - 13)
    })
  })
})