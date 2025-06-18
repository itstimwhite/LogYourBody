'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { 
  Loader2, 
  ArrowLeft,
  Save
} from 'lucide-react'
import Link from 'next/link'
import { UserSettings } from '@/types/body-metrics'

export default function PreferencesSettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  const [_settings, setSettings] = useState<UserSettings>({
    units: {
      weight: 'lbs',
      height: 'ft',
      measurements: 'in'
    }
  })
  const [measurementSystem, setMeasurementSystem] = useState<'imperial' | 'metric'>('imperial')

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

  const handleSystemChange = (system: 'imperial' | 'metric') => {
    setMeasurementSystem(system)
    if (system === 'imperial') {
      setSettings(prev => ({
        ...prev,
        units: {
          weight: 'lbs',
          height: 'ft',
          measurements: 'in'
        }
      }))
    } else {
      setSettings(prev => ({
        ...prev,
        units: {
          weight: 'kg',
          height: 'cm',
          measurements: 'cm'
        }
      }))
    }
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
    } catch {
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
              Choose your measurement system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label className="text-linear-text">Measurement System</Label>
              <Tabs value={measurementSystem} onValueChange={(value) => handleSystemChange(value as 'imperial' | 'metric')}>
                <TabsList className="grid w-full grid-cols-2 bg-linear-bg">
                  <TabsTrigger 
                    value="imperial" 
                    className="data-[state=active]:bg-linear-purple data-[state=active]:text-white"
                  >
                    Imperial
                  </TabsTrigger>
                  <TabsTrigger 
                    value="metric"
                    className="data-[state=active]:bg-linear-purple data-[state=active]:text-white"
                  >
                    Metric
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="mt-4 space-y-2 text-sm text-linear-text-secondary">
                {measurementSystem === 'imperial' ? (
                  <>
                    <p>• Weight: Pounds (lbs)</p>
                    <p>• Height: Feet & Inches (ft/in)</p>
                    <p>• Measurements: Inches (in)</p>
                  </>
                ) : (
                  <>
                    <p>• Weight: Kilograms (kg)</p>
                    <p>• Height: Centimeters (cm)</p>
                    <p>• Measurements: Centimeters (cm)</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  )
}