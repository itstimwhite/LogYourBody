import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignupPage from '../page'
import { useAuth } from '@/contexts/AuthContext'

// Mock the auth context
jest.mock('@/contexts/AuthContext')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('SignupPage', () => {
  const mockSignUp = jest.fn()
  const mockSignInWithProvider = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signIn: jest.fn(),
      signUp: mockSignUp,
      signOut: jest.fn(),
      signInWithProvider: mockSignInWithProvider,
    })
  })

  it('should render signup form', () => {
    render(<SignupPage />)

    expect(screen.getByText('Create an account')).toBeInTheDocument()
    expect(screen.getByText('Enter your information to get started with LogYourBody')).toBeInTheDocument()
    expect(screen.getByLabelText('Full Name (Optional)')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument()
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

    render(<SignupPage />)

    await user.type(screen.getByLabelText('Email'), 'newuser@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Create Account' }))

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('newuser@example.com', 'password123')
      expect(screen.getByText('Check your email for the confirmation link!')).toBeInTheDocument()
    })
  })

  it('should display error when passwords do not match', async () => {
    const user = userEvent.setup()

    render(<SignupPage />)

    await user.type(screen.getByLabelText('Email'), 'newuser@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password'), 'password456')
    await user.click(screen.getByRole('button', { name: 'Create Account' }))

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      expect(mockSignUp).not.toHaveBeenCalled()
    })
  })

  it('should display error when password is too short', async () => {
    const user = userEvent.setup()

    render(<SignupPage />)

    await user.type(screen.getByLabelText('Email'), 'newuser@example.com')
    await user.type(screen.getByLabelText('Password'), 'pass')
    await user.type(screen.getByLabelText('Confirm Password'), 'pass')
    await user.click(screen.getByRole('button', { name: 'Create Account' }))

    await waitFor(() => {
      // Use getAllByText since the message appears in multiple places
      const errorMessages = screen.getAllByText('Password must be at least 6 characters')
      expect(errorMessages.length).toBeGreaterThan(0)
      expect(mockSignUp).not.toHaveBeenCalled()
    })
  })

  it('should display error on failed sign up', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({ error: new Error('Email already exists') })

    render(<SignupPage />)

    await user.type(screen.getByLabelText('Email'), 'existing@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Create Account' }))

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })
  })

  it('should handle OAuth sign in with Google', async () => {
    const user = userEvent.setup()
    mockSignInWithProvider.mockResolvedValue({ error: null })

    render(<SignupPage />)

    await user.click(screen.getByRole('button', { name: /Google/i }))

    await waitFor(() => {
      expect(mockSignInWithProvider).toHaveBeenCalledWith('google')
    })
  })

  it('should handle OAuth sign in with Apple', async () => {
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

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Create Account' }))

    expect(screen.getByText('Creating account...')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeDisabled()
    expect(screen.getByLabelText('Password')).toBeDisabled()
  })

  it('should clear form after successful signup', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({ error: null })

    render(<SignupPage />)

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
    const confirmPasswordInput = screen.getByLabelText('Confirm Password') as HTMLInputElement

    await user.type(emailInput, 'newuser@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    await user.click(screen.getByRole('button', { name: 'Create Account' }))

    await waitFor(() => {
      expect(emailInput.value).toBe('')
      expect(passwordInput.value).toBe('')
      expect(confirmPasswordInput.value).toBe('')
    })
  })
})