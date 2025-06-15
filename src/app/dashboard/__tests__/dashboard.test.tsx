import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DashboardPage from '../page'
import { useAuth } from '@/contexts/AuthContext'

// Mock the auth context
jest.mock('@/contexts/AuthContext')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Mock the router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('DashboardPage', () => {
  const mockSignOut = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should redirect to login when not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      signInWithProvider: jest.fn(),
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('should show loading state while checking auth', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: true,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      signInWithProvider: jest.fn(),
    })

    render(<DashboardPage />)

    expect(screen.getByRole('status')).toBeInTheDocument() // Loading spinner
  })

  it('should display dashboard content when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '123', email: 'test@example.com' } as any,
      session: { access_token: 'token' } as any,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      signInWithProvider: jest.fn(),
    })

    render(<DashboardPage />)

    // Header
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument()

    // Stats cards
    expect(screen.getByText('Total Workouts')).toBeInTheDocument()
    expect(screen.getByText('Current Weight')).toBeInTheDocument()
    expect(screen.getByText('This Week')).toBeInTheDocument()
    expect(screen.getByText('Progress')).toBeInTheDocument()

    // Welcome message
    expect(screen.getByText('Welcome to LogYourBody!')).toBeInTheDocument()
    expect(screen.getByText(/successfully logged in/)).toBeInTheDocument()
  })

  it('should handle sign out', async () => {
    const user = userEvent.setup()
    mockUseAuth.mockReturnValue({
      user: { id: '123', email: 'test@example.com' } as any,
      session: { access_token: 'token' } as any,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      signInWithProvider: jest.fn(),
    })

    render(<DashboardPage />)

    await user.click(screen.getByRole('button', { name: 'Sign Out' }))

    expect(mockSignOut).toHaveBeenCalled()
  })

  it('should display placeholder data for stats', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '123', email: 'test@example.com' } as any,
      session: { access_token: 'token' } as any,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      signInWithProvider: jest.fn(),
    })

    render(<DashboardPage />)

    // Check for placeholder values
    expect(screen.getAllByText('0').length).toBeGreaterThan(0)
    expect(screen.getAllByText('--').length).toBeGreaterThan(0)
    expect(screen.getByText('Start logging your workouts')).toBeInTheDocument()
    expect(screen.getByText('No data yet')).toBeInTheDocument()
  })

  it('should list upcoming features', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '123', email: 'test@example.com' } as any,
      session: { access_token: 'token' } as any,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      signInWithProvider: jest.fn(),
    })

    render(<DashboardPage />)

    const features = [
      'Daily weight tracking',
      'Body composition measurements',
      'Progress photos',
      'Workout logging',
      'Nutrition tracking',
      'Progress analytics and trends',
    ]

    features.forEach(feature => {
      expect(screen.getByText(feature)).toBeInTheDocument()
    })
  })

  it('should render Start Logging button', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '123', email: 'test@example.com' } as any,
      session: { access_token: 'token' } as any,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      signInWithProvider: jest.fn(),
    })

    render(<DashboardPage />)

    expect(screen.getByRole('button', { name: 'Start Logging' })).toBeInTheDocument()
  })
})