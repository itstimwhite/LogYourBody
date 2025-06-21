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
import { BodyMetrics, UserProfile, ProgressPhoto } from '@/types/body-metrics'
import { calculateFFMI, getBodyFatCategory } from '@/utils/body-calculations'
import { getAvatarUrl } from '@/utils/avatar-utils'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useNetworkStatus } from '@/hooks/use-network-status'
import { ensurePublicUrl } from '@/utils/storage-utils'
import { getProfile } from '@/lib/supabase/profile'
import { createClient } from '@/lib/supabase/client'
import { createTimelineData, getTimelineDisplayValues, TimelineEntry } from '@/utils/data-interpolation'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { BodyFatScale } from '@/components/BodyFatScale'

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
  className,
  onAddPhoto 
}: { 
  gender?: string
  bodyFatPercentage?: number
  showPhoto?: boolean
  profileImage?: string
  className?: string
  onAddPhoto?: () => void
}) => {
  if (showPhoto) {
    if (profileImage) {
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
    } else {
      // No photo available - show add photo prompt
      return (
        <div className={cn("relative flex items-center justify-center bg-linear-bg", className)}>
          <div className="text-center">
            <Camera className="h-24 w-24 mx-auto mb-4 text-linear-text-tertiary" />
            <p className="text-linear-text-secondary mb-4">No photo yet</p>
            <Button 
              variant="outline" 
              className="border-linear-border"
              onClick={onAddPhoto}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Photo
            </Button>
          </div>
        </div>
      )
    }
  }

  const avatarUrl = getAvatarUrl(gender as 'male' | 'female', bodyFatPercentage)
  
  const [imageError, setImageError] = useState(false)

  return (
    <div className={cn("relative flex items-center justify-center bg-linear-bg p-8", className)}>
      {avatarUrl && !imageError ? (
        <Image
          src={avatarUrl}
          alt={`Body silhouette at ${bodyFatPercentage || 20}% body fat`}
          width={300}
          height={400}
          className="h-full w-auto max-h-[500px] object-contain"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="text-center">
          <User className="h-24 w-24 mx-auto mb-4 text-linear-text-tertiary" />
          <p className="text-linear-text-secondary">Body model unavailable</p>
          <p className="text-xs text-linear-text-tertiary mt-1">Add measurements to generate</p>
        </div>
      )}
    </div>
  )
}

