'use client'

import { Button } from '@/components/ui/button'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { ArrowRight } from 'lucide-react'

export function WelcomeStep() {
  const { nextStep } = useOnboarding()

  return (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-linear-text">
          Welcome to LogYourBody
        </h1>
        <p className="text-xl text-linear-text-secondary">
          Let's get your body data in to kick things off right.
        </p>
      </div>
      
      <Button
        onClick={nextStep}
        size="lg"
        className="bg-linear-purple hover:bg-linear-purple/90 text-white"
      >
        Start Setup
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  )
}