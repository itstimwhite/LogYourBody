'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Mail, ArrowLeft, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccessMessage('Check your email for the password reset link!')
      setEmail('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-bg p-4">
      <div className="w-full max-w-md">
        {/* Logo and header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <BarChart3 className="h-12 w-12 text-linear-purple" />
          </div>
          <h1 className="text-3xl font-bold text-linear-text mb-2">Reset your password</h1>
          <p className="text-linear-text-secondary">
            We'll send you a link to reset your password
          </p>
        </div>

        <Card className="bg-linear-card border-linear-border">
          <CardContent className="pt-6">
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-linear-text">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-linear-text-tertiary" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-linear-bg border-linear-border text-linear-text placeholder:text-linear-text-tertiary focus:border-linear-purple"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm text-green-400">
                  {successMessage}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-linear-purple hover:bg-linear-purple/80 text-white"
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm">
              <Link 
                href="/login" 
                className="inline-flex items-center text-linear-text-secondary hover:text-linear-text transition-colors"
              >
                <ArrowLeft className="mr-1 h-3 w-3" />
                Back to login
              </Link>
              <Link 
                href="/signup" 
                className="text-linear-purple hover:text-linear-purple/80 transition-colors"
              >
                Create account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}