'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs'
import {
  Plus,
  Settings,
  TrendingUp,
  Calendar,
  User,
  BarChart3,
  Weight,
  Ruler,
  Target,
} from 'lucide-react'
import { createClient } from '../../../utils/supabase/client'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { LogEntryModal } from '../../../components/LogEntryModal'
import type { BodyMetric } from '../../../lib/services/profile'
import Link from 'next/link'

interface UserProfile {
  id: string
  name?: string
  email?: string
  birthday?: string
  height?: number
  gender?: 'male' | 'female'
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [user, setUser] = useState<UserProfile | null>(null)
  const [metrics, setMetrics] = useState<BodyMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showLogModal, setShowLogModal] = useState(false)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authUser) {
          router.push('/login')
          return
        }

        // For now, use auth user data as placeholder
        const userProfile: UserProfile = {
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email,
          birthday: authUser.user_metadata?.birthday,
          height: authUser.user_metadata?.height,
          gender: authUser.user_metadata?.gender,
        }

        setUser(userProfile)

        // Mock metrics data for now
        const mockMetrics: BodyMetric[] = [
          {
            id: '1',
            user_id: authUser.id,
            date: new Date().toISOString().split('T')[0],
            weight: 180,
            body_fat_percentage: 15.2,
            method: 'scale' as const,
            muscle_mass: 145,
            bone_mass: 7.8,
            water_percentage: 62.5,
            photo_url: null,
            step_count: null,
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            user_id: authUser.id,
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            weight: 181,
            body_fat_percentage: 15.8,
            method: 'scale' as const,
            muscle_mass: 144,
            bone_mass: 7.7,
            water_percentage: 62.1,
            photo_url: null,
            step_count: null,
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]

        setMetrics(mockMetrics)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [router, supabase])

  const calculateFFMI = (weight: number, bodyFat: number, height: number) => {
    const leanBodyMass = weight * (1 - bodyFat / 100)
    const heightM = height / 100
    return leanBodyMass / (heightM * heightM)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const getCurrentMetrics = () => {
    return metrics.length > 0 ? metrics[0] : null
  }

  const getProgressData = () => {
    if (metrics.length < 2) return null
    
    const current = metrics[0]
    const previous = metrics[1]
    
    return {
      weight: current.weight - previous.weight,
      bodyFat: current.body_fat_percentage! - previous.body_fat_percentage!,
      muscleMass: current.muscle_mass! - previous.muscle_mass!,
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-bg text-linear-text font-inter">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-64 rounded bg-linear-border" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-xl bg-linear-card" />
              ))}
            </div>
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
              Unable to load dashboard. Please try signing in again.
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="mt-4 bg-linear-text text-linear-bg"
            >
              Sign In
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const currentMetrics = getCurrentMetrics()
  const progressData = getProgressData()
  const ffmi = currentMetrics && user.height 
    ? calculateFFMI(currentMetrics.weight, currentMetrics.body_fat_percentage || 15, user.height)
    : null

  return (
    <div className="min-h-screen bg-linear-bg text-linear-text font-inter">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-linear-text">
              Welcome back, {user.name}!
            </h1>
            <p className="text-linear-text-secondary">
              Track your body composition progress
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/settings">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-linear-text-secondary hover:text-linear-text hover:bg-linear-border/50"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              onClick={() => setShowLogModal(true)}
              className="bg-linear-text text-linear-bg px-6 py-2 rounded-xl hover:bg-linear-text-secondary transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Log Entry
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-linear-border bg-linear-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-purple/10">
                  <Weight className="h-5 w-5 text-linear-purple" />
                </div>
                <div>
                  <p className="text-sm text-linear-text-secondary">Weight</p>
                  <p className="text-2xl font-bold text-linear-text">
                    {currentMetrics ? `${currentMetrics.weight} lbs` : 'No data'}
                  </p>
                  {progressData && (
                    <p className={`text-xs ${
                      progressData.weight > 0 ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {progressData.weight > 0 ? '+' : ''}{progressData.weight.toFixed(1)} lbs
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-linear-border bg-linear-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-linear-text-secondary">Body Fat</p>
                  <p className="text-2xl font-bold text-linear-text">
                    {currentMetrics ? `${currentMetrics.body_fat_percentage}%` : 'No data'}
                  </p>
                  {progressData && (
                    <p className={`text-xs ${
                      progressData.bodyFat > 0 ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {progressData.bodyFat > 0 ? '+' : ''}{progressData.bodyFat.toFixed(1)}%
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-linear-border bg-linear-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-linear-text-secondary">Muscle Mass</p>
                  <p className="text-2xl font-bold text-linear-text">
                    {currentMetrics ? `${currentMetrics.muscle_mass} lbs` : 'No data'}
                  </p>
                  {progressData && (
                    <p className={`text-xs ${
                      progressData.muscleMass > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {progressData.muscleMass > 0 ? '+' : ''}{progressData.muscleMass.toFixed(1)} lbs
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-linear-border bg-linear-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                  <Target className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-linear-text-secondary">FFMI</p>
                  <p className="text-2xl font-bold text-linear-text">
                    {ffmi ? ffmi.toFixed(1) : 'No data'}
                  </p>
                  <p className="text-xs text-linear-text-secondary">Fat-Free Mass Index</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 border border-linear-border bg-linear-card">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-linear-purple data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="data-[state=active]:bg-linear-purple data-[state=active]:text-white"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Progress
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-linear-purple data-[state=active]:text-white"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recent Entries */}
            <Card className="border-linear-border bg-linear-card">
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-linear-text">
                  Recent Entries
                </h3>
                {metrics.length > 0 ? (
                  <div className="space-y-4">
                    {metrics.slice(0, 5).map((metric) => (
                      <div
                        key={metric.id}
                        className="flex items-center justify-between rounded-lg border border-linear-border bg-linear-bg p-4"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-linear-text-secondary" />
                          <span className="text-sm text-linear-text-secondary">
                            {formatDate(metric.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="text-linear-text">
                            {metric.weight} lbs
                          </span>
                          <span className="text-linear-text-secondary">
                            {metric.body_fat_percentage}% BF
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-linear-text-secondary mb-4">
                      No entries yet. Start tracking your progress!
                    </p>
                    <Button 
                      onClick={() => setShowLogModal(true)}
                      className="bg-linear-text text-linear-bg"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Log First Entry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card className="border-linear-border bg-linear-card">
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-linear-text">
                  Progress Charts
                </h3>
                <div className="text-center py-16 text-linear-text-secondary">
                  Progress charts will be implemented here.
                  <br />
                  This will show weight trends, body fat changes, and FFMI progress over time.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="border-linear-border bg-linear-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-linear-text">
                    Profile Information
                  </h3>
                  <Link href="/settings">
                    <Button variant="outline" size="sm">
                      Edit Profile
                    </Button>
                  </Link>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-linear-text-secondary">Name</p>
                      <p className="font-medium text-linear-text">{user.name || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-linear-text-secondary">Email</p>
                      <p className="font-medium text-linear-text">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-linear-text-secondary">Height</p>
                      <p className="font-medium text-linear-text">
                        {user.height ? `${user.height} cm` : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-linear-text-secondary">Gender</p>
                      <p className="font-medium text-linear-text capitalize">
                        {user.gender || 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Button
            onClick={() => setShowLogModal(true)}
            className="bg-linear-text text-linear-bg px-6 py-4 rounded-xl hover:bg-linear-text-secondary transition-all duration-200 h-auto"
          >
            <Plus className="h-5 w-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Log New Entry</p>
              <p className="text-sm opacity-80">Track your latest measurements</p>
            </div>
          </Button>
          
          <Link href="/mobile">
            <Button
              variant="outline"
              className="w-full border-linear-border text-linear-text hover:bg-linear-border/30 px-6 py-4 rounded-xl h-auto"
            >
              <Ruler className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Get Mobile App</p>
                <p className="text-sm opacity-70">Track on-the-go with iOS/Android</p>
              </div>
            </Button>
          </Link>
        </div>
      </main>

      <Footer />

      {/* Log Entry Modal */}
      {user && (
        <LogEntryModal
          open={showLogModal}
          onOpenChange={setShowLogModal}
          userId={user.id}
          onSuccess={(newMetric) => {
            setMetrics(prev => [newMetric, ...prev])
          }}
        />
      )}
    </div>
  )
}