'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthContext'
import { formatDateForDB } from '@/utils/date-utils'

interface OnboardingData {
  // DEXA scan data
  weight?: number
  bodyFatPercentage?: number
  leanMass?: number
  fatMass?: number
  boneMass?: number
  scanDate?: string
  
  // Multiple scans data
  extractedScans?: any[]
  scanCount?: number
  filename?: string
  confirmedScans?: any[]
  selectedScanCount?: number
  
  // Profile data
  fullName?: string
  dateOfBirth?: string
  height?: number
  gender?: 'male' | 'female'
  
  // Settings
  notificationsEnabled?: boolean
}

interface OnboardingContextType {
  currentStep: number
  totalSteps: number
  data: OnboardingData
  updateData: (newData: Partial<OnboardingData>) => void
  nextStep: () => void
  previousStep: () => void
  completeOnboarding: () => Promise<void>
  isLoading: boolean
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({})
  const [isLoading, setIsLoading] = useState(false)
  
  const totalSteps = 6

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }))
  }, [])

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, totalSteps])

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const completeOnboarding = useCallback(async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      // Save profile data
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          full_name: data.fullName,
          date_of_birth: data.dateOfBirth,
          height: data.height,
          gender: data.gender,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
      
      if (profileError) throw profileError
      
      // Save body metrics - either multiple scans or single entry
      if (data.confirmedScans && data.confirmedScans.length > 0) {
        // Multiple scans from PDF
        const metricsToInsert = data.confirmedScans.map(scan => ({
          user_id: user.id,
          date: formatDateForDB(scan.date),
          weight: scan.weight_unit === 'lbs' ? scan.weight * 0.453592 : scan.weight, // Convert to kg
          weight_unit: 'kg',
          body_fat_percentage: scan.body_fat_percentage || null,
          body_fat_method: 'dexa',
          lean_body_mass: scan.muscle_mass || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
        
        const { error: metricsError } = await supabase
          .from('body_metrics')
          .insert(metricsToInsert)
        
        if (metricsError) throw metricsError
      } else if (data.weight && data.bodyFatPercentage) {
        // Single entry (manual or single scan)
        const { error: metricsError } = await supabase
          .from('body_metrics')
          .insert({
            user_id: user.id,
            date: data.scanDate ? formatDateForDB(data.scanDate) : formatDateForDB(new Date()),
            weight: data.weight,
            weight_unit: 'lbs',
            body_fat_percentage: data.bodyFatPercentage,
            body_fat_method: 'dexa',
            lean_body_mass: data.leanMass,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        if (metricsError) throw metricsError
      }
      
      // Navigate to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      // Handle error appropriately
    } finally {
      setIsLoading(false)
    }
  }, [user, data, router])

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        totalSteps,
        data,
        updateData,
        nextStep,
        previousStep,
        completeOnboarding,
        isLoading
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}