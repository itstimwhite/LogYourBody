'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'
import { 
  Loader2, 
  ArrowLeft,
  Moon,
  Sun,
  Smartphone,
  Save,
  Weight,
  Ruler,
  Globe
} from 'lucide-react'
import Link from 'next/link'
import { UserSettings } from '@/types/body-metrics'

export default function PreferencesSettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  const [settings, setSettings] = useState<UserSettings>({
    units: {
      weight: 'kg',
      height: 'cm',
      measurements: 'cm'
    },
    privacy: {
      public_profile: false,
      show_progress_photos: false
    },
    theme: 'dark'
  })

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

  const updateSettings = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev }
      const keys = path.split('.')
      let current: any = newSettings
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newSettings
    })
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: "Preferences saved",
        description: "Your preferences have been updated successfully."
      })
      setHasChanges(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
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
              <h1 className="text-xl font-bold text-linear-text">Preferences</h1>
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
        {/* Units & Measurements */}
        <Card className="bg-linear-card border-linear-border">
          <CardHeader>
            <CardTitle className="text-linear-text">Units & Measurements</CardTitle>
            <CardDescription className="text-linear-text-secondary">
              Choose your preferred units
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weightUnit" className="text-linear-text">Weight Unit</Label>
              <Select 
                value={settings.units?.weight || 'kg'} 
                onValueChange={(value) => updateSettings('units.weight', value)}
              >
                <SelectTrigger id="weightUnit" className="bg-linear-bg border-linear-border text-linear-text">
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
                value={settings.units?.height || 'cm'} 
                onValueChange={(value) => updateSettings('units.height', value)}
              >
                <SelectTrigger id="heightUnit" className="bg-linear-bg border-linear-border text-linear-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">Centimeters (cm)</SelectItem>
                  <SelectItem value="ft">Feet & Inches (ft/in)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="measurementUnit" className="text-linear-text">Body Measurements</Label>
              <Select 
                value={settings.units?.measurements || 'cm'} 
                onValueChange={(value) => updateSettings('units.measurements', value)}
              >
                <SelectTrigger id="measurementUnit" className="bg-linear-bg border-linear-border text-linear-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">Centimeters (cm)</SelectItem>
                  <SelectItem value="in">Inches (in)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="bg-linear-card border-linear-border">
          <CardHeader>
            <CardTitle className="text-linear-text">Appearance</CardTitle>
            <CardDescription className="text-linear-text-secondary">
              Customize how the app looks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-linear-text">Theme</Label>
              <div className="grid grid-cols-3 gap-3">
                {(['light', 'dark', 'system'] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => updateSettings('theme', theme)}
                    className={`
                      p-4 rounded-lg border-2 transition-colors
                      ${settings.theme === theme 
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
              <p className="text-xs text-linear-text-tertiary mt-2">
                {settings.theme === 'system' && 'Theme will match your device settings'}
                {settings.theme === 'light' && 'Light theme for daytime use'}
                {settings.theme === 'dark' && 'Dark theme for reduced eye strain'}
              </p>
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
                checked={settings.privacy?.public_profile || false}
                onCheckedChange={(checked) => updateSettings('privacy.public_profile', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="showPhotos" className="text-linear-text font-normal">
                  Show Progress Photos
                </Label>
                <p className="text-sm text-linear-text-secondary">
                  Include photos when sharing progress
                </p>
              </div>
              <Switch
                id="showPhotos"
                checked={settings.privacy?.show_progress_photos || false}
                onCheckedChange={(checked) => updateSettings('privacy.show_progress_photos', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card className="bg-linear-card border-linear-border">
          <CardHeader>
            <CardTitle className="text-linear-text">Language & Region</CardTitle>
            <CardDescription className="text-linear-text-secondary">
              Set your language and regional preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language" className="text-linear-text">Language</Label>
              <Select defaultValue="en">
                <SelectTrigger id="language" className="bg-linear-bg border-linear-border text-linear-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es" disabled>Spanish (Coming Soon)</SelectItem>
                  <SelectItem value="fr" disabled>French (Coming Soon)</SelectItem>
                  <SelectItem value="de" disabled>German (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateFormat" className="text-linear-text">Date Format</Label>
              <Select defaultValue="MM/DD/YYYY">
                <SelectTrigger id="dateFormat" className="bg-linear-bg border-linear-border text-linear-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}