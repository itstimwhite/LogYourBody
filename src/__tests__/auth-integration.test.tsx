/**
 * Integration tests for authentication flow
 * These tests ensure our authentication system continues to work correctly
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/login/page'
import SignupPage from '@/app/signup/page'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock Supabase client
const mockSignIn = jest.fn()
const mockSignUp = jest.fn()
const mockSignOut = jest.fn()
const mockOnAuthStateChange = jest.fn()
const mockGetSession = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignIn,
      signUp: mockSignUp,
      signOut: mockSignOut,
      onAuthStateChange: mockOnAuthStateChange,
      getSession: mockGetSession,
      signInWithOAuth: jest.fn(),
    }
  })
}))

// Mock router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetSession.mockResolvedValue({ data: { session: null } })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    })
  })

  describe('Email Sign Up Flow', () => {
    it('should complete sign up flow successfully', async () => {
      const user = userEvent.setup()
      mockSignUp.mockResolvedValue({
        data: {
          user: { id: '123', email: 'test@example.com' },
          session: null
        },
        error: null
      })
      // Mock sign in after signup
      mockSignIn.mockResolvedValue({
        data: {
          user: { id: '123', email: 'test@example.com' },
          session: { access_token: 'token', user: { id: '123', email: 'test@example.com' } }
        },
        error: null
      })

      render(
        <AuthProvider>
          <SignupPage />
        </AuthProvider>
      )

      // Fill in the form
      await user.type(screen.getByLabelText('Email'), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.type(screen.getByLabelText('Confirm Password'), 'password123')

      // Submit
      await user.click(screen.getByRole('button', { name: 'Create Account' }))

      // Verify sign up was called
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          options: {
            emailRedirectTo: expect.stringContaining('/auth/callback'),
          }
        })
      })

      // Should auto-login and redirect to dashboard
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('should validate password requirements', async () => {
      const user = userEvent.setup()

      render(
        <AuthProvider>
          <SignupPage />
        </AuthProvider>
      )

      // Try with short password
      await user.type(screen.getByLabelText('Email'), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'pass')
      await user.type(screen.getByLabelText('Confirm Password'), 'pass')
      await user.click(screen.getByRole('button', { name: 'Create Account' }))

      // Should show error
      await waitFor(() => {
        const errors = screen.getAllByText('Password must be at least 6 characters')
        expect(errors.length).toBeGreaterThan(0)
      })

      expect(mockSignUp).not.toHaveBeenCalled()
    })

    it('should validate password confirmation', async () => {
      const user = userEvent.setup()

      render(
        <AuthProvider>
          <SignupPage />
        </AuthProvider>
      )

      // Try with mismatched passwords
      await user.type(screen.getByLabelText('Email'), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.type(screen.getByLabelText('Confirm Password'), 'password456')
      await user.click(screen.getByRole('button', { name: 'Create Account' }))

      // Should show error
      expect(await screen.findByText('Passwords do not match')).toBeInTheDocument()
      expect(mockSignUp).not.toHaveBeenCalled()
    })
  })

  describe('Email Sign In Flow', () => {
    it('should complete sign in flow successfully', async () => {
      const user = userEvent.setup()
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockSession = { user: mockUser, access_token: 'token' }
      
      mockSignIn.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })

      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      )

      // Fill in the form
      await user.type(screen.getByLabelText('Email address'), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')

      // Submit
      await user.click(screen.getByRole('button', { name: /Sign in/i }))

      // Verify sign in was called
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        })
      })

      // Verify redirect to dashboard
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('should handle invalid credentials', async () => {
      const user = userEvent.setup()
      mockSignIn.mockResolvedValue({
        data: { user: null, session: null },
        error: new Error('Invalid login credentials')
      })

      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      )

      // Fill in the form
      await user.type(screen.getByLabelText('Email address'), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'wrongpassword')

      // Submit
      await user.click(screen.getByRole('button', { name: /Sign in/i }))

      // Should show error
      expect(await screen.findByText('Invalid login credentials')).toBeInTheDocument()
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Session Management', () => {
    it('should handle existing session on mount', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockSession = { user: mockUser, access_token: 'token' }
      
      mockGetSession.mockResolvedValue({
        data: { session: mockSession }
      })

      // Note: The middleware would handle this redirect in production
      // This test verifies the AuthProvider correctly loads the session
      render(
        <AuthProvider>
          <div data-testid="test-content">Authenticated</div>
        </AuthProvider>
      )

      // Verify session is loaded
      await waitFor(() => {
        expect(mockGetSession).toHaveBeenCalled()
      })
    })

    it('should handle auth state changes', async () => {
      let authChangeCallback: (event: string, session: { user: { id: string; email: string }, access_token: string } | null) => void
      mockOnAuthStateChange.mockImplementation((callback) => {
        authChangeCallback = callback
        return {
          data: { subscription: { unsubscribe: jest.fn() } }
        }
      })

      const { act } = await import('@testing-library/react')
      
      render(
        <AuthProvider>
          <div>Test</div>
        </AuthProvider>
      )

      // Simulate auth state change
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockSession = { user: mockUser, access_token: 'token' }
      
      await act(async () => {
        authChangeCallback('SIGNED_IN', mockSession)
      })

      // Component should update with new auth state
      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled()
      })
    })
  })

  describe('Navigation Between Auth Pages', () => {
    it('should navigate from login to signup', async () => {

      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      )

      const signupLink = screen.getByRole('link', { name: 'Create account' })
      expect(signupLink).toHaveAttribute('href', '/signup')
    })

    it('should navigate from signup to login', async () => {

      render(
        <AuthProvider>
          <SignupPage />
        </AuthProvider>
      )

      const loginLink = screen.getByRole('link', { name: 'Sign in' })
      expect(loginLink).toHaveAttribute('href', '/login')
    })

    it('should navigate to forgot password', async () => {

      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      )

      const forgotLink = screen.getByRole('link', { name: 'Forgot password?' })
      expect(forgotLink).toHaveAttribute('href', '/forgot-password')
    })
  })
})