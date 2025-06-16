'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Loader2, 
  User, 
  Activity, 
  Calendar, 
  TrendingUp, 
  Camera,
  Scale,
  Ruler,
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Settings,
  FileText,
  Heart
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { BodyMetrics, UserProfile } from '@/types/body-metrics'
import { calculateFFMI, getBodyFatCategory } from '@/utils/body-calculations'

// Mock data for demonstration
const mockMetrics: BodyMetrics = {
  id: '1',
  user_id: 'user1',
  date: new Date().toISOString(),
  weight: 75,
  weight_unit: 'kg',
  body_fat_percentage: 15,
  body_fat_method: 'navy',
  lean_body_mass: 63.75,
  ffmi: 21.2,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockProfile: UserProfile = {
  id: 'user1',
  email: 'user@example.com',
  full_name: 'John Doe',
  height: 180,
  height_unit: 'cm',
  gender: 'male',
  date_of_birth: '1990-01-01',
  email_verified: true,
  onboarding_completed: true,
  settings: {
    units: {
      weight: 'kg',
      height: 'cm',
      measurements: 'cm'
    }
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [currentTab, setCurrentTab] = useState('overview')
  const [latestMetrics, setLatestMetrics] = useState<BodyMetrics | null>(mockMetrics)
  const [profile, setProfile] = useState<UserProfile | null>(mockProfile)
  const [metricsHistory, setMetricsHistory] = useState<BodyMetrics[]>([mockMetrics])

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

  const ffmiData = latestMetrics && profile?.height 
    ? calculateFFMI(latestMetrics.weight!, profile.height, latestMetrics.body_fat_percentage!)
    : null

  const bodyFatCategory = latestMetrics?.body_fat_percentage && profile?.gender
    ? getBodyFatCategory(latestMetrics.body_fat_percentage, profile.gender as 'male' | 'female')
    : null

  const weightChange = metricsHistory.length > 1 
    ? metricsHistory[0].weight! - metricsHistory[1].weight!
    : 0

  const bfChange = metricsHistory.length > 1 && metricsHistory[0].body_fat_percentage && metricsHistory[1].body_fat_percentage
    ? metricsHistory[0].body_fat_percentage - metricsHistory[1].body_fat_percentage
    : 0

  return (
    <div className="min-h-screen bg-linear-bg">
      {/* Header */}
      <header className="bg-linear-card shadow-sm border-b border-linear-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-linear-text">Dashboard</h1>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="text-sm font-medium text-linear-text">
                  Overview
                </Link>
                <Link href="/metrics" className="text-sm font-medium text-linear-text-secondary hover:text-linear-text">
                  Metrics
                </Link>
                <Link href="/photos" className="text-sm font-medium text-linear-text-secondary hover:text-linear-text">
                  Photos
                </Link>
                <Link href="/reports" className="text-sm font-medium text-linear-text-secondary hover:text-linear-text">
                  Reports
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/settings">
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <span className="text-sm text-linear-text-secondary hidden sm:inline">{user.email}</span>
              <Button onClick={signOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button className="bg-linear-purple hover:bg-linear-purple/80 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Log Today's Metrics
          </Button>
          <Button variant="outline" className="border-linear-border">
            <Camera className="h-4 w-4 mr-2" />
            Add Progress Photo
          </Button>
          <Button variant="outline" className="border-linear-border">
            <FileText className="h-4 w-4 mr-2" />
            View Reports
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-linear-card border-linear-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-linear-text">Current Weight</CardTitle>
              <Scale className="h-4 w-4 text-linear-text-tertiary" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-linear-text">
                  {latestMetrics?.weight || '--'} 
                </div>
                <span className="text-sm text-linear-text-secondary">
                  {latestMetrics?.weight_unit || 'kg'}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {weightChange !== 0 && (
                  <>
                    {weightChange > 0 ? (
                      <ArrowUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className="text-xs text-linear-text-tertiary">
                      {Math.abs(weightChange).toFixed(1)} {latestMetrics?.weight_unit}
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-card border-linear-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-linear-text">Body Fat %</CardTitle>
              <Activity className="h-4 w-4 text-linear-text-tertiary" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-linear-text">
                  {latestMetrics?.body_fat_percentage?.toFixed(1) || '--'}
                </div>
                <span className="text-sm text-linear-text-secondary">%</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {bodyFatCategory && (
                  <Badge variant="secondary" className="text-xs">
                    {bodyFatCategory}
                  </Badge>
                )}
                {bfChange !== 0 && (
                  <div className="flex items-center gap-1">
                    {bfChange > 0 ? (
                      <ArrowUp className="h-3 w-3 text-red-500" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-green-500" />
                    )}
                    <span className="text-xs text-linear-text-tertiary">
                      {Math.abs(bfChange).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-card border-linear-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-linear-text">FFMI</CardTitle>
              <Target className="h-4 w-4 text-linear-text-tertiary" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-linear-text">
                  {ffmiData?.normalized_ffmi || '--'}
                </div>
              </div>
              {ffmiData && (
                <Badge variant="secondary" className="text-xs mt-1">
                  {ffmiData.interpretation.replace('_', ' ')}
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="bg-linear-card border-linear-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-linear-text">Lean Mass</CardTitle>
              <Heart className="h-4 w-4 text-linear-text-tertiary" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-linear-text">
                  {latestMetrics?.lean_body_mass?.toFixed(1) || '--'}
                </div>
                <span className="text-sm text-linear-text-secondary">
                  {latestMetrics?.weight_unit || 'kg'}
                </span>
              </div>
              <p className="text-xs text-linear-text-tertiary mt-1">
                Fat-free mass
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
          <TabsList className="bg-linear-card border border-linear-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="bg-linear-card border-linear-border">
              <CardHeader>
                <CardTitle className="text-linear-text">Recent Activity</CardTitle>
                <CardDescription className="text-linear-text-secondary">
                  Your latest measurements and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {latestMetrics ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-linear-text-secondary">Last Updated</span>
                        <span className="text-sm font-medium text-linear-text">
                          {format(new Date(latestMetrics.date), 'PPP')}
                        </span>
                      </div>
                      <Separator className="bg-linear-border" />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-linear-text-secondary mb-1">Method Used</p>
                          <Badge variant="outline" className="text-xs">
                            {latestMetrics.body_fat_method}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-linear-text-secondary mb-1">Progress Photos</p>
                          <p className="text-sm font-medium text-linear-text">
                            {latestMetrics.photo_url ? 'Uploaded' : 'Not uploaded'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-linear-text-secondary mb-4">No metrics logged yet</p>
                      <Button className="bg-linear-purple hover:bg-linear-purple/80 text-white">
                        Log Your First Entry
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Progress Summary */}
            <Card className="bg-linear-card border-linear-border">
              <CardHeader>
                <CardTitle className="text-linear-text">Progress Summary</CardTitle>
                <CardDescription className="text-linear-text-secondary">
                  Your journey over the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-linear-text-secondary">Weight Goal Progress</span>
                      <span className="text-sm font-medium text-linear-text">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-linear-text-secondary">Body Fat Goal Progress</span>
                      <span className="text-sm font-medium text-linear-text">60%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-linear-text-secondary">Consistency Score</span>
                      <span className="text-sm font-medium text-linear-text">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card className="bg-linear-card border-linear-border">
              <CardHeader>
                <CardTitle className="text-linear-text">Trends Analysis</CardTitle>
                <CardDescription className="text-linear-text-secondary">
                  Visualize your progress over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-linear-text-tertiary mx-auto mb-4" />
                  <p className="text-linear-text-secondary">
                    Charts and trends will be displayed here once you have more data points
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos">
            <Card className="bg-linear-card border-linear-border">
              <CardHeader>
                <CardTitle className="text-linear-text">Progress Photos</CardTitle>
                <CardDescription className="text-linear-text-secondary">
                  Visual documentation of your transformation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Camera className="h-12 w-12 text-linear-text-tertiary mx-auto mb-4" />
                  <p className="text-linear-text-secondary mb-4">
                    No photos uploaded yet
                  </p>
                  <Button variant="outline" className="border-linear-border">
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Your First Photo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals">
            <Card className="bg-linear-card border-linear-border">
              <CardHeader>
                <CardTitle className="text-linear-text">Your Goals</CardTitle>
                <CardDescription className="text-linear-text-secondary">
                  Set and track your fitness objectives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-linear-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-linear-text">Target Weight</h4>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <p className="text-sm text-linear-text-secondary mb-2">
                      Current: 75 kg → Target: 70 kg
                    </p>
                    <Progress value={40} className="h-2" />
                  </div>
                  <div className="p-4 border border-linear-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-linear-text">Body Fat Percentage</h4>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <p className="text-sm text-linear-text-secondary mb-2">
                      Current: 15% → Target: 12%
                    </p>
                    <Progress value={60} className="h-2" />
                  </div>
                  <Button variant="outline" className="w-full border-linear-border">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Goal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}