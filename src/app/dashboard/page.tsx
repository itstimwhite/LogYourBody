'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, User, Activity, Calendar, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

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

  return (
    <div className="min-h-screen bg-linear-bg">
      {/* Header */}
      <header className="bg-linear-card shadow-sm border-b border-linear-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-linear-text">Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-linear-text-secondary">{user.email}</span>
              <Button onClick={signOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <Card className="bg-linear-card border-linear-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-linear-text">Total Workouts</CardTitle>
              <Activity className="h-4 w-4 text-linear-text-tertiary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-linear-text">0</div>
              <p className="text-xs text-linear-text-tertiary">Start logging your workouts</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-card border-linear-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-linear-text">Current Weight</CardTitle>
              <User className="h-4 w-4 text-linear-text-tertiary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-linear-text">--</div>
              <p className="text-xs text-linear-text-tertiary">No data yet</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-card border-linear-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-linear-text">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-linear-text-tertiary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-linear-text">0</div>
              <p className="text-xs text-linear-text-tertiary">Workouts completed</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-card border-linear-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-linear-text">Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-linear-text-tertiary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-linear-text">--</div>
              <p className="text-xs text-linear-text-tertiary">Track your journey</p>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Message */}
        <Card className="bg-linear-card border-linear-border">
          <CardHeader>
            <CardTitle className="text-linear-text">Welcome to LogYourBody!</CardTitle>
            <CardDescription className="text-linear-text-secondary">
              Your fitness tracking journey starts here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-linear-text-secondary">
                You&apos;re successfully logged in! This dashboard will soon include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-linear-text-secondary">
                <li>Daily weight tracking</li>
                <li>Body composition measurements</li>
                <li>Progress photos</li>
                <li>Workout logging</li>
                <li>Nutrition tracking</li>
                <li>Progress analytics and trends</li>
              </ul>
              <div className="pt-4">
                <Button className="bg-linear-purple hover:bg-linear-purple/80 text-white">
                  Start Logging
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}