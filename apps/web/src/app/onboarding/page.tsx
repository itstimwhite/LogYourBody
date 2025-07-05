'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/ClerkAuthContext'
import { useRouter } from 'next/navigation'
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext'
import { WelcomeStep } from './components/WelcomeStep'
import { DexaUploadStep } from './components/DexaUploadStep'
import { DataConfirmationStep } from './components/DataConfirmationStep'
import { MultiScanConfirmationStep } from './components/MultiScanConfirmationStep'
import { ProfileSetupStepV2 } from './components/ProfileSetupStepV2'
import { NotificationsStep } from './components/NotificationsStep'
import { CompletionStep } from './components/CompletionStep'
import { Progress } from '@/components/ui/progress'
import { Loader2 } from 'lucide-react'

function OnboardingFlow() {
  const { currentStep, totalSteps, data } = useOnboarding()
  const progress = (currentStep / totalSteps) * 100

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep />
      case 2:
        return <DexaUploadStep />
      case 3:
        // Show multi-scan confirmation if we have multiple scans
        if (data.extractedScans && data.extractedScans.length > 1) {
          return <MultiScanConfirmationStep />
        }
        return <DataConfirmationStep />
      case 4:
        return <ProfileSetupStepV2 />
      case 5:
        return <NotificationsStep />
      case 6:
        return <CompletionStep />
      default:
        return <WelcomeStep />
    }
  }

  return (
    <div className="min-h-screen bg-linear-bg flex flex-col">
      {/* Progress bar */}
      <div className="w-full px-4 pt-8 pb-4">
        <Progress value={progress} className="h-1 max-w-2xl mx-auto" />
      </div>
      
      {/* Step content - with max height and scroll */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8 overflow-y-auto">
        <div className="w-full max-w-lg py-4">
          {renderStep()}
        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-bg">
        <Loader2 className="h-8 w-8 animate-spin text-linear-text-secondary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <OnboardingProvider>
      <OnboardingFlow />
    </OnboardingProvider>
  )
}