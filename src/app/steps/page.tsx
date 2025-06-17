'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { 
  ArrowLeft,
  Footprints,
  TrendingUp,
  Target,
  Calendar,
  Plus,
  Edit3,
  Check,
  Info,
  Loader2,
  Activity,
  Trophy,
  Flame
} from 'lucide-react'
import Link from 'next/link'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StepEntry {
  id: string
  date: string
  steps: number
  calories?: number
  distance?: number // in km
}

interface StepGoal {
  daily: number
  weekly: number
}

export default function StepsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stepEntries, setStepEntries] = useState<StepEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingToday, setEditingToday] = useState(false)
  const [todaySteps, setTodaySteps] = useState('')
  const [goal, setGoal] = useState<StepGoal>({ daily: 10000, weekly: 70000 })
  const [editingGoal, setEditingGoal] = useState(false)
  const [newGoal, setNewGoal] = useState(goal.daily.toString())

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (user) {
      loadStepData()
    }
  }, [user, loading, router])

  const loadStepData = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data for the current week
      const today = new Date()
      const weekStart = startOfWeek(today, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
      const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })
      
      const mockEntries: StepEntry[] = daysInWeek.map((date, index) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        const isBeforeToday = date < today && !isToday(date)
        
        return {
          id: dateStr,
          date: dateStr,
          steps: isBeforeToday ? Math.floor(Math.random() * 5000 + 7000) : 0,
          calories: isBeforeToday ? Math.floor(Math.random() * 200 + 300) : 0,
          distance: isBeforeToday ? parseFloat((Math.random() * 3 + 4).toFixed(1)) : 0
        }
      })
      
      setStepEntries(mockEntries)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load step data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getTodayEntry = () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return stepEntries.find(entry => entry.date === today)
  }

  const getWeeklyTotal = () => {
    return stepEntries.reduce((total, entry) => total + entry.steps, 0)
  }

  const getWeeklyAverage = () => {
    const daysWithSteps = stepEntries.filter(entry => entry.steps > 0).length
    return daysWithSteps > 0 ? Math.floor(getWeeklyTotal() / daysWithSteps) : 0
  }

  const getDailyProgress = (steps: number) => {
    return Math.min((steps / goal.daily) * 100, 100)
  }

  const getWeeklyProgress = () => {
    return Math.min((getWeeklyTotal() / goal.weekly) * 100, 100)
  }

  const handleSaveTodaySteps = async () => {
    const steps = parseInt(todaySteps)
    if (isNaN(steps) || steps < 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid number of steps.",
        variant: "destructive"
      })
      return
    }

    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      const calories = Math.floor(steps * 0.04) // Rough estimate: 0.04 cal per step
      const distance = parseFloat((steps * 0.0008).toFixed(1)) // Rough estimate: 0.8m per step
      
      setStepEntries(prev => {
        const filtered = prev.filter(entry => entry.date !== today)
        return [...filtered, {
          id: today,
          date: today,
          steps,
          calories,
          distance
        }].sort((a, b) => a.date.localeCompare(b.date))
      })
      
      setEditingToday(false)
      setTodaySteps('')
      
      toast({
        title: "Steps logged!",
        description: `${steps.toLocaleString()} steps recorded for today.`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save steps. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleSaveGoal = () => {
    const newDailyGoal = parseInt(newGoal)
    if (isNaN(newDailyGoal) || newDailyGoal < 1000) {
      toast({
        title: "Invalid goal",
        description: "Please enter a goal of at least 1,000 steps.",
        variant: "destructive"
      })
      return
    }

    setGoal({
      daily: newDailyGoal,
      weekly: newDailyGoal * 7
    })
    setEditingGoal(false)
    
    toast({
      title: "Goal updated!",
      description: `Daily goal set to ${newDailyGoal.toLocaleString()} steps.`
    })
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-bg">
        <Loader2 className="h-8 w-8 animate-spin text-linear-text-secondary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const todayEntry = getTodayEntry()
  const weeklyTotal = getWeeklyTotal()
  const weeklyAverage = getWeeklyAverage()
  const weeklyProgress = getWeeklyProgress()

  return (
    <div className="min-h-screen bg-linear-bg">
      {/* Header */}
      <header className="bg-linear-card shadow-sm border-b border-linear-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-linear-text">Step Tracking</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Today's Steps */}
        <Card className="bg-linear-card border-linear-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-linear-purple/10 flex items-center justify-center">
                  <Footprints className="h-5 w-5 text-linear-purple" />
                </div>
                <div>
                  <CardTitle className="text-linear-text">Today's Steps</CardTitle>
                  <CardDescription className="text-linear-text-secondary">
                    {format(new Date(), 'EEEE, MMMM d')}
                  </CardDescription>
                </div>
              </div>
              {!editingToday && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingToday(true)
                    setTodaySteps(todayEntry?.steps.toString() || '')
                  }}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editingToday ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="steps">Number of steps</Label>
                  <Input
                    id="steps"
                    type="number"
                    value={todaySteps}
                    onChange={(e) => setTodaySteps(e.target.value)}
                    placeholder="10000"
                    className="bg-linear-bg border-linear-border text-linear-text"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setEditingToday(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveTodaySteps}
                    className="flex-1 bg-linear-purple hover:bg-linear-purple/80 text-white"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <motion.div 
                    className="text-5xl font-bold text-linear-text mb-2"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {(todayEntry?.steps || 0).toLocaleString()}
                  </motion.div>
                  <p className="text-linear-text-secondary">
                    of {goal.daily.toLocaleString()} goal
                  </p>
                </div>
                
                <Progress 
                  value={getDailyProgress(todayEntry?.steps || 0)} 
                  className="h-3"
                />
                
                {todayEntry && todayEntry.steps > 0 && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <div className="text-sm text-linear-text-secondary">Calories</div>
                      <div className="font-medium text-linear-text">
                        {todayEntry.calories || 0} cal
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-linear-text-secondary">Distance</div>
                      <div className="font-medium text-linear-text">
                        {todayEntry.distance || 0} km
                      </div>
                    </div>
                  </div>
                )}
                
                {!todayEntry || todayEntry.steps === 0 ? (
                  <Alert className="border-linear-border bg-linear-card">
                    <Info className="h-4 w-4 text-linear-text" />
                    <AlertDescription className="text-linear-text-secondary">
                      No steps logged for today. Tap the edit button to add your steps.
                    </AlertDescription>
                  </Alert>
                ) : todayEntry.steps >= goal.daily ? (
                  <Alert className="border-green-500/20 bg-green-500/5">
                    <Trophy className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-500">
                      Great job! You've reached your daily goal! 🎉
                    </AlertDescription>
                  </Alert>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Overview */}
        <Card className="bg-linear-card border-linear-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-linear-text">This Week</CardTitle>
                <CardDescription className="text-linear-text-secondary">
                  Your progress for the current week
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {weeklyProgress.toFixed(0)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Weekly stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-linear-text">
                  {weeklyTotal.toLocaleString()}
                </div>
                <div className="text-sm text-linear-text-secondary">Total Steps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-linear-text">
                  {weeklyAverage.toLocaleString()}
                </div>
                <div className="text-sm text-linear-text-secondary">Daily Avg</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-linear-text">
                  {stepEntries.filter(e => e.steps >= goal.daily).length}
                </div>
                <div className="text-sm text-linear-text-secondary">Goals Met</div>
              </div>
            </div>

            <Progress value={weeklyProgress} className="h-3" />

            {/* Daily breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-linear-text">Daily Breakdown</h4>
              <div className="grid grid-cols-7 gap-2">
                {stepEntries.map((entry) => {
                  const date = parseISO(entry.date)
                  const progress = getDailyProgress(entry.steps)
                  const isGoalMet = entry.steps >= goal.daily
                  
                  return (
                    <div
                      key={entry.id}
                      className={cn(
                        "text-center space-y-2 p-2 rounded-lg",
                        isToday(date) && "ring-2 ring-linear-purple"
                      )}
                    >
                      <div className="text-xs text-linear-text-secondary">
                        {format(date, 'EEE')}
                      </div>
                      <div className="relative">
                        <div className="h-16 w-full bg-linear-border rounded-full overflow-hidden">
                          <motion.div
                            className={cn(
                              "h-full rounded-full",
                              isGoalMet ? "bg-green-500" : "bg-linear-purple"
                            )}
                            initial={{ height: 0 }}
                            animate={{ height: `${progress}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            style={{ 
                              transformOrigin: 'bottom',
                              transform: 'scaleY(-1)'
                            }}
                          />
                        </div>
                        {isGoalMet && (
                          <Trophy className="h-3 w-3 text-green-500 mx-auto mt-1" />
                        )}
                      </div>
                      <div className="text-xs font-medium text-linear-text">
                        {entry.steps > 0 ? `${(entry.steps / 1000).toFixed(1)}k` : '-'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Goal */}
        <Card className="bg-linear-card border-linear-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-linear-purple/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-linear-purple" />
                </div>
                <div>
                  <CardTitle className="text-linear-text">Daily Goal</CardTitle>
                  <CardDescription className="text-linear-text-secondary">
                    Your target steps per day
                  </CardDescription>
                </div>
              </div>
              {!editingGoal && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingGoal(true)
                    setNewGoal(goal.daily.toString())
                  }}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editingGoal ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal">Daily step goal</Label>
                  <Input
                    id="goal"
                    type="number"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="10000"
                    className="bg-linear-bg border-linear-border text-linear-text"
                    autoFocus
                  />
                  <p className="text-xs text-linear-text-tertiary">
                    Recommended: 8,000-10,000 steps per day
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setEditingGoal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveGoal}
                    className="flex-1 bg-linear-purple hover:bg-linear-purple/80 text-white"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-linear-text">
                      {goal.daily.toLocaleString()} steps
                    </div>
                    <div className="text-sm text-linear-text-secondary">
                      {goal.weekly.toLocaleString()} steps per week
                    </div>
                  </div>
                  <Activity className="h-8 w-8 text-linear-purple" />
                </div>
                
                <Alert className="border-linear-border bg-linear-card">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <AlertDescription className="text-linear-text-secondary">
                    Walking {goal.daily.toLocaleString()} steps burns approximately{' '}
                    <strong className="text-linear-text">
                      {Math.floor(goal.daily * 0.04)} calories
                    </strong>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}