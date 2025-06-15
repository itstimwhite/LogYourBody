'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login page with signup tab selected
    router.replace('/login?tab=signup')
  }, [router])

  // Show nothing while redirecting
  return null
}