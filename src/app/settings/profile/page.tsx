'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { debounce } from 'lodash'
import { getProfile, updateProfile } from '@/lib/supabase/profile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/hooks/use-toast'
import { 
  Loader2, 
  ArrowLeft,
  Camera,
  Calendar,
  Ruler,
  Check
} from 'lucide-react'
import Link from 'next/link'
import { UserProfile } from '@/types/body-metrics'
import { HeightWheelPicker, DateWheelPicker } from '@/components/ui/wheel-picker'
import { format, parseISO } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export default function ProfileSettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showHeightModal, setShowHeightModal] = useState(false)
  const [showDOBModal, setShowDOBModal] = useState(false)
  
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    email: user?.email || '',
    full_name: '',
    username: '',
    height: 71,
    height_unit: 'ft',
    gender: 'male',
    date_of_birth: '',
    bio: '',
    activity_level: 'moderately_active'
  })

  // For wheel pickers
  const [heightInCm, setHeightInCm] = useState(180) // Default height in cm
  const [dateOfBirthDate, setDateOfBirthDate] = useState(new Date(1990, 0, 1)) // Default date

  // Initialize height in cm from profile
  useEffect(() => {
    if (profile.height && profile.height_unit) {
      if (profile.height_unit === 'cm') {
        setHeightInCm(profile.height)
      } else {
        // Convert feet/inches to cm
        const totalInches = profile.height
        setHeightInCm(Math.round(totalInches * 2.54))
      }
    }
  }, [profile.height, profile.height_unit])

  // Initialize date from profile
  useEffect(() => {
    if (profile.date_of_birth) {
      try {
        const date = parseISO(profile.date_of_birth)
        setDateOfBirthDate(date)
      } catch {
        // Invalid date
      }
    }
  }, [profile.date_of_birth])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Load profile data
  useEffect(() => {
    if (user) {
      getProfile(user.id).then((profileData) => {
        if (profileData) {
          setProfile({
            email: profileData.email,
            full_name: profileData.full_name || '',
            username: profileData.username || '',
            height: profileData.height || 71,
            height_unit: profileData.height_unit || 'ft',
            gender: profileData.gender || 'male',
            date_of_birth: profileData.date_of_birth || '',
            bio: profileData.bio || '',
            activity_level: profileData.activity_level || 'moderately_active',
            avatar_url: profileData.avatar_url
          })
        }
      })
    }
  }, [user])

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

  // Auto-save function
  const saveProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    if (!user) return
    
    setIsSaving(true)
    try {
      await updateProfile(user.id, profileData)
      setLastSaved(new Date())
      
      // Show subtle feedback instead of toast for auto-save
      // Only show toast for errors
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }, [user])

  // Debounced auto-save
  const debouncedSave = useCallback(
    debounce((profileData: Partial<UserProfile>) => {
      saveProfile(profileData)
    }, 1000),
    [saveProfile]
  )

  const updateLocalProfile = (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates }
    setProfile(newProfile)
    debouncedSave(newProfile)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatHeight = () => {
    if (!profile.height) return 'Not set'
    
    if (profile.height_unit === 'cm') {
      return `${profile.height} cm`
    } else {
      const feet = Math.floor(profile.height / 12)
      const inches = profile.height % 12
      return `${feet}'${inches}"`
    }
  }

  const formatDOB = () => {
    if (!profile.date_of_birth) return 'Not set'
    try {
      const date = parseISO(profile.date_of_birth)
      return format(date, 'MMM d, yyyy')
    } catch {
      return 'Not set'
    }
  }

  const calculateAge = () => {
    if (!profile.date_of_birth) return null
    try {
      const date = parseISO(profile.date_of_birth)
      const today = new Date()
      let age = today.getFullYear() - date.getFullYear()
      const monthDiff = today.getMonth() - date.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
        age--
      }
      return age
    } catch {
      return null
    }
  }

  return (
    <div className="min-h-screen bg-linear-bg">
      {/* Header */}
      <header className="bg-linear-card shadow-sm border-b border-linear-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/settings">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-linear-text">Profile</h1>
            </div>
            <div className="text-sm text-linear-text-secondary">
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </span>
              ) : lastSaved ? (
                <span className="flex items-center gap-2">
                  <Check className="h-3 w-3" />
                  Saved
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Basic Profile - Static Information */}
        <Card className="bg-linear-card border-linear-border">
          <CardHeader>
            <CardTitle className="text-linear-text">Basic Information</CardTitle>
            <CardDescription className="text-linear-text-secondary">
              Your personal details and account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture and Name Section */}
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-linear-purple/10 text-linear-text text-lg">
                  {getInitials(profile.full_name || user.email || 'U')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-linear-text">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profile.full_name || ''}
                    onChange={(e) => updateLocalProfile({ full_name: e.target.value })}
                    className="bg-linear-bg border-linear-border text-linear-text"
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-linear-text">Email</Label>
                  <Input
                    id="email"
                    value={profile.email || user.email || ''}
                    disabled
                    className="bg-linear-bg border-linear-border text-linear-text-secondary"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-linear-border" />

            {/* Static Physical Attributes */}
            <div className="space-y-4">
              {/* Biological Sex */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-linear-text">Biological Sex</Label>
                  <p className="text-sm text-linear-text-secondary">Used for body composition calculations</p>
                </div>
                <ToggleGroup 
                  type="single" 
                  value={profile.gender || 'male'}
                  onValueChange={(value) => {
                    if (value) updateLocalProfile({ gender: value as 'male' | 'female' })
                  }}
                >
                  <ToggleGroupItem 
                    value="male" 
                    className="data-[state=on]:bg-linear-purple data-[state=on]:text-white"
                  >
                    Male
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="female"
                    className="data-[state=on]:bg-linear-purple data-[state=on]:text-white"
                  >
                    Female
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Date of Birth */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-linear-text">Date of Birth</Label>
                  <p className="text-sm text-linear-text-secondary">
                    {formatDOB()}
                    {calculateAge() && ` • ${calculateAge()} years old`}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDOBModal(true)}
                  className="border-linear-border text-linear-text hover:bg-linear-card"
                >
                  {profile.date_of_birth ? 'Change' : 'Set'}
                </Button>
              </div>

              {/* Height */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-linear-text">Height</Label>
                  <p className="text-sm text-linear-text-secondary">{formatHeight()}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHeightModal(true)}
                  className="border-linear-border text-linear-text hover:bg-linear-card"
                >
                  {profile.height ? 'Change' : 'Set'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity & Lifestyle - Semi-static */}
        <Card className="bg-linear-card border-linear-border">
          <CardHeader>
            <CardTitle className="text-linear-text">Activity & Lifestyle</CardTitle>
            <CardDescription className="text-linear-text-secondary">
              Your typical activity patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activityLevel" className="text-linear-text">Activity Level</Label>
              <Select 
                value={profile.activity_level || ''} 
                onValueChange={(value) => updateLocalProfile({ activity_level: value as UserProfile['activity_level'] })}
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

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-linear-text">Bio</Label>
              <textarea
                id="bio"
                value={profile.bio || ''}
                onChange={(e) => updateLocalProfile({ bio: e.target.value })}
                className="w-full px-3 py-2 bg-linear-bg border border-linear-border text-linear-text rounded-md resize-none"
                placeholder="Share your fitness goals and journey..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Options */}
        <Card className="bg-linear-card border-linear-border">
          <CardHeader>
            <CardTitle className="text-linear-text">Additional Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-linear-text">Username</Label>
              <Input
                id="username"
                value={profile.username || ''}
                onChange={(e) => updateLocalProfile({ username: e.target.value })}
                className="bg-linear-bg border-linear-border text-linear-text"
                placeholder="@johndoe"
              />
              <p className="text-xs text-linear-text-tertiary">
                Your unique username for sharing your profile
              </p>
            </div>

            <div className="pt-2">
              <Button variant="outline" className="border-linear-border w-full">
                <Camera className="h-4 w-4 mr-2" />
                Change Profile Photo
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Date of Birth Modal */}
      <Dialog open={showDOBModal} onOpenChange={setShowDOBModal}>
        <DialogContent className="bg-linear-card border-linear-border">
          <DialogHeader>
            <DialogTitle className="text-linear-text">Set Date of Birth</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <DateWheelPicker
              date={dateOfBirthDate}
              onDateChange={(date) => {
                setDateOfBirthDate(date)
                updateLocalProfile({ date_of_birth: format(date, 'yyyy-MM-dd') })
              }}
              className="bg-linear-bg rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDOBModal(false)}
              className="border-linear-border"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowDOBModal(false)}
              className="bg-linear-purple hover:bg-linear-purple/80"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Height Modal */}
      <Dialog open={showHeightModal} onOpenChange={setShowHeightModal}>
        <DialogContent className="bg-linear-card border-linear-border">
          <DialogHeader>
            <DialogTitle className="text-linear-text">Set Height</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Unit Toggle */}
            <div className="flex justify-center">
              <ToggleGroup 
                type="single" 
                value={profile.height_unit || 'cm'}
                onValueChange={(value) => {
                  if (value) {
                    const newUnit = value as 'cm' | 'ft'
                    // Convert height when changing units
                    if (newUnit === 'ft' && profile.height_unit === 'cm') {
                      // Converting from cm to inches
                      const totalInches = Math.round(heightInCm / 2.54)
                      updateLocalProfile({ height: totalInches, height_unit: newUnit })
                    } else if (newUnit === 'cm' && profile.height_unit === 'ft') {
                      // Converting from inches to cm
                      updateLocalProfile({ height: heightInCm, height_unit: newUnit })
                    } else {
                      updateLocalProfile({ height_unit: newUnit })
                    }
                  }
                }}
              >
                <ToggleGroupItem 
                  value="cm" 
                  className="data-[state=on]:bg-linear-purple data-[state=on]:text-white"
                >
                  Metric (cm)
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="ft"
                  className="data-[state=on]:bg-linear-purple data-[state=on]:text-white"
                >
                  Imperial (ft/in)
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Height Picker */}
            <HeightWheelPicker
              heightInCm={heightInCm}
              units={profile.height_unit === 'ft' ? 'imperial' : 'metric'}
              onHeightChange={(newHeightInCm) => {
                setHeightInCm(newHeightInCm)
                // Update profile height based on unit
                if (profile.height_unit === 'ft') {
                  const totalInches = Math.round(newHeightInCm / 2.54)
                  updateLocalProfile({ height: totalInches })
                } else {
                  updateLocalProfile({ height: newHeightInCm })
                }
              }}
              className="bg-linear-bg rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowHeightModal(false)}
              className="border-linear-border"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowHeightModal(false)}
              className="bg-linear-purple hover:bg-linear-purple/80"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}