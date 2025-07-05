import React from 'react'
import { render, screen } from '@testing-library/react'
import { VersionDisplay } from '../VersionDisplay'

describe('VersionDisplay', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should display version from NEXT_PUBLIC_VERSION', () => {
    process.env.NEXT_PUBLIC_VERSION = '2.1.0'
    
    render(<VersionDisplay />)
    
    expect(screen.getByText('v2.1.0')).toBeInTheDocument()
  })

  it('should fallback to NEXT_PUBLIC_APP_VERSION', () => {
    delete process.env.NEXT_PUBLIC_VERSION
    process.env.NEXT_PUBLIC_APP_VERSION = '3.0.0'
    
    render(<VersionDisplay />)
    
    expect(screen.getByText('v3.0.0')).toBeInTheDocument()
  })

  it('should use default version when no env vars are set', () => {
    delete process.env.NEXT_PUBLIC_VERSION
    delete process.env.NEXT_PUBLIC_APP_VERSION
    
    render(<VersionDisplay />)
    
    expect(screen.getByText('v1.0.0')).toBeInTheDocument()
  })

  it('should render as a badge with correct styling', () => {
    render(<VersionDisplay />)
    
    const badge = screen.getByText(/^v\d+\.\d+\.\d+$/)
    expect(badge).toHaveClass('text-xs', 'opacity-50', 'border-linear-border', 'text-linear-text-tertiary')
  })

  it('should accept custom className', () => {
    render(<VersionDisplay className="custom-class" />)
    
    const badge = screen.getByText(/^v\d+\.\d+\.\d+$/)
    expect(badge).toHaveClass('custom-class')
  })

  it('should be memoized for performance', () => {
    const { rerender } = render(<VersionDisplay />)
    const firstRender = screen.getByText(/^v\d+\.\d+\.\d+$/)
    
    rerender(<VersionDisplay />)
    const secondRender = screen.getByText(/^v\d+\.\d+\.\d+$/)
    
    expect(firstRender).toBe(secondRender)
  })
})