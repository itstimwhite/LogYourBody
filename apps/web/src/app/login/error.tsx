'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console
    console.error('Login page error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-bg p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Error Loading Login Page
        </h2>
        <p className="text-linear-text-secondary mb-4">
          {error.message || 'Something went wrong!'}
        </p>
        <details className="mb-4 text-left max-w-lg mx-auto">
          <summary className="cursor-pointer text-sm text-linear-text-secondary">
            Error Details
          </summary>
          <pre className="mt-2 text-xs bg-linear-card p-4 rounded overflow-auto">
            {error.stack}
          </pre>
        </details>
        <Button
          onClick={reset}
          variant="outline"
        >
          Try again
        </Button>
      </div>
    </div>
  )
}