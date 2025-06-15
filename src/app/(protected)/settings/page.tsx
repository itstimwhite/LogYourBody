'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { Switch } from '../../../components/ui/switch'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { ArrowLeft, Edit, LogOut, User, Calendar, Ruler, Mail, Lock, Settings as SettingsIcon } from 'lucide-react'
import { createClient } from '../../../lib/supabase/client'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'

interface User {
  id: string
  email?: string | null
  name?: string | null
  birthday?: string | null
  height?: number | null
  gender?: 'male' | 'female' | null
}

interface Settings {
  units: 'imperial' | 'metric'
  healthKitSyncEnabled: boolean
  googleFitSyncEnabled: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // User and settings data
  const [user, setUser] = useState<User | null>(null)
  const [settings, setSettings] = useState<Settings>({
    units: 'imperial',
    healthKitSyncEnabled: false,
    googleFitSyncEnabled: false,
  })
  const [loading, setLoading] = useState(true)

  // Modal states
  const [showNameEdit, setShowNameEdit] = useState(false)
  const [showBirthdayEdit, setShowBirthdayEdit] = useState(false)
  const [showHeightEdit, setShowHeightEdit] = useState(false)
  const [showEmailEdit, setShowEmailEdit] = useState(false)
  const [showPasswordEdit, setShowPasswordEdit] = useState(false)

