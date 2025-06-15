'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  // Check URL params for signup mode
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup")
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Platform detection (simplified for Next.js)
  const [isMobile, setIsMobile] = useState(false)
  const [showEmailAuth] = useState(true) // Always show email auth in Next.js version
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Temporarily disabled for deployment debugging
      router.push('/dashboard')
      router.refresh()
      
      // if (isLogin) {
      //   // Sign in
      //   const { error } = await supabase.auth.signInWithPassword({
      //     email,
      //     password,
      //   })

      //   if (error) {
      //     setError(error.message)
      //   } else {
      //     router.push('/dashboard')
      //     router.refresh()
      //   }
      // } else {
      //   // Sign up
      //   const { error } = await supabase.auth.signUp({
      //     email,
      //     password,
      //     options: {
      //       data: {
      //         full_name: name,
      //       }
      //     }
      //   })

      //   if (error) {
      //     if (error.message.includes('already registered')) {
      //       setError('An account with this email already exists.')
      //       setIsLogin(true)
      //       setTimeout(() => {
      //         setError('Please sign in with your existing account.')
      //       }, 2000)
      //     } else {
      //       setError(error.message)
      //     }
      //   } else {
      //     setError('Account created! Please check your email and click the confirmation link to complete your registration.')
      //   }
      // }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred during authentication')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message || 'Google Sign In failed')
      }
    } catch {
      setError('Google Sign In failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAppleSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message || 'Apple Sign In failed')
      }
    } catch {
      setError('Apple Sign In failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div
          className={`rounded-lg p-3 text-center text-sm ${
            error.includes("Account created!") ||
            error.includes("Please sign in with your existing account")
              ? "border border-linear-purple/30 bg-linear-purple/10 text-linear-purple"
              : "border border-red-500/30 bg-red-500/10 text-red-500"
          }`}
        >
          {error}
        </div>
      )}

      {/* Email Auth Form */}
      {showEmailAuth && (
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <Label htmlFor="name" className="sr-only">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 border border-linear-border bg-linear-card text-base text-linear-text placeholder:text-linear-text-tertiary rounded-lg transition-all focus:border-linear-purple focus:outline-none focus:ring-2 focus:ring-linear-purple/20"
              />
            </div>
          )}

          <div>
            <Label htmlFor="email" className="sr-only">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 border border-linear-border bg-linear-card text-base text-linear-text placeholder:text-linear-text-tertiary rounded-lg transition-all focus:border-linear-purple focus:outline-none focus:ring-2 focus:ring-linear-purple/20"
            />
          </div>

          <div className="relative">
            <Label htmlFor="password" className="sr-only">
              Password
            </Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 border border-linear-border bg-linear-card pr-12 text-base text-linear-text placeholder:text-linear-text-tertiary rounded-lg transition-all focus:border-linear-purple focus:outline-none focus:ring-2 focus:ring-linear-purple/20"
            />
            {/* Show password toggle - only on desktop */}
            {!isMobile && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-linear-text-tertiary transition-colors hover:text-linear-text"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            )}
          </div>

          {/* Password requirements hint for signup */}
          {!isLogin && (
            <p className="text-xs text-linear-text-tertiary">
              Password must be at least 6 characters
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full bg-linear-text text-base font-medium text-linear-bg hover:bg-linear-text/90 rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait...
              </>
            ) : (
              isLogin ? "Sign In" : "Create Account"
            )}
          </Button>
        </form>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-linear-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-linear-bg px-2 text-linear-text-tertiary">
            Or continue with
          </span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="space-y-3">
        {/* Google Sign In */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="h-12 w-full border-linear-border bg-linear-card font-medium text-linear-text hover:bg-linear-border/50 rounded-lg transition-colors"
        >
          <svg
            className="mr-3 h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {loading ? "Signing in..." : "Continue with Google"}
        </Button>

        {/* Apple Sign In */}
        <Button
          type="button"
          variant="outline"
          onClick={handleAppleSignIn}
          disabled={loading}
          className="h-12 w-full border-linear-border bg-linear-card font-medium text-linear-text hover:bg-linear-border/50 rounded-lg transition-colors"
        >
          <svg
            className="mr-3 h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
          </svg>
          {loading ? "Signing in..." : "Continue with Apple"}
        </Button>
      </div>

      {/* Toggle between login/signup */}
      {showEmailAuth && (
        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-linear-text-secondary hover:text-linear-text transition-colors"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </Button>
        </div>
      )}
    </div>
  )
}