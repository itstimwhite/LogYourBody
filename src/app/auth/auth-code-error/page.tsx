'use client'

import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-bg p-4 font-inter">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-linear-text">
            Authentication Error
          </h1>
          <p className="text-linear-text-secondary">
            Sorry, we couldn&apos;t sign you in. Please try again.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/login">
            <Button className="w-full bg-linear-text text-linear-bg hover:bg-linear-text/90">
              Try Again
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="ghost" className="w-full text-linear-text-secondary hover:text-linear-text">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}