import { redirect } from 'next/navigation'
import { createClient } from '../../../utils/supabase/server'
import { LoginForm } from './login-form'
import { VersionDisplay } from '../../../components/VersionDisplay'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - LogYourBody',
  description: 'Sign in to your LogYourBody account to track your body composition progress.',
  openGraph: {
    title: 'Login - LogYourBody',
    description: 'Sign in to track real progress. Not just weight.',
    type: 'website',
  },
}

export default async function LoginPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col bg-linear-bg font-inter">
      {/* Header with Back Navigation */}
      <div className="flex items-center justify-between p-6">
        <Link 
          href="/"
          className="text-linear-text-secondary hover:text-linear-text transition-colors"
        >
          ← Back
        </Link>
      </div>

      {/* Logo Section */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="mb-12 text-center">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-linear-text">
              LogYourBody
            </h1>
            <p className="mt-3 text-lg text-linear-text-secondary">
              Track real progress. Not just weight.
            </p>
          </div>

          {/* Auth Form */}
          <div className="mx-auto w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-sm text-linear-text-tertiary">
          By continuing, you agree to our{" "}
          <Link
            href="/terms"
            className="text-linear-purple hover:underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-linear-purple hover:underline"
          >
            Privacy Policy
          </Link>
        </p>
        <div className="mt-4 flex justify-center">
          <VersionDisplay />
        </div>
      </div>
    </div>
  )
}