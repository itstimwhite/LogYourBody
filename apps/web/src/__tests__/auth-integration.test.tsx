/**
 * Integration tests for authentication flow
 * These tests ensure our authentication system continues to work correctly
 */

import React from 'react'
import { render, screen, waitFor, act, renderHook } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/signin/page'
import SignupPage from '@/app/signup/page'
import { AuthProvider, useAuth } from '@/contexts/ClerkAuthContext'
import { useUser } from '@clerk/nextjs'

// Mock Clerk functions
const mockSignIn = jest.fn()
const mockSignUp = jest.fn()
const mockSignOut = jest.fn()
const mockSetActive = jest.fn()
const mockGetToken = jest.fn()

jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(() => ({
    user: null,
    isLoaded: true,
  })),
  useAuth: jest.fn(() => ({
    signOut: mockSignOut,
    getToken: mockGetToken,
  })),
  useSignIn: jest.fn(() => ({
    signIn: {
      create: mockSignIn,
      authenticateWithRedirect: jest.fn(),
    },
  })),
  useSignUp: jest.fn(() => ({
    signUp: {
      create: mockSignUp,
    },
  })),
  useClerk: jest.fn(() => ({
    setActive: mockSetActive,
  })),
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
    mockGetToken.mockResolvedValue('test-token')
  })

  describe('Email Sign Up Flow', () => {
    it('should complete sign up flow successfully', async () => {
      const user = userEvent.setup()
      mockSignUp.mockResolvedValue({
        status: 'complete',
        createdSessionId: 'test-session-id'
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
          emailAddress: 'test@example.com',
          password: 'password123',
        })
      })

      // Should set active session
      await waitFor(() => {
        expect(mockSetActive).toHaveBeenCalledWith({ session: 'test-session-id' })
      })
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
      const _mockSession = { user: mockUser, access_token: 'token' }
      
      mockSignIn.mockResolvedValue({
        status: 'complete',
        createdSessionId: 'test-session-id'
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
          identifier: 'test@example.com',
          password: 'password123'
        })
      })

      // Verify redirect to dashboard
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('should handle invalid credentials', async () => {
      const user = userEvent.setup()
      mockSignIn.mockRejectedValue(new Error('Invalid login credentials'))

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
    it('should handle existing user on mount', async () => {
      const mockUser = { id: '123', emailAddresses: [{ emailAddress: 'test@example.com' }] }
      
      jest.mocked(useUser).mockReturnValue({
        user: mockUser,
        isLoaded: true,
      } as any)

      await act(async () => {
        render(
          <AuthProvider>
            <div data-testid="test-content">Authenticated</div>
          </AuthProvider>
        )
      })

      // Verify user is loaded
      await waitFor(() => {
        expect(screen.getByTestId('test-content')).toBeInTheDocument()
      })
    })

    it('should handle sign out', async () => {
      await act(async () => {
        render(
          <AuthProvider>
            <div>Test</div>
          </AuthProvider>
        )
      })

      // Get auth context and trigger sign out
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await act(async () => {
        await result.current.signOut()
      })

      // Verify sign out was called
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/')
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