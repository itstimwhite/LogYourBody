'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Search, Home, ArrowLeft, Settings } from 'lucide-react'

export default function NotFound() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-linear-bg font-inter">
      <Header />
      
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-linear-purple/10">
              <Search className="h-10 w-10 text-linear-purple" />
            </div>
            <h1 className="mb-2 text-4xl font-bold text-linear-text">
              Page Not Found
            </h1>
            <p className="text-lg text-linear-text-secondary">
              Sorry, we couldn&apos;t find the page you&apos;re looking for.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button className="bg-linear-text text-linear-bg hover:bg-linear-text/90 px-6 py-3 inline-flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Go to Dashboard
                    </Button>
                  </Link>
                  
                  <Link href="/settings">
                    <Button 
                      variant="ghost" 
                      className="text-linear-text-secondary hover:text-linear-text border border-linear-border hover:bg-linear-border/50 px-6 py-3 inline-flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/">
                    <Button className="bg-linear-text text-linear-bg hover:bg-linear-text/90 px-6 py-3 inline-flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Go Home
                    </Button>
                  </Link>
                  
                  <Link href="/login">
                    <Button 
                      variant="ghost" 
                      className="text-linear-text-secondary hover:text-linear-text border border-linear-border hover:bg-linear-border/50 px-6 py-3"
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
            
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="text-linear-text-secondary hover:text-linear-text px-6 py-3 inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            
            <div className="mt-8 text-sm text-linear-text-tertiary">
              <p>
                If you think this is a mistake, please{' '}
                <Link 
                  href="/about" 
                  className="text-linear-purple hover:underline"
                >
                  contact support
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}