// Profile Panel component
const ProfilePanel = ({ 
  entry,
  user, 
  formattedWeight,
  formattedHeight
}: {
  entry: TimelineEntry | null
  user: UserProfile | null
  formattedWeight: string
  formattedHeight: string
}) => {
  const displayValues = entry ? getTimelineDisplayValues(entry) : null
  const bodyFatCategory = displayValues?.bodyFatPercentage && user?.gender
    ? getBodyFatCategory(displayValues.bodyFatPercentage, user.gender as 'male' | 'female')
    : null

  // Calculate age from date of birth
  const calculateAge = () => {
    if (!user?.date_of_birth) return null
    try {
      const birthDate = new Date(user.date_of_birth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    } catch {
      return null
    }
  }

  const age = calculateAge()

  return (
    <div className="h-full overflow-y-auto bg-linear-card p-6">
      <div className="space-y-6">
        {/* User Info */}
        <div className="flex items-start justify-between">
          {/* Left side - Name and email */}
          <div>
            <h2 className="text-2xl font-bold text-linear-text mb-1">
              {user?.full_name || user?.email?.split('@')[0] || 'User'}
            </h2>
            <p className="text-sm text-linear-text-secondary">{user?.email}</p>
          </div>
          
          {/* Right side - Metrics */}
          <div className="text-right">
            <div className="text-sm text-linear-text-secondary">
              {[
                age && `${age}y`,
                user?.height && formattedHeight,
                user?.gender && (user.gender === 'male' ? 'Male' : 'Female')
              ].filter(Boolean).join(' • ')}
            </div>
          </div>
        </div>

        {/* Current Stats */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-linear-text uppercase tracking-wider">Current Stats</h3>
          
          {/* Stats Grid - Responsive with horizontal scroll on mobile */}
          <div className="flex md:grid md:grid-cols-2 gap-3 overflow-x-auto md:overflow-visible -mx-6 px-6 md:mx-0 md:px-0 pb-2 md:pb-0">
            {/* Weight */}
            <div className="bg-linear-bg rounded-lg p-4 border border-linear-border min-w-[140px] md:min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-linear-text-tertiary" />
                  <span className="text-xs text-linear-text-secondary">Weight</span>
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-linear-text">
                  {displayValues?.weight?.toFixed(1) || '--'}
                </span>
                <span className="text-sm text-linear-text-tertiary">
                  {user?.settings?.units?.weight || 'lbs'}
                </span>
              </div>
            </div>

            {/* Body Fat */}
            <div className="bg-linear-bg rounded-lg p-4 border border-linear-border min-w-[140px] md:min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-linear-text-tertiary" />
                  <span className="text-xs text-linear-text-secondary">Body Fat</span>
                </div>
                {displayValues?.isInferred && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-linear-text-tertiary" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          Interpolated ({displayValues.confidenceLevel})
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="mt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-linear-text">
                    {displayValues?.bodyFatPercentage?.toFixed(1) || '--'}
                  </span>
                  <span className="text-sm text-linear-text-tertiary">%</span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-xs text-linear-text-tertiary mt-1 cursor-help">
                        {bodyFatCategory ? (
                          bodyFatCategory === 'obese' ? 'Above Recommended' : bodyFatCategory
                        ) : 'Needs data'}
                      </div>
                    </TooltipTrigger>
                    {bodyFatCategory === 'obese' && (
                      <TooltipContent>
                        <p className="text-xs">This falls within the clinical 'obese' classification per ACSM guidelines.</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Lean Mass */}
            <div className="bg-linear-bg rounded-lg p-4 border border-linear-border min-w-[140px] md:min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-linear-text-tertiary" />
                  <span className="text-xs text-linear-text-secondary">Lean Mass</span>
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                {displayValues?.weight && displayValues?.bodyFatPercentage ? (
                  <>
                    <span className="text-3xl font-bold text-linear-text">
                      {(displayValues.weight * (1 - displayValues.bodyFatPercentage / 100)).toFixed(1)}
                    </span>
                    <span className="text-sm text-linear-text-tertiary">
                      {user?.settings?.units?.weight || 'lbs'}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl text-linear-text-tertiary">--</span>
                )}
              </div>
            </div>

            {/* FFMI */}
            <div className="bg-linear-bg rounded-lg p-4 border border-linear-border min-w-[140px] md:min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-linear-text-tertiary" />
                  <span className="text-xs text-linear-text-secondary">FFMI</span>
                </div>
                {displayValues?.isInferred && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-linear-text-tertiary" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          Calculated from interpolated values
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="mt-2">
                {displayValues?.weight && displayValues?.bodyFatPercentage && user?.height ? (
                  <>
                    <div className="text-3xl font-bold text-linear-text">
                      {calculateFFMI(displayValues.weight, user.height, displayValues.bodyFatPercentage).normalized_ffmi.toFixed(1)}
                    </div>
                    <div className="text-xs text-linear-text-tertiary mt-1">
                      {calculateFFMI(displayValues.weight, user.height, displayValues.bodyFatPercentage).interpretation.replace('_', ' ')}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl text-linear-text-tertiary">--</div>
                    <div className="text-xs text-linear-text-tertiary mt-1">Needs more data</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-linear-text uppercase tracking-wider">Goals Progress</h3>
          
          <div className="space-y-4">
            {/* FFMI Goal */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-linear-text">FFMI Goal</span>
                <span className="text-sm font-medium text-linear-text">
                  {displayValues?.weight && displayValues?.bodyFatPercentage && user?.height ? (
                    <>
                      {calculateFFMI(displayValues.weight, user.height, displayValues.bodyFatPercentage).normalized_ffmi.toFixed(1)} / 22
                    </>
                  ) : (
                    '-- / 22'
                  )}
                </span>
              </div>
              <Progress 
                value={
                  displayValues?.weight && displayValues?.bodyFatPercentage && user?.height
                    ? (() => {
                        const ffmi = calculateFFMI(displayValues.weight, user.height, displayValues.bodyFatPercentage)
                        return Math.min(100, (ffmi.normalized_ffmi / 22) * 100)
                      })()
                    : 0
                } 
                className="h-2" 
              />
            </div>
            
            {/* Body Fat Goal */}
            <div>
              <div className="mb-2">
                <span className="text-sm text-linear-text">Body Fat Goal</span>
              </div>
              <BodyFatScale 
                currentBF={displayValues?.bodyFatPercentage}
                gender={user?.gender as 'male' | 'female' | undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Timeline component
const TimelineSlider = ({ 
  timeline, 
  selectedIndex, 
  onIndexChange 
}: {
  timeline: TimelineEntry[]
  selectedIndex: number
  onIndexChange: (index: number) => void
}) => {
  if (timeline.length === 0) return null

  return (
    <div className="bg-linear-card border-t border-linear-border p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-linear-text-secondary">Timeline</span>
        <span className="text-xs text-linear-text-secondary">
          {selectedIndex + 1} of {timeline.length}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={0}
          max={timeline.length - 1}
          value={selectedIndex}
          onChange={(e) => onIndexChange(parseInt(e.target.value))}
          className="w-full h-2 bg-linear-border rounded-lg appearance-none cursor-pointer slider relative z-10 focus:outline-none"
        />
        {/* Photo indicators */}
        <div className="absolute inset-0 flex items-center pointer-events-none">
          {timeline.map((entry, index) => {
            const position = timeline.length > 1 ? (index / (timeline.length - 1)) * 100 : 50
            const hasPhoto = !!entry.photo
            const hasMetrics = !!entry.metrics
            const hasInferred = !!entry.inferredData
            
            if (!hasPhoto && !hasMetrics) return null
            
            return (
              <div
                key={index}
                className={cn(
                  "absolute w-2 h-2 rounded-full",
                  hasPhoto && hasMetrics && "bg-green-500",
                  hasPhoto && !hasMetrics && hasInferred && "bg-blue-500",
                  hasPhoto && !hasMetrics && !hasInferred && "bg-purple-500",
                  !hasPhoto && hasMetrics && "bg-gray-400"
                )}
                style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                title={
                  hasPhoto && hasMetrics ? "Photo & data" :
                  hasPhoto && hasInferred ? "Photo with interpolated data" :
                  hasPhoto ? "Photo only" :
                  "Data only"
                }
              />
            )
          })}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-linear-text-secondary">
          {format(new Date(timeline[0].date), 'MMM d')}
        </span>
        <span className="text-xs font-medium text-linear-text">
          {format(new Date(timeline[selectedIndex].date), 'PPP')}
        </span>
        <span className="text-xs text-linear-text-secondary">
          {format(new Date(timeline[timeline.length - 1].date), 'MMM d')}
        </span>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-linear-text-secondary">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span>Photo & Data</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span>Photo (interpolated)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-purple-500 rounded-full" />
          <span>Photo only</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full" />
          <span>Data only</span>
        </div>
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
  const [photosHistory, setPhotosHistory] = useState<ProgressPhoto[]>([])
  const [timelineData, setTimelineData] = useState<TimelineEntry[]>([])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (timelineData.length === 0) return
      
      // Don't handle if user is typing in an input
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        e.stopPropagation()
        setSelectedDateIndex(prev => Math.max(0, prev - 1))
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        e.stopPropagation()
        setSelectedDateIndex(prev => Math.min(timelineData.length - 1, prev + 1))
      }
    }

    // Use capture phase to intercept before other handlers
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [timelineData.length])

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
      
      // Load body metrics
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
      
      // Load progress photos
      supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            console.error('Error loading photos:', error)
          } else if (data) {
            setPhotosHistory(data.reverse()) // Reverse to have oldest first for timeline
          }
        })
    }
  }, [user])
  
  // Create timeline data when metrics or photos change
  useEffect(() => {
    if (metricsHistory.length > 0 || photosHistory.length > 0) {
      const timeline = createTimelineData(metricsHistory, photosHistory, profile?.height)
      setTimelineData(timeline)
      
      // Set selected index to the most recent entry
      if (timeline.length > 0) {
        setSelectedDateIndex(timeline.length - 1)
      }
    }
  }, [metricsHistory, photosHistory, profile?.height])

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

  // Get current timeline entry based on selected date
  const currentEntry = timelineData[selectedDateIndex] || null
  const displayValues = currentEntry ? getTimelineDisplayValues(currentEntry) : null

  // Format helpers
  const getFormattedWeight = (weight?: number) => {
    if (!weight) return '--'
    return `${weight.toFixed(1)} ${profile?.settings?.units?.weight || 'lbs'}`
  }

  const getFormattedHeight = (height?: number) => {
    if (!height) return '--'
    return `${height} ${profile?.settings?.units?.height || 'in'}`
  }
  
  // Get photo URL for current entry
  const currentPhotoUrl = currentEntry?.photo?.photo_url 
    ? ensurePublicUrl(currentEntry.photo.photo_url) 
    : currentEntry?.metrics?.photo_url 
    ? ensurePublicUrl(currentEntry.metrics.photo_url)
    : undefined

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
          <Tabs 
            value={activeTabIndex.toString()} 
            onValueChange={(v) => setActiveTabIndex(parseInt(v))} 
            className="h-full flex flex-col"
            orientation="horizontal"
          >
            <TabsList 
              className="grid w-full grid-cols-2 bg-linear-card border-b border-linear-border rounded-none"
              onKeyDown={(e) => {
                // Disable arrow key navigation for tabs
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                  e.preventDefault()
                  e.stopPropagation()
                }
              }}
            >
              <TabsTrigger value="0" className="data-[state=active]:bg-linear-border/50">Body Model</TabsTrigger>
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
                  bodyFatPercentage={displayValues?.bodyFatPercentage}
                  showPhoto={false}
                  className="h-full w-full"
                  onAddPhoto={() => router.push('/log')}
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
                  bodyFatPercentage={displayValues?.bodyFatPercentage}
                  showPhoto={true}
                  profileImage={currentPhotoUrl}
                  className="h-full w-full"
                  onAddPhoto={() => router.push('/log')}
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
            entry={currentEntry}
            user={profile}
            formattedWeight={getFormattedWeight(displayValues?.weight || currentEntry?.metrics?.weight)}
            formattedHeight={getFormattedHeight(profile?.height)}
          />
        </div>
      </div>

      {/* Timeline Slider */}
      <div className="flex-shrink-0">
        <TimelineSlider
          timeline={timelineData}
          selectedIndex={selectedDateIndex}
          onIndexChange={setSelectedDateIndex}
        />
      </div>
    </div>
  )
}