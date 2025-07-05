'use client'

import { useUser, useAuth as useClerkAuth, useSignIn, useSignUp, useClerk } from '@clerk/nextjs'
import { createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: any | null
  session: any | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  signInWithProvider: (provider: 'google' | 'apple') => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const { signOut: clerkSignOut, getToken } = useClerkAuth()
  const { setActive } = useClerk()
  const { signIn: clerkSignIn } = useSignIn()
  const { signUp: clerkSignUp } = useSignUp()
  const router = useRouter()

  const signIn = async (email: string, password: string) => {
    try {
      if (!clerkSignIn) throw new Error('Sign in not available')
      
      const result = await clerkSignIn.create({
        identifier: email,
        password,
      })
      
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/dashboard')
        return { error: null }
      }
      
      return { error: new Error('Sign in failed') }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      if (!clerkSignUp) throw new Error('Sign up not available')
      
      const result = await clerkSignUp.create({
        emailAddress: email,
        password,
      })
      
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        return { error: null }
      }
      
      // Handle email verification if needed
      if (result.status === 'missing_requirements') {
        await result.prepareEmailAddressVerification({ strategy: 'email_code' })
        // You might want to redirect to email verification page here
      }
      
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    await clerkSignOut()
    router.push('/')
  }

  const signInWithProvider = async (provider: 'google' | 'apple') => {
    try {
      if (!clerkSignIn) throw new Error('Sign in not available')
      
      const providerMap = {
        google: 'oauth_google',
        apple: 'oauth_apple'
      }
      
      await clerkSignIn.authenticateWithRedirect({
        strategy: providerMap[provider] as any,
        redirectUrl: '/auth/callback',
        redirectUrlComplete: '/dashboard',
      })
      
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const value = {
    user,
    session: { getToken }, // Provide getToken method for Supabase integration
    loading: !isLoaded,
    signIn,
    signUp,
    signOut,
    signInWithProvider,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within a ClerkAuthProvider')
  }
  return context
}

// Export alias for compatibility
export const AuthProvider = ClerkAuthProvider