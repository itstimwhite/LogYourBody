'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  User, 
  Camera,
  Scale,
  Ruler,
  Target,
  Plus,
  Settings,
  Percent,
  Dumbbell,
  Upload
} from 'lucide-react'
import { format } from 'date-fns'
import { BodyMetrics, UserProfile } from '@/types/body-metrics'
import { calculateFFMI, getBodyFatCategory } from '@/utils/body-calculations'
import { getAvatarUrl } from '@/utils/avatar-utils'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useNetworkStatus } from '@/hooks/use-network-status'
import { ensurePublicUrl } from '@/utils/storage-utils'
import { getProfile } from '@/lib/supabase/profile'
import { createClient } from '@/lib/supabase/client'

// Mock data for demonstration
const mockMetrics: BodyMetrics = {
  id: '1',
  user_id: 'user1',
  date: new Date().toISOString(),
  weight: 165,
  weight_unit: 'lbs',
  body_fat_percentage: 15,
  body_fat_method: 'navy',
  lean_body_mass: 140.25,
  ffmi: 21.2,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockProfile: UserProfile = {
  id: 'user1',
  email: 'user@example.com',
  full_name: 'John Doe',
  height: 71,
  height_unit: 'ft',
  gender: 'male',
  date_of_birth: '1990-01-01',
  email_verified: true,
  onboarding_completed: true,
  settings: {
    units: {
      weight: 'lbs',
      height: 'ft',
      measurements: 'in'
    }
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// Avatar display component
const AvatarDisplay = ({ 
  gender, 
  bodyFatPercentage, 
  showPhoto, 
  profileImage,
  className 
}: { 
  gender?: string
  bodyFatPercentage?: number
  showPhoto?: boolean
  profileImage?: string
  className?: string
}) => {
  if (showPhoto && profileImage) {
    return (
      <div className={cn("relative flex items-center justify-center bg-linear-bg", className)}>
        <Image 
          src={profileImage} 
          alt="Profile" 
          fill
          className="object-cover"
        />
      </div>
    )
  }

  const avatarUrl = getAvatarUrl(gender as 'male' | 'female', bodyFatPercentage)
  
  return (
    <div className={cn("relative flex items-center justify-center bg-linear-bg p-8", className)}>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={`Body silhouette at ${bodyFatPercentage || 20}% body fat`}
          width={300}
          height={400}
          className="h-full w-auto max-h-[500px] object-contain"
        />
      ) : (
        <div className="text-center text-linear-text-secondary">
          <User className="h-24 w-24 mx-auto mb-4" />
          <p>No avatar available</p>
        </div>
      )}
    </div>
  )
}

// Profile Panel component
const ProfilePanel = ({ 
  metrics, 
  user, 
  formattedWeight,
  formattedHeight,
  formattedLeanBodyMass 
}: {
  metrics: BodyMetrics | null
  user: UserProfile | null
  formattedWeight: string
  formattedHeight: string
  formattedLeanBodyMass: string
}) => {
  const bodyFatCategory = metrics?.body_fat_percentage && user?.gender
    ? getBodyFatCategory(metrics.body_fat_percentage, user.gender as 'male' | 'female')
    : null

  return (
    <div className="h-full overflow-y-auto bg-linear-card p-6">
      <div className="space-y-6">
        {/* User Info */}
        <div>
          <h2 className="text-2xl font-bold text-linear-text mb-1">
            {user?.full_name || user?.email?.split('@')[0] || 'User'}
          </h2>
          <p className="text-sm text-linear-text-secondary">{user?.email}</p>
        </div>

        {/* Current Stats */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-linear-text-secondary uppercase tracking-wider">Current Stats</h3>
          
          {/* Weight */}
          <div className="flex items-center justify-between py-3 border-b border-linear-border">
            <div className="flex items-center gap-3">
              <Scale className="h-5 w-5 text-linear-text-tertiary" />
              <span className="text-linear-text">Weight</span>
            </div>
            <span className="font-medium text-linear-text">{formattedWeight}</span>
          </div>

          {/* Body Fat */}
          <div className="flex items-center justify-between py-3 border-b border-linear-border">
            <div className="flex items-center gap-3">
              <Percent className="h-5 w-5 text-linear-text-tertiary" />
              <span className="text-linear-text">Body Fat</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-linear-text">
                {metrics?.body_fat_percentage?.toFixed(1) || '--'}%
              </span>
              {bodyFatCategory && (
                <Badge variant="secondary" className="text-xs">
                  {bodyFatCategory}
                </Badge>
              )}
            </div>
          </div>

          {/* Lean Mass */}
          <div className="flex items-center justify-between py-3 border-b border-linear-border">
            <div className="flex items-center gap-3">
              <Dumbbell className="h-5 w-5 text-linear-text-tertiary" />
              <span className="text-linear-text">Lean Mass</span>
            </div>
            <span className="font-medium text-linear-text">{formattedLeanBodyMass}</span>
          </div>

          {/* Height */}
          <div className="flex items-center justify-between py-3 border-b border-linear-border">
            <div className="flex items-center gap-3">
              <Ruler className="h-5 w-5 text-linear-text-tertiary" />
              <span className="text-linear-text">Height</span>
            </div>
            <span className="font-medium text-linear-text">{formattedHeight}</span>
          </div>

          {/* FFMI */}
          {metrics && user?.height && (
            <div className="flex items-center justify-between py-3 border-b border-linear-border">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-linear-text-tertiary" />
                <span className="text-linear-text">FFMI</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-linear-text">
                  {calculateFFMI(metrics.weight!, user.height, metrics.body_fat_percentage!).normalized_ffmi}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {calculateFFMI(metrics.weight!, user.height, metrics.body_fat_percentage!).interpretation.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Goals Progress */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-linear-text-secondary uppercase tracking-wider">Goals Progress</h3>
          
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-linear-text">Weight Goal</span>
                <span className="text-sm font-medium text-linear-text">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-linear-text">Body Fat Goal</span>
                <span className="text-sm font-medium text-linear-text">60%</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Timeline component
const TimelineSlider = ({ 
  metrics, 
  selectedIndex, 
  onIndexChange 
}: {
  metrics: BodyMetrics[]
  selectedIndex: number
  onIndexChange: (index: number) => void
}) => {
  if (metrics.length === 0) return null

  return (
    <div className="bg-linear-card border-t border-linear-border p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-linear-text-secondary">Timeline</span>
        <span className="text-xs text-linear-text-secondary">
          {selectedIndex + 1} of {metrics.length}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={metrics.length - 1}
        value={selectedIndex}
        onChange={(e) => onIndexChange(parseInt(e.target.value))}
        className="w-full h-2 bg-linear-border rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-linear-text-secondary">
          {format(new Date(metrics[0].date), 'MMM d')}
        </span>
        <span className="text-xs font-medium text-linear-text">
          {format(new Date(metrics[selectedIndex].date), 'PPP')}
        </span>
        <span className="text-xs text-linear-text-secondary">
          {format(new Date(metrics[metrics.length - 1].date), 'MMM d')}
        </span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const isOnline = useNetworkStatus()
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [selectedDateIndex, setSelectedDateIndex] = useState(0)
  const [latestMetrics, setLatestMetrics] = useState<BodyMetrics | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [metricsHistory, setMetricsHistory] = useState<BodyMetrics[]>([])
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Load profile data
  useEffect(() => {
    if (user) {
      setProfileLoading(true)
      getProfile(user.id).then((profileData) => {
        if (profileData) {
          setProfile(profileData)
        }
        setProfileLoading(false)
      }).catch((error) => {
        console.error('Error loading profile:', error)
        setProfileLoading(false)
      })

      // Load metrics data
      const supabase = createClient()
      supabase
        .from('body_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            console.error('Error loading metrics:', error)
          } else if (data && data.length > 0) {
            setLatestMetrics(data[0])
            setMetricsHistory(data.reverse()) // Reverse to have oldest first for timeline
          }
        })
    }
  }, [user])

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-bg">
        <Loader2 className="h-8 w-8 animate-spin text-linear-text-secondary" aria-label="Loading" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Get current metrics based on selected date
  const currentMetrics = metricsHistory[selectedDateIndex] || latestMetrics

  // Format helpers
  const getFormattedWeight = (weight?: number) => {
    if (!weight) return '--'
    return `${weight.toFixed(1)} ${profile?.settings?.units?.weight || 'lbs'}`
  }

  const getFormattedHeight = (height?: number) => {
    if (!height) return '--'
    return `${height} ${profile?.settings?.units?.height || 'in'}`
  }

  const getFormattedLeanBodyMass = (lbm?: number) => {
    if (!lbm) return '--'
    return `${lbm.toFixed(1)} ${profile?.settings?.units?.weight || 'lbs'}`
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-linear-bg text-linear-text">
      {/* Header - Desktop only */}
      <div className="hidden items-center justify-between border-b border-linear-border px-6 py-4 md:flex">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-linear-text">
            LogYourBody
          </h1>
          {!isOnline && (
            <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-500">
              Offline
            </Badge>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => router.push('/import')}
            className="h-10 w-10 text-linear-text-secondary transition-colors hover:bg-linear-border/50 hover:text-linear-text"
            title="Bulk Import"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => router.push('/log')}
            className="h-10 w-10 text-linear-text-secondary transition-colors hover:bg-linear-border/50 hover:text-linear-text"
            title="Log Metrics"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => router.push('/settings')}
            className="h-10 w-10 text-linear-text-secondary transition-colors hover:bg-linear-border/50 hover:text-linear-text"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content - Avatar/Photo Section with Profile Panel */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Avatar/Photo Section with Tabs - 2/3 on desktop */}
        <div className="relative min-h-0 flex-[1.5] md:w-2/3 md:flex-1">
          <Tabs value={activeTabIndex.toString()} onValueChange={(v) => setActiveTabIndex(parseInt(v))} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 bg-linear-card border-b border-linear-border rounded-none">
              <TabsTrigger value="0" className="data-[state=active]:bg-linear-border/50">Avatar</TabsTrigger>
              <TabsTrigger value="1" className="data-[state=active]:bg-linear-border/50">Photo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="0" className="flex-1 m-0">
              <Suspense fallback={
                <div className="flex h-full items-center justify-center bg-linear-bg">
                  <Loader2 className="h-8 w-8 animate-spin text-linear-text-secondary" />
                </div>
              }>
                <AvatarDisplay
                  gender={profile?.gender}
                  bodyFatPercentage={currentMetrics?.body_fat_percentage}
                  showPhoto={false}
                  className="h-full w-full"
                />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="1" className="flex-1 m-0">
              <Suspense fallback={
                <div className="flex h-full items-center justify-center bg-linear-bg">
                  <Loader2 className="h-8 w-8 animate-spin text-linear-text-secondary" />
                </div>
              }>
                <AvatarDisplay
                  gender={profile?.gender}
                  bodyFatPercentage={currentMetrics?.body_fat_percentage}
                  showPhoto={true}
                  profileImage={currentMetrics?.photo_url ? ensurePublicUrl(currentMetrics.photo_url) : undefined}
                  className="h-full w-full"
                />
              </Suspense>
            </TabsContent>
            
          </Tabs>

          {/* Mobile Action Buttons - Floating */}
          <div className="absolute top-4 right-4 z-20 flex gap-3 md:hidden">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => router.push('/log')}
              className="h-10 w-10 bg-linear-bg/80 text-linear-text-secondary shadow-lg backdrop-blur-sm transition-colors hover:bg-linear-card hover:text-linear-text"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => router.push('/settings')}
              className="h-10 w-10 bg-linear-bg/80 text-linear-text-secondary shadow-lg backdrop-blur-sm transition-colors hover:bg-linear-card hover:text-linear-text"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Profile Panel - 1/3 on desktop */}
        <div className="min-h-0 flex-[0.8] border-linear-border md:w-1/3 md:flex-1 md:border-l">
          <ProfilePanel
            metrics={currentMetrics}
            user={profile}
            formattedWeight={getFormattedWeight(currentMetrics?.weight)}
            formattedHeight={getFormattedHeight(profile?.height)}
            formattedLeanBodyMass={getFormattedLeanBodyMass(currentMetrics?.lean_body_mass)}
          />
        </div>
      </div>

      {/* Timeline Slider */}
      <div className="flex-shrink-0">
        <TimelineSlider
          metrics={metricsHistory}
          selectedIndex={selectedDateIndex}
          onIndexChange={setSelectedDateIndex}
        />
      </div>
    </div>
  )
}