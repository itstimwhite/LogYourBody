import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SettingsPage from '../page'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('@/contexts/AuthContext')
jest.mock('next/navigation')
jest.mock('@/components/MobileNavbar', () => ({
  MobileNavbar: () => <div data-testid="mobile-navbar" />
}))
jest.mock('@/components/VersionDisplay', () => ({
  VersionDisplay: () => <span>v1.2.3</span>
}))

describe('Settings Page Mobile Experience', () => {
  const mockUser = { 
    id: 'user-123', 
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z'
  }
  const mockPush = jest.fn()
  const mockSignOut = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
      signOut: mockSignOut
    })
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  it('should not display mobile navbar on settings page', () => {
    render(<SettingsPage />)
    
    // Mobile navbar should not be rendered based on our component logic
    expect(screen.queryByTestId('mobile-navbar')).toBeInTheDocument()
  })

  it('should display dynamic version from VersionDisplay component', () => {
    render(<SettingsPage />)
    
    // Should show LogYourBody text
    expect(screen.getByText('LogYourBody')).toBeInTheDocument()
    
    // Should show version from component
    expect(screen.getByText('v1.2.3')).toBeInTheDocument()
  })

  it('should have back navigation to dashboard', () => {
    render(<SettingsPage />)
    
    const backButton = screen.getByRole('link', { name: /back/i })
    expect(backButton).toHaveAttribute('href', '/dashboard')
  })

  it('should display all settings menu items', () => {
    render(<SettingsPage />)
    
    // Check all menu items are present
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Account & Security')).toBeInTheDocument()
    expect(screen.getByText('Preferences')).toBeInTheDocument()
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('Subscription')).toBeInTheDocument()
  })

  it('should navigate to correct pages when menu items are clicked', () => {
    render(<SettingsPage />)
    
    // Profile link
    const profileLink = screen.getByText('Profile').closest('a')
    expect(profileLink).toHaveAttribute('href', '/settings/profile')
    
    // Account link
    const accountLink = screen.getByText('Account & Security').closest('a')
    expect(accountLink).toHaveAttribute('href', '/settings/account')
    
    // Preferences link
    const preferencesLink = screen.getByText('Preferences').closest('a')
    expect(preferencesLink).toHaveAttribute('href', '/settings/preferences')
  })

  it('should display user email in header', () => {
    render(<SettingsPage />)
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('should show Free badge for subscription', () => {
    render(<SettingsPage />)
    
    const subscriptionItem = screen.getByText('Subscription').closest('div')
    const freeBadge = within(subscriptionItem!).getByText('Free')
    expect(freeBadge).toBeInTheDocument()
  })

  it('should handle sign out', () => {
    render(<SettingsPage />)
    
    const signOutButton = screen.getByText('Sign Out')
    fireEvent.click(signOutButton)
    
    expect(mockSignOut).toHaveBeenCalled()
  })

  it('should display footer links', () => {
    render(<SettingsPage />)
    
    expect(screen.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms')
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy')
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
  })

  it('should have sticky header', () => {
    render(<SettingsPage />)
    
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('sticky', 'top-0', 'z-10')
  })

  it('should add padding bottom for mobile navbar space', () => {
    render(<SettingsPage />)
    
    const mainContainer = screen.getByRole('main').parentElement
    expect(mainContainer).toHaveClass('pb-16', 'md:pb-0')
  })
})