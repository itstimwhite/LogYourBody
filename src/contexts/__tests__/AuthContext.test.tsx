import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'

// Mock the router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock the Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    }),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    signInWithOAuth: jest.fn(),
  }
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient
}))

// Test component that uses the auth context
function TestComponent() {
  const { user, session, loading } = useAuth()
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <div data-testid="session">{session ? 'has-session' : 'no-session'}</div>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should provide auth context to children', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Initially loading should be true
    expect(screen.getByTestId('loading')).toHaveTextContent('true')

    // After loading, should show no user/session
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })
    expect(screen.getByTestId('user')).toHaveTextContent('no-user')
    expect(screen.getByTestId('session')).toHaveTextContent('no-session')
  })

  it('should throw error when useAuth is used outside of AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')

    consoleSpy.mockRestore()
  })

  it('should handle successful sign in', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    const mockSession = { user: mockUser, access_token: 'token' }
    
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    })

    function SignInTest() {
      const { signIn } = useAuth()
      return (
        <button onClick={() => signIn('test@example.com', 'password')}>
          Sign In
        </button>
      )
    }

    render(
      <AuthProvider>
        <SignInTest />
      </AuthProvider>
    )

    const button = screen.getByText('Sign In')
    button.click()

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should handle sign in error', async () => {
    const mockError = new Error('Invalid credentials')
    
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: mockError,
    })

    let signInResult: { error: Error | null }
    function SignInTest() {
      const { signIn } = useAuth()
      return (
        <button
          onClick={async () => {
            signInResult = await signIn('test@example.com', 'wrong-password')
          }}
        >
          Sign In
        </button>
      )
    }

    render(
      <AuthProvider>
        <SignInTest />
      </AuthProvider>
    )

    const button = screen.getByText('Sign In')
    button.click()

    await waitFor(() => {
      expect(signInResult).toEqual({ error: mockError })
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('should handle sign up', async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: { id: '123' }, session: null },
      error: null,
    })

    let signUpResult: { error: Error | null }
    function SignUpTest() {
      const { signUp } = useAuth()
      return (
        <button
          onClick={async () => {
            signUpResult = await signUp('new@example.com', 'password')
          }}
        >
          Sign Up
        </button>
      )
    }

    render(
      <AuthProvider>
        <SignUpTest />
      </AuthProvider>
    )

    const button = screen.getByText('Sign Up')
    button.click()

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password',
        options: {
          emailRedirectTo: expect.stringContaining('/auth/callback'),
        },
      })
      expect(signUpResult).toEqual({ error: null })
    })
  })

  it('should handle sign out', async () => {
    mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null })

    function SignOutTest() {
      const { signOut } = useAuth()
      return <button onClick={signOut}>Sign Out</button>
    }

    render(
      <AuthProvider>
        <SignOutTest />
      </AuthProvider>
    )

    const button = screen.getByText('Sign Out')
    button.click()

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('should handle OAuth sign in', async () => {
    mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
      data: { provider: 'google', url: 'https://auth.url' },
      error: null,
    })

    let oauthResult: { error: Error | null }
    function OAuthTest() {
      const { signInWithProvider } = useAuth()
      return (
        <button
          onClick={async () => {
            oauthResult = await signInWithProvider('google')
          }}
        >
          Sign in with Google
        </button>
      )
    }

    render(
      <AuthProvider>
        <OAuthTest />
      </AuthProvider>
    )

    const button = screen.getByText('Sign in with Google')
    button.click()

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
        },
      })
      expect(oauthResult).toEqual({ error: null })
    })
  })
})