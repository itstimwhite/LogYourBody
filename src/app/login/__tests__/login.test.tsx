import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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
  const mockSignUp = jest.fn()
  const mockSignInWithProvider = jest.fn()

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

  it('should render login form', () => {
    render(<LoginPage />)

    expect(screen.getByText('Welcome to LogYourBody')).toBeInTheDocument()
    expect(screen.getByText('Sign in to track your fitness journey')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Sign Up' })).toBeInTheDocument()
  })

  it('should switch between sign in and sign up tabs', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    // Initially on sign in tab
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()

    // Click sign up tab
    await user.click(screen.getByRole('tab', { name: 'Sign Up' }))

    // Should show sign up form
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument()
    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
  })

  it('should handle successful sign in', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ error: null })

    render(<LoginPage />)

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

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
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('should handle successful sign up', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({ error: null })

    render(<LoginPage />)

    // Switch to sign up tab
    await user.click(screen.getByRole('tab', { name: 'Sign Up' }))

    // Find the email and password inputs in the signup form
    const emailInputs = screen.getAllByLabelText('Email')
    const passwordInputs = screen.getAllByLabelText('Password')
    
    // The second set of inputs should be for signup
    await user.type(emailInputs[1], 'newuser@example.com')
    await user.type(passwordInputs[1], 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign Up' }))

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('newuser@example.com', 'password123')
      expect(screen.getByText('Check your email for the confirmation link!')).toBeInTheDocument()
    })
  })

  it('should display error on failed sign up', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({ error: new Error('Email already exists') })

    render(<LoginPage />)

    // Switch to sign up tab
    await user.click(screen.getByRole('tab', { name: 'Sign Up' }))

    const emailInputs = screen.getAllByLabelText('Email')
    const passwordInputs = screen.getAllByLabelText('Password')
    
    await user.type(emailInputs[1], 'existing@example.com')
    await user.type(passwordInputs[1], 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign Up' }))

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
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
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(screen.getByText('Signing in...')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeDisabled()
    expect(screen.getByLabelText('Password')).toBeDisabled()
  })

  it('should validate password length on sign up', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    // Switch to sign up tab
    await user.click(screen.getByRole('tab', { name: 'Sign Up' }))

    const passwordInputs = screen.getAllByLabelText('Password')
    const passwordInput = passwordInputs[1] // Sign up password input

    // Check that it has minLength attribute
    expect(passwordInput).toHaveAttribute('minLength', '6')
  })
})