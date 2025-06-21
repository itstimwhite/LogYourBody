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
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { WeightWheelPicker, BodyFatWheelPicker } from '@/components/ui/weight-wheel-picker'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { toast } from '@/hooks/use-toast'
import { 
  ArrowLeft, 
  ArrowRight,
  Scale,
  Ruler,
  CheckCircle,
  Camera,
  Calculator,
  X
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { calculateNavyBodyFat, calculate3SiteBodyFat, calculateFFMI, calculateBodyComposition } from '@/utils/body-calculations'
import { UserProfile } from '@/types/body-metrics'
import { 
  compressImage, 
  validateImageFile, 
  getUploadErrorMessage,
  checkBrowserSupport
} from '@/utils/photo-upload-utils'
import { uploadToStorage } from '@/utils/storage-utils'
import { createClient } from '@/lib/supabase/client'
import { getProfile } from '@/lib/supabase/profile'
import Image from 'next/image'

type Step = 'weight' | 'method' | 'measurements' | 'photo' | 'review'

const STEPS: Step[] = ['weight', 'method', 'measurements', 'photo', 'review']

const STEP_TITLES = {
  weight: 'Weight',
  method: 'Method',
  measurements: 'Measurements',
  photo: 'Photo',
  review: 'Review'
}

export default function LogWeightPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('weight')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [showBodyFatModal, setShowBodyFatModal] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    weight: '',
    weight_unit: 'lbs' as 'kg' | 'lbs',
    method: 'simple' as 'simple' | 'navy' | '3-site' | '7-site',
    // Navy method
    waist: '',
    neck: '',
    hip: '', // for females
    // 3-site method
    chest: '',
    abdominal: '',
    thigh: '',
    tricep: '',
    suprailiac: '',
    // Calculated
    body_fat_percentage: null as number | null,
    notes: '',
    photo: null as File | null,
    photoPreview: null as string | null
  })

  const [profile, setProfile] = useState<Partial<UserProfile>>({
    height: 71,
    height_unit: 'ft',
    gender: 'male',
    settings: {
      units: {
        weight: 'lbs',
        height: 'ft',
        measurements: 'in'
      }
    }
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Load user profile
  useEffect(() => {
    if (user) {
      getProfile(user.id).then((profileData) => {
        if (profileData) {
          setProfile({
            height: profileData.height,
            height_unit: profileData.height_unit,
            gender: profileData.gender,
            date_of_birth: profileData.date_of_birth,
            settings: profileData.settings
          })
          
          // Update form data with user's preferred units
          if (profileData.settings?.units?.weight) {
            setFormData(prev => ({
              ...prev,
              weight_unit: profileData.settings.units.weight as 'kg' | 'lbs'
            }))
          }
        }
      }).catch((error) => {
        console.error('Error loading profile:', error)
      })
    }
  }, [user])

  const currentStepIndex = STEPS.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      // Calculate body fat if moving from measurements step
      if (currentStep === 'measurements') {
        calculateBodyFat()
      }
      setCurrentStep(STEPS[currentStepIndex + 1])
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1])
    }
  }

  const calculateAge = () => {
    if (!profile.date_of_birth) return 30 // default
    const today = new Date()
    const birthDate = new Date(profile.date_of_birth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const calculateBodyFat = () => {
    try {
      let bodyFat: number | null = null
      
      if (formData.method === 'navy' && formData.waist && formData.neck) {
        bodyFat = calculateNavyBodyFat(
          profile.gender as 'male' | 'female',
          parseFloat(formData.waist),
          parseFloat(formData.neck),
          profile.height!,
          formData.hip ? parseFloat(formData.hip) : undefined
        )
      } else if (formData.method === '3-site') {
        const age = calculateAge()
        if (profile.gender === 'male' && formData.chest && formData.abdominal && formData.thigh) {
          bodyFat = calculate3SiteBodyFat(
            'male',
            age,
            parseFloat(formData.chest),
            parseFloat(formData.abdominal),
            parseFloat(formData.thigh)
          )
        } else if (profile.gender === 'female' && formData.tricep && formData.suprailiac && formData.thigh) {
          bodyFat = calculate3SiteBodyFat(
            'female',
            age,
            undefined,
            undefined,
            parseFloat(formData.thigh),
            parseFloat(formData.tricep),
            parseFloat(formData.suprailiac)
          )
        }
      }
      
      setFormData(prev => ({ ...prev, body_fat_percentage: bodyFat }))
    } catch (error) {
      console.error('Error calculating body fat:', error)
    }
  }

  const handleSubmit = async () => {
    if (!user) return
    
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      let photoUrl = null
      
      // Upload photo if present
      if (formData.photo) {
        const fileName = `${user.id}/${Date.now()}-progress.jpg`
        const { publicUrl, error: uploadError } = await uploadToStorage(
          'photos',
          fileName,
          formData.photo,
          { contentType: formData.photo.type }
        )
        
        if (uploadError) {
          throw new Error('Failed to upload photo')
        }
        
        photoUrl = publicUrl
      }
      
      // Convert weight to kg for storage
      const weightInKg = formData.weight_unit === 'lbs' 
        ? parseFloat(formData.weight) / 2.20462 
        : parseFloat(formData.weight)
      
      // Save body metrics
      const { error } = await supabase
        .from('body_metrics')
        .insert({
          user_id: user.id,
          date: format(new Date(), 'yyyy-MM-dd'),
          weight: weightInKg,
          weight_unit: 'kg', // Always store in kg
          body_fat_percentage: formData.body_fat_percentage,
          body_fat_method: formData.method === 'simple' ? 'manual' : formData.method,
          lean_body_mass: formData.body_fat_percentage 
            ? weightInKg * (1 - formData.body_fat_percentage / 100) 
            : null,
          waist: formData.waist ? parseFloat(formData.waist) : null,
          neck: formData.neck ? parseFloat(formData.neck) : null,
          hip: formData.hip ? parseFloat(formData.hip) : null,
          notes: formData.notes || null,
          photo_url: photoUrl
        })
      
      if (error) throw error
      
      toast({
        title: "Success!",
        description: "Your metrics have been logged successfully."
      })
      
      // Clean up photo preview
      if (formData.photoPreview) {
        URL.revokeObjectURL(formData.photoPreview)
      }
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Submit error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save metrics. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFFMIData = () => {
    if (!formData.weight || !formData.body_fat_percentage || !profile.height) return null
    const weight = formData.weight_unit === 'lbs' 
      ? parseFloat(formData.weight) / 2.20462 
      : parseFloat(formData.weight)
    return calculateFFMI(weight, profile.height, formData.body_fat_percentage)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingPhoto(true)
    try {
      // Check browser support
      const support = checkBrowserSupport()
      if (!support.supported) {
        toast({
          title: "Browser not supported",
          description: support.message,
          variant: "destructive"
        })
        return
      }

      // Validate the file
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        toast({
          title: "Invalid file",
          description: validation.error,
          variant: "destructive"
        })
        return
      }

      // Compress the image
      const compressedBlob = await compressImage(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      })

      // Create compressed file
      const compressedFile = new File([compressedBlob], file.name, {
        type: compressedBlob.type,
        lastModified: Date.now()
      })

      // Create preview URL
      const previewUrl = URL.createObjectURL(compressedFile)
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        photo: compressedFile,
        photoPreview: previewUrl
      }))

      toast({
        title: "Photo ready",
        description: "Your photo has been processed and is ready to upload."
      })
    } catch (error) {
      const message = getUploadErrorMessage(error)
      toast({
        title: "Photo processing failed",
        description: message,
        variant: "destructive"
      })
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const removePhoto = () => {
    if (formData.photoPreview) {
      URL.revokeObjectURL(formData.photoPreview)
    }
    setFormData(prev => ({
      ...prev,
      photo: null,
      photoPreview: null
    }))
  }

  const getBodyComposition = () => {
    if (!formData.weight || !formData.body_fat_percentage) return null
    const weight = formData.weight_unit === 'lbs' 
      ? parseFloat(formData.weight) / 2.20462 
      : parseFloat(formData.weight)
    return calculateBodyComposition(weight, formData.body_fat_percentage)
  }

  const ffmiData = getFFMIData()
  const bodyComp = getBodyComposition()

  return (
    <div className="min-h-screen bg-linear-bg">
      {/* Header */}
      <header className="bg-linear-card shadow-sm border-b border-linear-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-linear-text">Log Metrics</h1>
            </div>
            <span className="text-sm text-linear-text-secondary">
              {format(new Date(), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-linear-card border-b border-linear-border">
        <div className="container mx-auto px-4 py-3">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2">
            {STEPS.map((step, index) => (
              <span
                key={step}
                className={`text-xs ${
                  index <= currentStepIndex
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="bg-linear-card border-linear-border">
          {/* Weight Step */}
          {currentStep === 'weight' && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-linear-purple/10 flex items-center justify-center">
                    <Scale className="h-5 w-5 text-linear-text" />
                  </div>
                  <div>
                    <CardTitle className="text-linear-text">Current Weight</CardTitle>
                    <CardDescription className="text-linear-text-secondary">
                      What's your weight today?
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Weight Display */}
                <div className="text-center py-8">
                  {formData.weight ? (
                    <div>
                      <div className="text-5xl font-bold text-linear-text mb-2">
                        {formData.weight}
                      </div>
                      <div className="text-lg text-linear-text-secondary">
                        {formData.weight_unit}
                      </div>
                    </div>
                  ) : (
                    <div className="text-2xl text-linear-text-secondary">
                      Tap to set weight
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full h-16 text-lg"
                    onClick={() => setShowWeightModal(true)}
                  >
                    <Scale className="h-5 w-5 mr-3" />
                    {formData.weight ? 'Change Weight' : 'Set Weight'}
                  </Button>

                  {/* Unit Toggle */}
                  <div className="flex justify-center">
                    <ToggleGroup
                      type="single"
                      value={formData.weight_unit}
                      onValueChange={(value) => {
                        if (value) setFormData(prev => ({ ...prev, weight_unit: value as 'kg' | 'lbs' }))
                      }}
                    >
                      <ToggleGroupItem value="kg" className="data-[state=on]:bg-linear-purple data-[state=on]:text-white">
                        kg
                      </ToggleGroupItem>
                      <ToggleGroupItem value="lbs" className="data-[state=on]:bg-linear-purple data-[state=on]:text-white">
                        lbs
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>
                
                <Separator className="bg-linear-border" />
                
                <div className="pt-2">
                  <Button 
                    onClick={() => setCurrentStep('review')}
                    variant="ghost"
                    className="text-linear-text-secondary w-full"
                  >
                    Skip body composition →
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Method Step */}
          {currentStep === 'method' && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-linear-purple/10 flex items-center justify-center">
                    <Calculator className="h-5 w-5 text-linear-text" />
                  </div>
                  <div>
                    <CardTitle className="text-linear-text">Measurement Method</CardTitle>
                    <CardDescription className="text-linear-text-secondary">
                      How would you like to measure body fat?
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.method}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, method: value as 'simple' | 'navy' | '3-site' | '7-site' }))}
                  className="space-y-3"
                >
                  <label
                    htmlFor="method-simple"
                    className="flex items-center space-x-3 p-4 rounded-lg border border-linear-border cursor-pointer hover:bg-linear-card/50"
                  >
                    <RadioGroupItem value="simple" id="method-simple" />
                    <div className="flex-1">
                      <p className="font-medium text-linear-text">Simple Entry</p>
                      <p className="text-sm text-linear-text-secondary">
                        Enter your body fat % directly
                      </p>
                    </div>
                  </label>
                  
                  <label
                    htmlFor="method-navy"
                    className="flex items-center space-x-3 p-4 rounded-lg border border-linear-border cursor-pointer hover:bg-linear-card/50"
                  >
                    <RadioGroupItem value="navy" id="method-navy" />
                    <div className="flex-1">
                      <p className="font-medium text-linear-text">Navy Method</p>
                      <p className="text-sm text-linear-text-secondary">
                        Tape measurements (±3% accuracy)
                      </p>
                    </div>
                  </label>
                  
                  <label
                    htmlFor="method-3site"
                    className="flex items-center space-x-3 p-4 rounded-lg border border-linear-border cursor-pointer hover:bg-linear-card/50"
                  >
                    <RadioGroupItem value="3-site" id="method-3site" />
                    <div className="flex-1">
                      <p className="font-medium text-linear-text">3-Site Skinfold</p>
                      <p className="text-sm text-linear-text-secondary">
                        Caliper measurements (±2% accuracy)
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </CardContent>
            </>
          )}

          {/* Measurements Step */}
          {currentStep === 'measurements' && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-linear-purple/10 flex items-center justify-center">
                    <Ruler className="h-5 w-5 text-linear-text" />
                  </div>
                  <div>
                    <CardTitle className="text-linear-text">Take Measurements</CardTitle>
                    <CardDescription className="text-linear-text-secondary">
                      {formData.method === 'simple' && 'Enter your body fat percentage'}
                      {formData.method === 'navy' && 'Measure with a tape measure'}
                      {formData.method === '3-site' && 'Measure with body fat calipers'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.method === 'simple' && (
                  <div className="space-y-2">
                    <Label htmlFor="bodyFat" className="text-linear-text">Body Fat %</Label>
                    <Input
                      id="bodyFat"
                      type="number"
                      step="0.1"
                      value={formData.body_fat_percentage || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        body_fat_percentage: e.target.value ? parseFloat(e.target.value) : null 
                      }))}
                      className="bg-linear-bg border-linear-border text-linear-text"
                      placeholder="15.0"
                    />
                  </div>
                )}

                {formData.method === 'navy' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="neck" className="text-linear-text">Neck (in)</Label>
                      <Input
                        id="neck"
                        type="number"
                        step="0.1"
                        value={formData.neck}
                        onChange={(e) => setFormData(prev => ({ ...prev, neck: e.target.value }))}
                        className="bg-linear-bg border-linear-border text-linear-text"
                        placeholder="15.0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="waist" className="text-linear-text">Waist (in)</Label>
                      <Input
                        id="waist"
                        type="number"
                        step="0.1"
                        value={formData.waist}
                        onChange={(e) => setFormData(prev => ({ ...prev, waist: e.target.value }))}
                        className="bg-linear-bg border-linear-border text-linear-text"
                        placeholder="33.5"
                      />
                      <p className="text-xs text-linear-text-tertiary">
                        Measure at navel level
                      </p>
                    </div>
                    
                    {profile.gender === 'female' && (
                      <div className="space-y-2">
                        <Label htmlFor="hip" className="text-linear-text">Hip (in)</Label>
                        <Input
                          id="hip"
                          type="number"
                          step="0.1"
                          value={formData.hip}
                          onChange={(e) => setFormData(prev => ({ ...prev, hip: e.target.value }))}
                          className="bg-linear-bg border-linear-border text-linear-text"
                          placeholder="37.5"
                        />
                        <p className="text-xs text-linear-text-tertiary">
                          Measure at widest point
                        </p>
                      </div>
                    )}
                  </>
                )}

                {formData.method === '3-site' && profile.gender === 'male' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="chest" className="text-linear-text">Chest (mm)</Label>
                      <Input
                        id="chest"
                        type="number"
                        step="0.1"
                        value={formData.chest}
                        onChange={(e) => setFormData(prev => ({ ...prev, chest: e.target.value }))}
                        className="bg-linear-bg border-linear-border text-linear-text"
                        placeholder="10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="abdominal" className="text-linear-text">Abdominal (mm)</Label>
                      <Input
                        id="abdominal"
                        type="number"
                        step="0.1"
                        value={formData.abdominal}
                        onChange={(e) => setFormData(prev => ({ ...prev, abdominal: e.target.value }))}
                        className="bg-linear-bg border-linear-border text-linear-text"
                        placeholder="20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="thigh" className="text-linear-text">Thigh (mm)</Label>
                      <Input
                        id="thigh"
                        type="number"
                        step="0.1"
                        value={formData.thigh}
                        onChange={(e) => setFormData(prev => ({ ...prev, thigh: e.target.value }))}
                        className="bg-linear-bg border-linear-border text-linear-text"
                        placeholder="15"
                      />
                    </div>
                  </>
                )}

                {formData.method === '3-site' && profile.gender === 'female' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="tricep" className="text-linear-text">Tricep (mm)</Label>
                      <Input
                        id="tricep"
                        type="number"
                        step="0.1"
                        value={formData.tricep}
                        onChange={(e) => setFormData(prev => ({ ...prev, tricep: e.target.value }))}
                        className="bg-linear-bg border-linear-border text-linear-text"
                        placeholder="15"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="suprailiac" className="text-linear-text">Suprailiac (mm)</Label>
                      <Input
                        id="suprailiac"
                        type="number"
                        step="0.1"
                        value={formData.suprailiac}
                        onChange={(e) => setFormData(prev => ({ ...prev, suprailiac: e.target.value }))}
                        className="bg-linear-bg border-linear-border text-linear-text"
                        placeholder="20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="thigh" className="text-linear-text">Thigh (mm)</Label>
                      <Input
                        id="thigh"
                        type="number"
                        step="0.1"
                        value={formData.thigh}
                        onChange={(e) => setFormData(prev => ({ ...prev, thigh: e.target.value }))}
                        className="bg-linear-bg border-linear-border text-linear-text"
                        placeholder="25"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </>
          )}

          {/* Photo Step */}
          {currentStep === 'photo' && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-linear-purple/10 flex items-center justify-center">
                    <Camera className="h-5 w-5 text-linear-text" />
                  </div>
                  <div>
                    <CardTitle className="text-linear-text">Progress Photo</CardTitle>
                    <CardDescription className="text-linear-text-secondary">
                      Document your progress visually (optional)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!formData.photoPreview ? (
                  <div className="text-center py-12 border-2 border-dashed border-linear-border rounded-lg">
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={isUploadingPhoto}
                    />
                    <Camera className="h-12 w-12 text-linear-text-tertiary mx-auto mb-4" />
                    <p className="text-linear-text-secondary mb-4">
                      {isUploadingPhoto ? 'Processing photo...' : 'No photo added'}
                    </p>
                    <label htmlFor="photo-upload">
                      <Button 
                        variant="outline" 
                        className="border-linear-border"
                        disabled={isUploadingPhoto}
                        asChild
                      >
                        <span>
                          <Camera className="h-4 w-4 mr-2" />
                          {isUploadingPhoto ? 'Processing...' : 'Choose Photo'}
                        </span>
                      </Button>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-linear-border">
                      <Image
                        src={formData.photoPreview}
                        alt="Progress photo"
                        fill
                        className="object-cover"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={removePhoto}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-center text-linear-text-secondary">
                      Photo ready to upload
                    </p>
                  </div>
                )}
              </CardContent>
            </>
          )}

          {/* Review Step */}
          {currentStep === 'review' && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-linear-purple/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-linear-text" />
                  </div>
                  <div>
                    <CardTitle className="text-linear-text">Review & Save</CardTitle>
                    <CardDescription className="text-linear-text-secondary">
                      Confirm your measurements
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-linear-text-secondary">Date</span>
                    <span className="font-medium text-linear-text">
                      {format(new Date(), 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                  
                  <Separator className="bg-linear-border" />
                  
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-linear-text-secondary">Weight</span>
                    <span className="font-medium text-linear-text">
                      {formData.weight} {formData.weight_unit}
                    </span>
                  </div>
                  
                  {formData.body_fat_percentage && (
                    <>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-linear-text-secondary">Body Fat %</span>
                        <span className="font-medium text-linear-text">
                          {formData.body_fat_percentage.toFixed(1)}%
                        </span>
                      </div>
                      
                      {bodyComp && (
                        <>
                          <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-linear-text-secondary">Lean Mass</span>
                            <span className="font-medium text-linear-text">
                              {(formData.weight_unit === 'lbs' 
                                ? bodyComp.lean_mass * 2.20462 
                                : bodyComp.lean_mass
                              ).toFixed(1)} {formData.weight_unit}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-linear-text-secondary">Fat Mass</span>
                            <span className="font-medium text-linear-text">
                              {(formData.weight_unit === 'lbs' 
                                ? bodyComp.fat_mass * 2.20462 
                                : bodyComp.fat_mass
                              ).toFixed(1)} {formData.weight_unit}
                            </span>
                          </div>
                        </>
                      )}
                      
                      {ffmiData && (
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-linear-text-secondary">FFMI</span>
                          <span className="font-medium text-linear-text">
                            {ffmiData.normalized_ffmi}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Photo Preview */}
                {formData.photoPreview && (
                  <div className="space-y-2">
                    <Label className="text-linear-text">Progress Photo</Label>
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-linear-border max-w-xs mx-auto">
                      <Image
                        src={formData.photoPreview}
                        alt="Progress photo"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-linear-text">Notes (optional)</Label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 bg-linear-bg border border-linear-border text-linear-text rounded-md resize-none"
                    placeholder="Any notes about today's measurement..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* Footer Actions */}
          <div className="p-6 border-t border-linear-border flex justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {currentStep === 'review' ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.weight}
                className="bg-linear-purple hover:bg-linear-purple/80 text-white"
              >
                {isSubmitting ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 animate-pulse" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Entry
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 'weight' && !formData.weight) ||
                  (currentStep === 'measurements' && formData.method !== 'simple' && 
                    ((formData.method === 'navy' && (!formData.waist || !formData.neck)) ||
                     (formData.method === '3-site' && profile.gender === 'male' && 
                      (!formData.chest || !formData.abdominal || !formData.thigh))))
                }
                className="bg-linear-purple hover:bg-linear-purple/80 text-white"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </main>

      {/* Weight Modal */}
      <Dialog open={showWeightModal} onOpenChange={setShowWeightModal}>
        <DialogContent className="bg-linear-card border-linear-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-linear-text text-center">Set Weight</DialogTitle>
          </DialogHeader>
          <div className="py-8">
            <WeightWheelPicker
              weight={parseFloat(formData.weight) || 70}
              unit={formData.weight_unit}
              onWeightChange={(weight) => {
                setFormData(prev => ({ ...prev, weight: weight.toFixed(1) }))
              }}
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowWeightModal(false)}
              className="flex-1 border-linear-border"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowWeightModal(false)
                if (currentStep === 'weight' && formData.weight) {
                  setCurrentStep('method')
                }
              }}
              className="flex-1 bg-linear-purple hover:bg-linear-purple/80"
              disabled={!formData.weight}
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Body Fat Modal */}
      <Dialog open={showBodyFatModal} onOpenChange={setShowBodyFatModal}>
        <DialogContent className="bg-linear-card border-linear-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-linear-text text-center">Set Body Fat %</DialogTitle>
          </DialogHeader>
          <div className="py-8">
            <BodyFatWheelPicker
              bodyFat={formData.body_fat_percentage || 20}
              onBodyFatChange={(bf) => {
                setFormData(prev => ({ ...prev, body_fat_percentage: bf }))
              }}
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowBodyFatModal(false)}
              className="flex-1 border-linear-border"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowBodyFatModal(false)
              }}
              className="flex-1 bg-linear-purple hover:bg-linear-purple/80"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}