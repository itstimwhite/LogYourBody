'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/hooks/use-toast'
import { 
  ArrowLeft, 
  ArrowRight,
  User,
  Ruler,
  Target,
  Activity,
  CheckCircle,
  Sparkles,
  Calendar,
  Scale,
  Info
} from 'lucide-react'
import { format } from 'date-fns'
import { UserProfile } from '@/types/body-metrics'

type Step = 'welcome' | 'profile' | 'measurements' | 'goals' | 'preferences' | 'complete'

const STEPS: Step[] = ['welcome', 'profile', 'measurements', 'goals', 'preferences', 'complete']

const STEP_TITLES = {
  welcome: 'Welcome',
  profile: 'Profile',
  measurements: 'Measurements',
  goals: 'Goals',
  preferences: 'Preferences',
  complete: 'Complete'
}

export default function OnboardingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('welcome')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    // Profile
    full_name: '',
    date_of_birth: '',
    gender: 'male' as 'male' | 'female' | 'other',
    // Measurements
    height: '',
    height_unit: 'cm' as 'cm' | 'ft',
    weight: '',
    weight_unit: 'kg' as 'kg' | 'lbs',
    activity_level: 'moderately_active' as UserProfile['activity_level'],
    // Goals
    primary_goal: 'maintain' as 'lose_weight' | 'gain_muscle' | 'maintain' | 'body_recomp',
    target_weight: '',
    target_date: '',
    // Preferences
    units: {
      weight: 'kg' as 'kg' | 'lbs',
      height: 'cm' as 'cm' | 'ft',
      measurements: 'cm' as 'cm' | 'in'
    },
    reminder_enabled: true,
    reminder_time: '09:00'
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const currentStepIndex = STEPS.indexOf(currentStep)
  const progress = (currentStepIndex / (STEPS.length - 1)) * 100

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1])
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1])
    }
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Welcome aboard!",
        description: "Your profile has been set up successfully."
      })
      
      router.push('/dashboard')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 'welcome':
        return true
      case 'profile':
        return formData.full_name && formData.date_of_birth
      case 'measurements':
        return formData.height && formData.weight
      case 'goals':
        return formData.primary_goal
      case 'preferences':
        return true
      default:
        return true
    }
  }

  const calculateAge = () => {
    if (!formData.date_of_birth) return null
    const today = new Date()
    const birthDate = new Date(formData.date_of_birth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="min-h-screen bg-linear-bg">
      {/* Progress Bar */}
      {currentStep !== 'welcome' && currentStep !== 'complete' && (
        <div className="fixed top-0 left-0 right-0 bg-linear-card border-b border-linear-border z-10">
          <div className="container mx-auto px-4 py-3">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2">
              {STEPS.slice(1, -1).map((step, index) => (
                <span
                  key={step}
                  className={`text-xs ${
                    index + 1 <= currentStepIndex
                      ? 'text-linear-text font-medium'
                      : 'text-linear-text-tertiary'
                  }`}
                >
                  {STEP_TITLES[step]}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`container mx-auto px-4 ${currentStep !== 'welcome' && currentStep !== 'complete' ? 'pt-20' : 'pt-12'} pb-12 max-w-2xl`}>
        {/* Welcome Step */}
        {currentStep === 'welcome' && (
          <div className="min-h-[80vh] flex items-center justify-center">
            <Card className="bg-linear-card border-linear-border w-full">
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-linear-purple/10 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-8 w-8 text-linear-purple" />
                </div>
                <h1 className="text-3xl font-bold text-linear-text mb-4">
                  Welcome to LogYourBody
                </h1>
                <p className="text-linear-text-secondary mb-8 max-w-md mx-auto">
                  Let's set up your profile to give you the best personalized experience for tracking your fitness journey.
                </p>
                <Button 
                  onClick={handleNext}
                  size="lg"
                  className="bg-linear-purple hover:bg-linear-purple/80 text-white"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <p className="text-xs text-linear-text-tertiary mt-4">
                  This will only take 2-3 minutes
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Step */}
        {currentStep === 'profile' && (
          <Card className="bg-linear-card border-linear-border">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-linear-purple/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-linear-text" />
                </div>
                <div>
                  <CardTitle className="text-linear-text">Personal Information</CardTitle>
                  <CardDescription className="text-linear-text-secondary">
                    Tell us a bit about yourself
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-linear-text">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="bg-linear-bg border-linear-border text-linear-text"
                  placeholder="John Doe"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-linear-text">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                  className="bg-linear-bg border-linear-border text-linear-text"
                  max={format(new Date(), 'yyyy-MM-dd')}
                />
                {formData.date_of_birth && (
                  <p className="text-xs text-linear-text-secondary">
                    Age: {calculateAge()} years
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-linear-text">Gender</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value as any }))}
                  className="grid grid-cols-3 gap-4"
                >
                  <label
                    htmlFor="gender-male"
                    className="flex items-center justify-center p-4 rounded-lg border border-linear-border cursor-pointer hover:bg-linear-card/50"
                  >
                    <RadioGroupItem value="male" id="gender-male" className="sr-only" />
                    <span className="text-linear-text">Male</span>
                  </label>
                  <label
                    htmlFor="gender-female"
                    className="flex items-center justify-center p-4 rounded-lg border border-linear-border cursor-pointer hover:bg-linear-card/50"
                  >
                    <RadioGroupItem value="female" id="gender-female" className="sr-only" />
                    <span className="text-linear-text">Female</span>
                  </label>
                  <label
                    htmlFor="gender-other"
                    className="flex items-center justify-center p-4 rounded-lg border border-linear-border cursor-pointer hover:bg-linear-card/50"
                  >
                    <RadioGroupItem value="other" id="gender-other" className="sr-only" />
                    <span className="text-linear-text">Other</span>
                  </label>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Measurements Step */}
        {currentStep === 'measurements' && (
          <Card className="bg-linear-card border-linear-border">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-linear-purple/10 flex items-center justify-center">
                  <Ruler className="h-5 w-5 text-linear-text" />
                </div>
                <div>
                  <CardTitle className="text-linear-text">Your Measurements</CardTitle>
                  <CardDescription className="text-linear-text-secondary">
                    We'll use this for accurate calculations
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="height" className="text-linear-text">Height</Label>
                <div className="flex gap-2">
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                    className="bg-linear-bg border-linear-border text-linear-text"
                    placeholder="180"
                  />
                  <Select 
                    value={formData.height_unit} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, height_unit: value as any }))}
                  >
                    <SelectTrigger className="bg-linear-bg border-linear-border text-linear-text w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="ft">ft/in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight" className="text-linear-text">Current Weight</Label>
                <div className="flex gap-2">
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    className="bg-linear-bg border-linear-border text-linear-text"
                    placeholder="75"
                  />
                  <Select 
                    value={formData.weight_unit} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, weight_unit: value as any }))}
                  >
                    <SelectTrigger className="bg-linear-bg border-linear-border text-linear-text w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="lbs">lbs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activityLevel" className="text-linear-text">Activity Level</Label>
                <Select 
                  value={formData.activity_level} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, activity_level: value as any }))}
                >
                  <SelectTrigger className="bg-linear-bg border-linear-border text-linear-text">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                    <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                    <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                    <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                    <SelectItem value="extremely_active">Extremely Active (2x per day)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goals Step */}
        {currentStep === 'goals' && (
          <Card className="bg-linear-card border-linear-border">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-linear-purple/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-linear-text" />
                </div>
                <div>
                  <CardTitle className="text-linear-text">Your Goals</CardTitle>
                  <CardDescription className="text-linear-text-secondary">
                    What would you like to achieve?
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-linear-text">Primary Goal</Label>
                <RadioGroup
                  value={formData.primary_goal}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, primary_goal: value as any }))}
                  className="space-y-3"
                >
                  <label
                    htmlFor="goal-lose"
                    className="flex items-center space-x-3 p-4 rounded-lg border border-linear-border cursor-pointer hover:bg-linear-card/50"
                  >
                    <RadioGroupItem value="lose_weight" id="goal-lose" />
                    <div className="flex-1">
                      <p className="font-medium text-linear-text">Lose Weight</p>
                      <p className="text-sm text-linear-text-secondary">
                        Reduce body fat and weight
                      </p>
                    </div>
                  </label>
                  
                  <label
                    htmlFor="goal-gain"
                    className="flex items-center space-x-3 p-4 rounded-lg border border-linear-border cursor-pointer hover:bg-linear-card/50"
                  >
                    <RadioGroupItem value="gain_muscle" id="goal-gain" />
                    <div className="flex-1">
                      <p className="font-medium text-linear-text">Build Muscle</p>
                      <p className="text-sm text-linear-text-secondary">
                        Increase lean muscle mass
                      </p>
                    </div>
                  </label>
                  
                  <label
                    htmlFor="goal-maintain"
                    className="flex items-center space-x-3 p-4 rounded-lg border border-linear-border cursor-pointer hover:bg-linear-card/50"
                  >
                    <RadioGroupItem value="maintain" id="goal-maintain" />
                    <div className="flex-1">
                      <p className="font-medium text-linear-text">Maintain</p>
                      <p className="text-sm text-linear-text-secondary">
                        Maintain current physique
                      </p>
                    </div>
                  </label>
                  
                  <label
                    htmlFor="goal-recomp"
                    className="flex items-center space-x-3 p-4 rounded-lg border border-linear-border cursor-pointer hover:bg-linear-card/50"
                  >
                    <RadioGroupItem value="body_recomp" id="goal-recomp" />
                    <div className="flex-1">
                      <p className="font-medium text-linear-text">Body Recomposition</p>
                      <p className="text-sm text-linear-text-secondary">
                        Lose fat while building muscle
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              {(formData.primary_goal === 'lose_weight' || formData.primary_goal === 'gain_muscle') && (
                <div className="space-y-4 pt-4 border-t border-linear-border">
                  <div className="space-y-2">
                    <Label htmlFor="targetWeight" className="text-linear-text">
                      Target Weight ({formData.weight_unit})
                    </Label>
                    <Input
                      id="targetWeight"
                      type="number"
                      step="0.1"
                      value={formData.target_weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_weight: e.target.value }))}
                      className="bg-linear-bg border-linear-border text-linear-text"
                      placeholder={formData.primary_goal === 'lose_weight' ? '70' : '80'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetDate" className="text-linear-text">
                      Target Date (optional)
                    </Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={formData.target_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
                      className="bg-linear-bg border-linear-border text-linear-text"
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Preferences Step */}
        {currentStep === 'preferences' && (
          <Card className="bg-linear-card border-linear-border">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-linear-purple/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-linear-text" />
                </div>
                <div>
                  <CardTitle className="text-linear-text">Your Preferences</CardTitle>
                  <CardDescription className="text-linear-text-secondary">
                    Customize your experience
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-linear-text">Measurement Units</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-linear-text-secondary">Weight</Label>
                    <Select 
                      value={formData.units.weight} 
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        units: { ...prev.units, weight: value as any }
                      }))}
                    >
                      <SelectTrigger className="bg-linear-bg border-linear-border text-linear-text">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-linear-text-secondary">Measurements</Label>
                    <Select 
                      value={formData.units.measurements} 
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        units: { ...prev.units, measurements: value as any }
                      }))}
                    >
                      <SelectTrigger className="bg-linear-bg border-linear-border text-linear-text">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cm">Centimeters (cm)</SelectItem>
                        <SelectItem value="in">Inches (in)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-linear-border">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reminder" className="text-linear-text font-normal">
                      Daily Reminder
                    </Label>
                    <p className="text-sm text-linear-text-secondary">
                      Get reminded to log your metrics
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="reminder"
                    checked={formData.reminder_enabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, reminder_enabled: e.target.checked }))}
                    className="sr-only"
                  />
                  <label
                    htmlFor="reminder"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.reminder_enabled ? 'bg-linear-purple' : 'bg-linear-border'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.reminder_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </label>
                </div>

                {formData.reminder_enabled && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="reminderTime" className="text-sm text-linear-text">
                      Reminder Time
                    </Label>
                    <Input
                      id="reminderTime"
                      type="time"
                      value={formData.reminder_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, reminder_time: e.target.value }))}
                      className="bg-linear-bg border-linear-border text-linear-text max-w-xs"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complete Step */}
        {currentStep === 'complete' && (
          <div className="min-h-[80vh] flex items-center justify-center">
            <Card className="bg-linear-card border-linear-border w-full">
              <CardContent className="p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-linear-text mb-4">
                  You're All Set!
                </h1>
                <p className="text-linear-text-secondary mb-8 max-w-md mx-auto">
                  Your profile is ready. Let's start tracking your fitness journey and achieving your goals together.
                </p>
                
                <Alert className="mb-8 border-linear-border bg-linear-card text-left max-w-md mx-auto">
                  <Info className="h-4 w-4 text-linear-text" />
                  <AlertDescription className="text-linear-text-secondary">
                    <strong className="text-linear-text">Pro tip:</strong> Log your metrics daily for the most accurate tracking and insights.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  size="lg"
                  className="bg-linear-purple hover:bg-linear-purple/80 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 animate-pulse" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer Actions */}
        {currentStep !== 'welcome' && currentStep !== 'complete' && (
          <div className="flex justify-between mt-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {currentStep === 'preferences' ? (
              <Button
                onClick={() => setCurrentStep('complete')}
                disabled={!canProceed()}
                className="bg-linear-purple hover:bg-linear-purple/80 text-white"
              >
                Complete Setup
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-linear-purple hover:bg-linear-purple/80 text-white"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}