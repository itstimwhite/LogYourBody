'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getProfile } from '@/lib/supabase/profile'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const profile = await getProfile(user.id)
        
        // Check if onboarding is completed
        if (profile?.onboarding_completed) {
          router.push('/dashboard')
        } else {
          router.push('/onboarding')
        }
      } else {
        router.push('/login')
      }
    }

    // Give Supabase time to process the callback
    const timer = setTimeout(checkOnboardingStatus, 1000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-bg">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-linear-text-secondary mx-auto mb-4" />
        <p className="text-linear-text-secondary">Completing sign in...</p>
      </div>
    </div>
  )
}