'use client'

import { Button } from '@/components/ui/button'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react'

export function CompletionStep() {
  const { completeOnboarding, isLoading } = useOnboarding()

  return (
    <div className="text-center space-y-6">
      <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
        <CheckCircle className="h-10 w-10 text-green-500" />
      </div>
      
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-linear-text">
          You're In!
        </h1>
        <p className="text-lg text-linear-text-secondary">
          Your dashboard is ready. Let's start tracking your progress.
        </p>
      </div>
      
      <Button
        onClick={completeOnboarding}
        disabled={isLoading}
        size="lg"
        className="bg-linear-purple hover:bg-linear-purple/90 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Setting up...
          </>
        ) : (
          <>
            View My Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>
    </div>
  )
}