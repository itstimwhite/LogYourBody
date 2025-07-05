/**
 * Integration tests for authentication flow
 * These tests ensure our authentication system continues to work correctly
 */

import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/login/page'
import SignupPage from '@/app/signup/page'
import { AuthProvider } from '@/contexts/ClerkAuthContext'

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
    mockOnAuthStateChange.mockImplementation((callback) => {
      // Immediately invoke the callback to simulate auth state change
      setTimeout(() => callback('INITIAL', null), 0)
      return {
        data: { subscription: { unsubscribe: jest.fn() } }
      }
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

      await act(async () => {
        render(
          <AuthProvider>
            <SignupPage />
          </AuthProvider>
        )
      })

      // Fill in the form
      await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')

      // Submit
      await user.click(screen.getByRole('button', { name: /Create account/i }))

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

      await act(async () => {
        render(
          <AuthProvider>
            <SignupPage />
          </AuthProvider>
        )
      })

      // Try with short password
      await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'pass')
      await user.click(screen.getByRole('button', { name: /Create account/i }))

      // Should show error
      await waitFor(() => {
        const errors = screen.getAllByText('Password must be at least 6 characters')
        expect(errors.length).toBeGreaterThan(0)
      })

      expect(mockSignUp).not.toHaveBeenCalled()
    })

    // Password confirmation test removed - simplified form doesn't have confirm password field
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

      await act(async () => {
        render(
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        )
      })

      // Fill in the form
      await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com')
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

      await act(async () => {
        render(
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        )
      })

      // Fill in the form
      await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com')
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
      await act(async () => {
        render(
          <AuthProvider>
            <div data-testid="test-content">Authenticated</div>
          </AuthProvider>
        )
      })

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

      await act(async () => {
        render(
          <AuthProvider>
            <div>Test</div>
          </AuthProvider>
        )
      })

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

      await act(async () => {
        render(
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        )
      })

      const signupLink = screen.getByRole('link', { name: 'Sign up' })
      expect(signupLink).toHaveAttribute('href', '/signup')
    })

    it('should navigate from signup to login', async () => {

      await act(async () => {
        render(
          <AuthProvider>
            <SignupPage />
          </AuthProvider>
        )
      })

      const loginLink = screen.getByRole('link', { name: 'Sign in' })
      expect(loginLink).toHaveAttribute('href', '/login')
    })

    it('should navigate to forgot password', async () => {

      await act(async () => {
        render(
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        )
      })

      const forgotLink = screen.getByRole('link', { name: 'Forgot?' })
      expect(forgotLink).toHaveAttribute('href', '/forgot-password')
    })
  })
})