  // Form states
  const [editName, setEditName] = useState('')
  const [editBirthday, setEditBirthday] = useState('')
  const [editHeight, setEditHeight] = useState(175)
  const [editEmail, setEditEmail] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  // Load user data and settings
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authUser) {
          router.push('/login')
          return
        }

        // For now, use auth user data as placeholder
        const userData: User = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || null,
          birthday: authUser.user_metadata?.birthday || null,
          height: authUser.user_metadata?.height || null,
          gender: authUser.user_metadata?.gender || null,
        }

        setUser(userData)
        setEditName(userData.name || '')
        setEditBirthday(userData.birthday || '')
        setEditHeight(userData.height || 175)
        setEditEmail(userData.email || '')
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router, supabase])

  const handleUnitsChange = (value: string) => {
    setSettings(prev => ({ ...prev, units: value as 'imperial' | 'metric' }))
  }

  const handleGenderChange = (value: 'male' | 'female') => {
    setUser(prev => prev ? { ...prev, gender: value } : null)
  }

  const handleHealthKitToggle = (checked: boolean) => {
    setSettings(prev => ({ ...prev, healthKitSyncEnabled: checked }))
  }

  const handleGoogleFitToggle = (checked: boolean) => {
    setSettings(prev => ({ ...prev, googleFitSyncEnabled: checked }))
  }

  const handleNotificationsToggle = async (checked: boolean) => {
    if (checked) {
      try {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          setNotificationsEnabled(true)
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error)
      }
    } else {
      setNotificationsEnabled(false)
    }
  }

  const handleSaveName = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: editName }
      })
      if (!error && user) {
        setUser({ ...user, name: editName })
        setShowNameEdit(false)
      }
    } catch (error) {
      console.error('Error updating name:', error)
    }
  }

  const handleSaveBirthday = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { birthday: editBirthday }
      })
      if (!error && user) {
        setUser({ ...user, birthday: editBirthday })
        setShowBirthdayEdit(false)
      }
    } catch (error) {
      console.error('Error updating birthday:', error)
    }
  }

  const handleSaveHeight = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { height: editHeight }
      })
      if (!error && user) {
        setUser({ ...user, height: editHeight })
        setShowHeightEdit(false)
      }
    } catch (error) {
      console.error('Error updating height:', error)
    }
  }

  const handleSaveEmail = async () => {
    try {
      const { error } = await supabase.auth.updateUser({ email: editEmail })
      if (!error && user) {
        setUser({ ...user, email: editEmail })
        setShowEmailEdit(false)
      }
    } catch (error) {
      console.error('Error updating email:', error)
    }
  }

  const handleSavePassword = async () => {
    try {
      const { error } = await supabase.auth.updateUser({ password: editPassword })
      if (!error) {
        setEditPassword('')
        setShowPasswordEdit(false)
      }
    } catch (error) {
      console.error('Error updating password:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const formatHeight = (heightCm: number) => {
    if (settings.units === 'metric') {
      return `${heightCm} cm`
    } else {
      const feet = Math.floor(heightCm / 30.48)
      const inches = Math.round((heightCm % 30.48) / 2.54)
      return `${feet}'${inches}"`
    }
  }

  const formatBirthday = (birthday: string) => {
    const date = new Date(birthday)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-bg text-linear-text font-inter">
        <Header />
        <div className="animate-pulse">
          <div className="h-16 border-b border-linear-border bg-linear-card" />
          <div className="space-y-8 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-4 w-24 rounded bg-linear-border" />
                <div className="space-y-3">
                  <div className="h-12 rounded bg-linear-card" />
                  <div className="h-12 rounded bg-linear-card" />
                  <div className="h-12 rounded bg-linear-card" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-bg font-inter">
        <Header />
        <div className="flex min-h-96 items-center justify-center">
          <div className="text-center">
            <p className="text-linear-text-secondary">
              Failed to load settings. Please try again.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 border-linear-border bg-linear-card text-linear-text hover:bg-linear-border/50"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-bg text-linear-text font-inter">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="h-10 w-10 text-linear-text-secondary hover:text-linear-text hover:bg-linear-border/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-6 w-6 text-linear-purple" />
            <h1 className="text-2xl font-bold tracking-tight text-linear-text">Settings</h1>
          </div>
        </div>

        <div className="max-w-2xl space-y-8">
          {/* Personal Information */}
          <section className="space-y-6">
            <h2 className="border-b border-linear-border pb-3 text-sm font-medium uppercase tracking-wide text-linear-text-secondary">
              Personal Information
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div
                className="flex cursor-pointer items-center justify-between rounded-lg border border-linear-border bg-linear-card p-4 hover:bg-linear-border/20 transition-colors"
                onClick={() => setShowNameEdit(true)}
              >
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-linear-text-secondary" />
                  <div className="text-base font-medium text-linear-text">Name</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-linear-text-secondary">
                    {user.name || 'Not set'}
                  </div>
                  <Edit className="h-4 w-4 text-linear-text-tertiary" />
                </div>
              </div>

              {/* Birthday */}
              <div
                className="flex cursor-pointer items-center justify-between rounded-lg border border-linear-border bg-linear-card p-4 hover:bg-linear-border/20 transition-colors"
                onClick={() => setShowBirthdayEdit(true)}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-linear-text-secondary" />
                  <div className="text-base font-medium text-linear-text">Birthday</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-linear-text-secondary">
                    {user.birthday ? formatBirthday(user.birthday) : 'Not set'}
                  </div>
                  <Edit className="h-4 w-4 text-linear-text-tertiary" />
                </div>
              </div>

              {/* Gender */}
              <div className="rounded-lg border border-linear-border bg-linear-card p-4">
                <div className="mb-3 text-base font-medium text-linear-text">
                  Biological Sex
                </div>
                <Tabs
                  value={user.gender || 'male'}
                  onValueChange={(value) => handleGenderChange(value as 'male' | 'female')}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 border border-linear-border bg-linear-bg">
                    <TabsTrigger
                      value="male"
                      className="data-[state=active]:bg-linear-purple data-[state=active]:text-white"
                    >
                      Male
                    </TabsTrigger>
                    <TabsTrigger
                      value="female"
                      className="data-[state=active]:bg-linear-purple data-[state=active]:text-white"
                    >
                      Female
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Height */}
              <div
                className="flex cursor-pointer items-center justify-between rounded-lg border border-linear-border bg-linear-card p-4 hover:bg-linear-border/20 transition-colors"
                onClick={() => setShowHeightEdit(true)}
              >
                <div className="flex items-center gap-3">
                  <Ruler className="h-4 w-4 text-linear-text-secondary" />
                  <div className="text-base font-medium text-linear-text">Height</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-linear-text-secondary">
                    {user.height ? formatHeight(user.height) : 'Not set'}
                  </div>
                  <Edit className="h-4 w-4 text-linear-text-tertiary" />
                </div>
              </div>
            </div>
          </section>

          {/* Settings */}
          <section className="space-y-6">
            <h2 className="border-b border-linear-border pb-3 text-sm font-medium uppercase tracking-wide text-linear-text-secondary">
              Preferences
            </h2>

            <div className="space-y-4">
              {/* Units */}
              <div className="rounded-lg border border-linear-border bg-linear-card p-4">
                <div className="mb-3 text-base font-medium text-linear-text">
                  Units
                </div>
                <Tabs
                  value={settings.units}
                  onValueChange={handleUnitsChange}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 border border-linear-border bg-linear-bg">
                    <TabsTrigger
                      value="imperial"
                      className="data-[state=active]:bg-linear-purple data-[state=active]:text-white"
                    >
                      Imperial (lbs, ft/in)
                    </TabsTrigger>
                    <TabsTrigger
                      value="metric"
                      className="data-[state=active]:bg-linear-purple data-[state=active]:text-white"
                    >
                      Metric (kg, cm)
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between rounded-lg border border-linear-border bg-linear-card p-4">
                <div>
                  <div className="text-base font-medium text-linear-text">
                    Notifications
                  </div>
                  <div className="text-sm text-linear-text-secondary">
                    Enable push notifications
                  </div>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={handleNotificationsToggle}
                />
              </div>

              {/* HealthKit Sync */}
              <div className="flex items-center justify-between rounded-lg border border-linear-border bg-linear-card p-4">
                <div>
                  <div className="text-base font-medium text-linear-text">
                    Sync from Apple HealthKit
                  </div>
                  <div className="text-sm text-linear-text-secondary">
                    iOS only
                  </div>
                </div>
                <Switch
                  checked={settings.healthKitSyncEnabled}
                  onCheckedChange={handleHealthKitToggle}
                />
              </div>

              {/* Google Fit Sync */}
              <div className="flex items-center justify-between rounded-lg border border-linear-border bg-linear-card p-4">
                <div>
                  <div className="text-base font-medium text-linear-text">
                    Sync from Google Fit
                  </div>
                  <div className="text-sm text-linear-text-secondary">
                    All platforms
                  </div>
                </div>
                <Switch
                  checked={settings.googleFitSyncEnabled}
                  onCheckedChange={handleGoogleFitToggle}
                />
              </div>
            </div>
          </section>

          {/* Account */}
          <section className="space-y-6">
            <h2 className="border-b border-linear-border pb-3 text-sm font-medium uppercase tracking-wide text-linear-text-secondary">
              Account
            </h2>

            <div className="space-y-4">
              {/* Email */}
              <div
                className="flex cursor-pointer items-center justify-between rounded-lg border border-linear-border bg-linear-card p-4 hover:bg-linear-border/20 transition-colors"
                onClick={() => setShowEmailEdit(true)}
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-linear-text-secondary" />
                  <div className="text-base font-medium text-linear-text">Email</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-linear-text-secondary">
                    {user.email || 'Not set'}
                  </div>
                  <Edit className="h-4 w-4 text-linear-text-tertiary" />
                </div>
              </div>

              {/* Password */}
              <div
                className="flex cursor-pointer items-center justify-between rounded-lg border border-linear-border bg-linear-card p-4 hover:bg-linear-border/20 transition-colors"
                onClick={() => setShowPasswordEdit(true)}
              >
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4 text-linear-text-secondary" />
                  <div className="text-base font-medium text-linear-text">Password</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-linear-text-secondary">••••••••</div>
                  <Edit className="h-4 w-4 text-linear-text-tertiary" />
                </div>
              </div>

              {/* Logout */}
              <div
                className="flex cursor-pointer items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-4 hover:bg-red-500/10 transition-colors"
                onClick={handleLogout}
              >
                <div className="flex items-center gap-3">
                  <LogOut className="h-4 w-4 text-red-500" />
                  <div className="text-base font-medium text-red-500">
                    Sign Out
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      {/* Edit Modals */}
      <Dialog open={showNameEdit} onOpenChange={setShowNameEdit}>
        <DialogContent className="max-w-md border-linear-border bg-linear-card text-linear-text">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Edit Name
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border-linear-border bg-linear-bg text-linear-text"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowNameEdit(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveName} className="flex-1">
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBirthdayEdit} onOpenChange={setShowBirthdayEdit}>
        <DialogContent className="max-w-md border-linear-border bg-linear-card text-linear-text">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Edit Birthday
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="birthday">Birthday</Label>
              <Input
                id="birthday"
                type="date"
                value={editBirthday}
                onChange={(e) => setEditBirthday(e.target.value)}
                className="border-linear-border bg-linear-bg text-linear-text"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowBirthdayEdit(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveBirthday} className="flex-1">
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showHeightEdit} onOpenChange={setShowHeightEdit}>
        <DialogContent className="max-w-md border-linear-border bg-linear-card text-linear-text">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Edit Height
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={editHeight}
                onChange={(e) => setEditHeight(Number(e.target.value))}
                className="border-linear-border bg-linear-bg text-linear-text"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowHeightEdit(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveHeight} className="flex-1">
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEmailEdit} onOpenChange={setShowEmailEdit}>
        <DialogContent className="max-w-md border-linear-border bg-linear-card text-linear-text">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Edit Email
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="border-linear-border bg-linear-bg text-linear-text"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEmailEdit(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEmail} className="flex-1">
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPasswordEdit} onOpenChange={setShowPasswordEdit}>
        <DialogContent className="max-w-md border-linear-border bg-linear-card text-linear-text">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Change Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                className="border-linear-border bg-linear-bg text-linear-text"
                placeholder="Enter new password"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowPasswordEdit(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSavePassword} className="flex-1">
                Update Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}