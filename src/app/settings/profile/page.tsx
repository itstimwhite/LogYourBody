'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
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
  Save
} from 'lucide-react'
import Link from 'next/link'
import { UserProfile } from '@/types/body-metrics'
import { HeightWheelPicker, DateWheelPicker } from '@/components/ui/wheel-picker'
import { format, parseISO } from 'date-fns'

export default function ProfileSettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
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

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      })
      setHasChanges(false)
    } catch {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
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
            {hasChanges && (
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="bg-linear-purple hover:bg-linear-purple/80 text-white"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Profile Picture */}
        <Card className="bg-linear-card border-linear-border">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-linear-purple/10 text-linear-text text-xl">
                  {getInitials(profile.full_name || user.email || 'U')}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" className="border-linear-border">
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
              <p className="text-xs text-linear-text-tertiary mt-2">
                JPG, GIF or PNG. Max size 5MB.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="bg-linear-card border-linear-border">
          <CardHeader>
            <CardTitle className="text-linear-text">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-linear-text">Full Name</Label>
              <Input
                id="fullName"
                value={profile.full_name || ''}
                onChange={(e) => updateProfile({ full_name: e.target.value })}
                className="bg-linear-bg border-linear-border text-linear-text"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-linear-text">Username</Label>
              <Input
                id="username"
                value={profile.username || ''}
                onChange={(e) => updateProfile({ username: e.target.value })}
                className="bg-linear-bg border-linear-border text-linear-text"
                placeholder="johndoe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-linear-text">Bio</Label>
              <textarea
                id="bio"
                value={profile.bio || ''}
                onChange={(e) => updateProfile({ bio: e.target.value })}
                className="w-full px-3 py-2 bg-linear-bg border border-linear-border text-linear-text rounded-md resize-none"
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Physical Attributes */}
        <Card className="bg-linear-card border-linear-border">
          <CardHeader>
            <CardTitle className="text-linear-text">Physical Attributes</CardTitle>
            <CardDescription className="text-linear-text-secondary">
              Used for accurate calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-linear-text">Date of Birth</Label>
              <DateWheelPicker
                date={dateOfBirthDate}
                onDateChange={(date) => {
                  setDateOfBirthDate(date)
                  updateProfile({ date_of_birth: format(date, 'yyyy-MM-dd') })
                }}
                className="bg-linear-bg rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="text-linear-text">Gender</Label>
              <Select 
                value={profile.gender || ''} 
                onValueChange={(value) => updateProfile({ gender: value as 'male' | 'female' | 'other' })}
              >
                <SelectTrigger className="bg-linear-bg border-linear-border text-linear-text">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-linear-text">Height</Label>
              <HeightWheelPicker
                heightInCm={heightInCm}
                units={profile.height_unit === 'ft' ? 'imperial' : 'metric'}
                onHeightChange={(newHeightInCm) => {
                  setHeightInCm(newHeightInCm)
                  // Update profile height based on unit
                  if (profile.height_unit === 'ft') {
                    const totalInches = Math.round(newHeightInCm / 2.54)
                    updateProfile({ height: totalInches })
                  } else {
                    updateProfile({ height: newHeightInCm })
                  }
                }}
                className="bg-linear-bg rounded-lg"
              />
              <div className="flex justify-end mt-2">
                <Select 
                  value={profile.height_unit || 'cm'} 
                  onValueChange={(value) => {
                    const newUnit = value as 'cm' | 'ft'
                    // Convert height when changing units
                    if (newUnit === 'ft' && profile.height_unit === 'cm') {
                      // Converting from cm to inches
                      const totalInches = Math.round(heightInCm / 2.54)
                      updateProfile({ height: totalInches, height_unit: newUnit })
                    } else if (newUnit === 'cm' && profile.height_unit === 'ft') {
                      // Converting from inches to cm
                      updateProfile({ height: heightInCm, height_unit: newUnit })
                    } else {
                      updateProfile({ height_unit: newUnit })
                    }
                  }}
                >
                  <SelectTrigger className="bg-linear-bg border-linear-border text-linear-text w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">Metric (cm)</SelectItem>
                    <SelectItem value="ft">Imperial (ft/in)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityLevel" className="text-linear-text">Activity Level</Label>
              <Select 
                value={profile.activity_level || ''} 
                onValueChange={(value) => updateProfile({ activity_level: value as UserProfile['activity_level'] })}
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
      </main>
    </div>
  )
}