'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { getProfile } from '@/lib/supabase/profile'

export default function AuthCallbackPage() {
  const router = useRouter()
  const { isLoaded, isSignedIn, user } = useUser()

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!isLoaded) return
      
      if (isSignedIn && user) {
        try {
          const profile = await getProfile(user.id)
          
          // Check if onboarding is completed
          if (profile?.onboarding_completed) {
            router.push('/dashboard')
          } else {
            router.push('/onboarding')
          }
        } catch (error) {
          // If profile doesn't exist, redirect to onboarding
          router.push('/onboarding')
        }
      } else {
        router.push('/login')
      }
    }

    checkOnboardingStatus()
  }, [router, isLoaded, isSignedIn, user])

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-bg">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-linear-text-secondary mx-auto mb-4" />
        <p className="text-linear-text-secondary">Completing sign in...</p>
      </div>
    </div>
  )
}