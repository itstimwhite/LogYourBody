import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignupPage from '../page'
import { useAuth } from '@/contexts/ClerkAuthContext'

// Mock the auth context
jest.mock('@/contexts/ClerkAuthContext')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Mock the router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('SignupPage', () => {
  const mockSignUp = jest.fn()
  const mockSignInWithProvider = jest.fn()
  const mockSignIn = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signIn: mockSignIn,
      signUp: mockSignUp,
      signOut: jest.fn(),
      signInWithProvider: mockSignInWithProvider,
    })
  })

  it('should render signup form', () => {
    render(<SignupPage />)

    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByText('Start tracking your fitness journey today')).toBeInTheDocument()
    // Check for tabs
    expect(screen.getByRole('tab', { name: 'Email' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'SMS' })).toBeInTheDocument()
    // Email tab should be active by default
    expect(screen.getByRole('tab', { name: 'Email' })).toHaveAttribute('data-state', 'active')
    // Check form elements within email tab
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create account/i })).toBeInTheDocument()
  })

  it('should have link to login page', () => {
    render(<SignupPage />)

    const signInLink = screen.getByRole('link', { name: 'Sign in' })
    expect(signInLink).toBeInTheDocument()
    expect(signInLink).toHaveAttribute('href', '/login')
  })

  it('should handle successful sign up', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({ error: null })
    mockSignIn.mockResolvedValue({ error: null })

    render(<SignupPage />)

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'newuser@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /Create account/i }))

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('newuser@example.com', 'password123')
      expect(mockSignIn).toHaveBeenCalledWith('newuser@example.com', 'password123')
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should display error on failed sign up', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({ error: new Error('Email already in use') })

    render(<SignupPage />)

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'existing@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /Create account/i }))

    await waitFor(() => {
      expect(screen.getByText('Email already in use')).toBeInTheDocument()
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('should validate password length', async () => {
    const user = userEvent.setup()

    render(<SignupPage />)

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), '12345')
    await user.click(screen.getByRole('button', { name: /Create account/i }))

    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('should handle OAuth sign up with Google', async () => {
    const user = userEvent.setup()
    mockSignInWithProvider.mockResolvedValue({ error: null })

    render(<SignupPage />)

    await user.click(screen.getByRole('button', { name: /Google/i }))

    await waitFor(() => {
      expect(mockSignInWithProvider).toHaveBeenCalledWith('google')
    })
  })

  it('should handle OAuth sign up with Apple', async () => {
    const user = userEvent.setup()
    mockSignInWithProvider.mockResolvedValue({ error: null })

    render(<SignupPage />)

    await user.click(screen.getByRole('button', { name: /Apple/i }))

    await waitFor(() => {
      expect(mockSignInWithProvider).toHaveBeenCalledWith('apple')
    })
  })

  it('should display loading state during sign up', async () => {
    const user = userEvent.setup()
    mockSignUp.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<SignupPage />)

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /Create account/i }))

    expect(screen.getByText('Creating account...')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /email/i })).toBeDisabled()
    expect(screen.getByLabelText('Password')).toBeDisabled()
  })

  it('should handle OAuth error', async () => {
    const user = userEvent.setup()
    mockSignInWithProvider.mockResolvedValue({ error: new Error('OAuth error') })

    render(<SignupPage />)

    await user.click(screen.getByRole('button', { name: /Google/i }))

    await waitFor(() => {
      expect(screen.getByText('OAuth error')).toBeInTheDocument()
    })
  })

  it('should clear form after successful signup', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({ error: null })
    mockSignIn.mockResolvedValue({ error: null })

    render(<SignupPage />)

    const emailInput = screen.getByRole('textbox', { name: /email/i }) as HTMLInputElement
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement

    await user.type(emailInput, 'newuser@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(screen.getByRole('button', { name: /Create account/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})