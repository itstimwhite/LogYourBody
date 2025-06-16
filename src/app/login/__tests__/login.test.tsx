import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '../page'
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

describe('LoginPage', () => {
  const mockSignIn = jest.fn()
  const mockSignInWithProvider = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signIn: mockSignIn,
      signUp: jest.fn(),
      signOut: jest.fn(),
      signInWithProvider: mockSignInWithProvider,
    })
  })

  it('should render login form', () => {
    render(<LoginPage />)

    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to continue your fitness journey')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument()
  })

  it('should have link to sign up page', () => {
    render(<LoginPage />)

    const signUpLink = screen.getByRole('link', { name: 'Sign up' })
    expect(signUpLink).toBeInTheDocument()
    expect(signUpLink).toHaveAttribute('href', '/signup')
  })

  it('should have link to forgot password page', () => {
    render(<LoginPage />)

    const forgotPasswordLink = screen.getByRole('link', { name: 'Forgot?' })
    expect(forgotPasswordLink).toBeInTheDocument()
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password')
  })

  it('should handle successful sign in', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ error: null })

    render(<LoginPage />)

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /Sign in/i }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should display error on failed sign in', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ error: new Error('Invalid credentials') })

    render(<LoginPage />)

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /Sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('should handle OAuth sign in with Google', async () => {
    const user = userEvent.setup()
    mockSignInWithProvider.mockResolvedValue({ error: null })

    render(<LoginPage />)

    await user.click(screen.getByRole('button', { name: /Google/i }))

    await waitFor(() => {
      expect(mockSignInWithProvider).toHaveBeenCalledWith('google')
    })
  })

  it('should handle OAuth sign in with Apple', async () => {
    const user = userEvent.setup()
    mockSignInWithProvider.mockResolvedValue({ error: null })

    render(<LoginPage />)

    await user.click(screen.getByRole('button', { name: /Apple/i }))

    await waitFor(() => {
      expect(mockSignInWithProvider).toHaveBeenCalledWith('apple')
    })
  })

  it('should display loading state during sign in', async () => {
    const user = userEvent.setup()
    mockSignIn.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<LoginPage />)

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /Sign in/i }))

    expect(screen.getByText('Signing in...')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeDisabled()
    expect(screen.getByLabelText('Password')).toBeDisabled()
  })

  it('should handle OAuth error', async () => {
    const user = userEvent.setup()
    mockSignInWithProvider.mockResolvedValue({ error: new Error('OAuth error') })

    render(<LoginPage />)

    await user.click(screen.getByRole('button', { name: /Google/i }))

    await waitFor(() => {
      expect(screen.getByText('OAuth error')).toBeInTheDocument()
    })
  })
})