import { BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <BarChart3 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to continue your fitness journey
          </p>
        </div>

        {/* Temporarily disabled Clerk component for theme testing */}
        <div className="p-6 bg-card border border-border rounded-lg shadow-xl">
          <p className="text-center text-muted-foreground">
            Sign in form temporarily disabled for theme testing.
            <br />
            <Link href="/" className="text-primary hover:underline">← Back to homepage</Link>
          </p>
        </div>
      </div>
    </div>
  )
}