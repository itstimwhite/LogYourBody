'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/hooks/use-toast'
import { 
  Loader2, 
  User, 
  Shield, 
  Bell, 
  Smartphone,
  Moon,
  Sun,
  Globe,
  ArrowLeft,
  Camera,
  Mail,
  Lock,
  Calendar,
  Ruler,
  Weight,
  Save,
  AlertCircle,
  Check,
  X
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { UserProfile, UserSettings } from '@/types/body-metrics'

export default function SettingsPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [currentTab, setCurrentTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Profile state
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    email: user?.email || '',
    full_name: '',
    username: '',
    height: 180,
    height_unit: 'cm',
    gender: 'male',
    date_of_birth: '',
    bio: '',
    settings: {
      units: {
        weight: 'kg',
        height: 'cm',
        measurements: 'cm'
      },
      notifications: {
        daily_reminder: true,
        reminder_time: '09:00',
        weekly_report: true,
        progress_milestones: true
      },
      privacy: {
        public_profile: false,
        show_progress_photos: false
      },
      theme: 'dark'
    }
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-bg">
        <Loader2 className="h-8 w-8 animate-spin text-linear-text-secondary" aria-label="Loading" />
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

  const updateSettings = (path: string, value: any) => {
    setProfile(prev => {
      const newProfile = { ...prev }
      const keys = path.split('.')
      let current: any = newProfile.settings
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newProfile
    })
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully."
      })
      setHasChanges(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
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
      <header className="bg-linear-card shadow-sm border-b border-linear-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-linear-text">Settings</h1>
            </div>
            <div className="flex items-center gap-4">
              {hasChanges && (
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-linear-purple hover:bg-linear-purple/80 text-white"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="bg-linear-card border border-linear-border w-full justify-start">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <Shield className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Globe className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Profile Picture */}
            <Card className="bg-linear-card border-linear-border">
              <CardHeader>
                <CardTitle className="text-linear-text">Profile Picture</CardTitle>
                <CardDescription className="text-linear-text-secondary">
                  Update your profile picture and display name
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="bg-linear-purple/10 text-linear-text text-xl">
                      {getInitials(profile.full_name || user.email || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" className="border-linear-border">
                      <Camera className="h-4 w-4 mr-2" />
                      Change Picture
                    </Button>
                    <p className="text-xs text-linear-text-tertiary">
                      JPG, GIF or PNG. Max size 5MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="bg-linear-card border-linear-border">
              <CardHeader>
                <CardTitle className="text-linear-text">Personal Information</CardTitle>
                <CardDescription className="text-linear-text-secondary">
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <Separator className="bg-linear-border" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-linear-text">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profile.date_of_birth || ''}
                      onChange={(e) => updateProfile({ date_of_birth: e.target.value })}
                      className="bg-linear-bg border-linear-border text-linear-text"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-linear-text">Gender</Label>
                    <Select 
                      value={profile.gender || ''} 
                      onValueChange={(value) => updateProfile({ gender: value as any })}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-linear-text">Height</Label>
                    <div className="flex gap-2">
                      <Input
                        id="height"
                        type="number"
                        value={profile.height || ''}
                        onChange={(e) => updateProfile({ height: parseInt(e.target.value) })}
                        className="bg-linear-bg border-linear-border text-linear-text"
                        placeholder="180"
                      />
                      <Select 
                        value={profile.height_unit || 'cm'} 
                        onValueChange={(value) => updateProfile({ height_unit: value as any })}
                      >
                        <SelectTrigger className="bg-linear-bg border-linear-border text-linear-text w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cm">cm</SelectItem>
                          <SelectItem value="ft">ft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activityLevel" className="text-linear-text">Activity Level</Label>
                    <Select 
                      value={profile.activity_level || ''} 
                      onValueChange={(value) => updateProfile({ activity_level: value as any })}
                    >
                      <SelectTrigger className="bg-linear-bg border-linear-border text-linear-text">
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="lightly_active">Lightly Active</SelectItem>
                        <SelectItem value="moderately_active">Moderately Active</SelectItem>
                        <SelectItem value="very_active">Very Active</SelectItem>
                        <SelectItem value="extremely_active">Extremely Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            {/* Account Security */}
            <Card className="bg-linear-card border-linear-border">
              <CardHeader>
                <CardTitle className="text-linear-text">Account Security</CardTitle>
                <CardDescription className="text-linear-text-secondary">
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-linear-text">Email</p>
                      <p className="text-sm text-linear-text-secondary">{user.email}</p>
                    </div>
                    <Badge 
                      variant={user.email_confirmed_at ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {user.email_confirmed_at ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                  
                  <Separator className="bg-linear-border" />
                  
                  <div className="space-y-2">
                    <Button variant="outline" className="border-linear-border w-full justify-start">
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                    <Button variant="outline" className="border-linear-border w-full justify-start">
                      <Smartphone className="h-4 w-4 mr-2" />
                      Enable Two-Factor Authentication
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="bg-linear-card border-linear-border">
              <CardHeader>
                <CardTitle className="text-linear-text">Account Information</CardTitle>
                <CardDescription className="text-linear-text-secondary">
                  Your account details and subscription status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-linear-text-secondary">Account Created</span>
                    <span className="text-sm font-medium text-linear-text">
                      {user.created_at ? format(new Date(user.created_at), 'PPP') : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-linear-text-secondary">Subscription Status</span>
                    <Badge variant="secondary">Free Plan</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-linear-text-secondary">User ID</span>
                    <span className="text-xs font-mono text-linear-text-tertiary">
                      {user.id?.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-linear-card border-red-500/20">
              <CardHeader>
                <CardTitle className="text-red-500">Danger Zone</CardTitle>
                <CardDescription className="text-linear-text-secondary">
                  Irreversible actions for your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-red-500/20 bg-red-500/5">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-linear-text-secondary">
                    Once you delete your account, there is no going back. Please be certain.
                  </AlertDescription>
                </Alert>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            {/* Units & Measurements */}
            <Card className="bg-linear-card border-linear-border">
              <CardHeader>
                <CardTitle className="text-linear-text">Units & Measurements</CardTitle>
                <CardDescription className="text-linear-text-secondary">
                  Choose your preferred units of measurement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weightUnit" className="text-linear-text">Weight Unit</Label>
                    <Select 
                      value={profile.settings?.units?.weight || 'kg'} 
                      onValueChange={(value) => updateSettings('units.weight', value)}
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
                    <Label htmlFor="heightUnit" className="text-linear-text">Height Unit</Label>
                    <Select 
                      value={profile.settings?.units?.height || 'cm'} 
                      onValueChange={(value) => updateSettings('units.height', value)}
                    >
                      <SelectTrigger className="bg-linear-bg border-linear-border text-linear-text">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cm">Centimeters (cm)</SelectItem>
                        <SelectItem value="ft">Feet (ft)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="measurementUnit" className="text-linear-text">Measurements</Label>
                    <Select 
                      value={profile.settings?.units?.measurements || 'cm'} 
                      onValueChange={(value) => updateSettings('units.measurements', value)}
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
              </CardContent>
            </Card>

            {/* Theme */}
            <Card className="bg-linear-card border-linear-border">
              <CardHeader>
                <CardTitle className="text-linear-text">Appearance</CardTitle>
                <CardDescription className="text-linear-text-secondary">
                  Customize how the app looks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-linear-text">Theme</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {(['light', 'dark', 'system'] as const).map((theme) => (
                        <button
                          key={theme}
                          onClick={() => updateSettings('theme', theme)}
                          className={`
                            p-4 rounded-lg border-2 transition-colors
                            ${profile.settings?.theme === theme 
                              ? 'border-linear-purple bg-linear-purple/10' 
                              : 'border-linear-border hover:border-linear-text-tertiary'
                            }
                          `}
                        >
                          <div className="flex flex-col items-center gap-2">
                            {theme === 'light' && <Sun className="h-5 w-5 text-linear-text" />}
                            {theme === 'dark' && <Moon className="h-5 w-5 text-linear-text" />}
                            {theme === 'system' && <Smartphone className="h-5 w-5 text-linear-text" />}
                            <span className="text-sm font-medium text-linear-text capitalize">
                              {theme}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card className="bg-linear-card border-linear-border">
              <CardHeader>
                <CardTitle className="text-linear-text">Privacy</CardTitle>
                <CardDescription className="text-linear-text-secondary">
                  Control your privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="publicProfile" className="text-linear-text font-normal">
                      Public Profile
                    </Label>
                    <p className="text-sm text-linear-text-secondary">
                      Allow others to view your profile
                    </p>
                  </div>
                  <Switch
                    id="publicProfile"
                    checked={profile.settings?.privacy?.public_profile || false}
                    onCheckedChange={(checked) => updateSettings('privacy.public_profile', checked)}
                  />
                </div>
                
                <Separator className="bg-linear-border" />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showPhotos" className="text-linear-text font-normal">
                      Show Progress Photos
                    </Label>
                    <p className="text-sm text-linear-text-secondary">
                      Include photos in shared reports
                    </p>
                  </div>
                  <Switch
                    id="showPhotos"
                    checked={profile.settings?.privacy?.show_progress_photos || false}
                    onCheckedChange={(checked) => updateSettings('privacy.show_progress_photos', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            {/* Notification Preferences */}
            <Card className="bg-linear-card border-linear-border">
              <CardHeader>
                <CardTitle className="text-linear-text">Notification Preferences</CardTitle>
                <CardDescription className="text-linear-text-secondary">
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dailyReminder" className="text-linear-text font-normal">
                      Daily Reminder
                    </Label>
                    <p className="text-sm text-linear-text-secondary">
                      Get reminded to log your daily metrics
                    </p>
                  </div>
                  <Switch
                    id="dailyReminder"
                    checked={profile.settings?.notifications?.daily_reminder || false}
                    onCheckedChange={(checked) => updateSettings('notifications.daily_reminder', checked)}
                  />
                </div>
                
                {profile.settings?.notifications?.daily_reminder && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="reminderTime" className="text-linear-text text-sm">
                      Reminder Time
                    </Label>
                    <Input
                      id="reminderTime"
                      type="time"
                      value={profile.settings?.notifications?.reminder_time || '09:00'}
                      onChange={(e) => updateSettings('notifications.reminder_time', e.target.value)}
                      className="bg-linear-bg border-linear-border text-linear-text max-w-xs"
                    />
                  </div>
                )}
                
                <Separator className="bg-linear-border" />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weeklyReport" className="text-linear-text font-normal">
                      Weekly Report
                    </Label>
                    <p className="text-sm text-linear-text-secondary">
                      Receive a summary of your weekly progress
                    </p>
                  </div>
                  <Switch
                    id="weeklyReport"
                    checked={profile.settings?.notifications?.weekly_report || false}
                    onCheckedChange={(checked) => updateSettings('notifications.weekly_report', checked)}
                  />
                </div>
                
                <Separator className="bg-linear-border" />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="milestones" className="text-linear-text font-normal">
                      Progress Milestones
                    </Label>
                    <p className="text-sm text-linear-text-secondary">
                      Get notified when you reach your goals
                    </p>
                  </div>
                  <Switch
                    id="milestones"
                    checked={profile.settings?.notifications?.progress_milestones || false}
                    onCheckedChange={(checked) => updateSettings('notifications.progress_milestones', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Email Preferences */}
            <Card className="bg-linear-card border-linear-border">
              <CardHeader>
                <CardTitle className="text-linear-text">Email Preferences</CardTitle>
                <CardDescription className="text-linear-text-secondary">
                  Manage your email communication preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="border-linear-border bg-linear-card">
                  <Mail className="h-4 w-4 text-linear-text" />
                  <AlertDescription className="text-linear-text-secondary">
                    Emails will be sent to: <strong className="text-linear-text">{user.email}</strong>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}