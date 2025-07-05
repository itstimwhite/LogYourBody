'use client'

import { useAuth } from '@/contexts/ClerkAuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { 
  Loader2, 
  ArrowLeft,
  Crown,
  Check,
  X,
  Zap,
} from 'lucide-react'
import Link from 'next/link'

export default function SubscriptionSettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual')

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

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast({
        title: "Upgrade started",
        description: "Redirecting to payment..."
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to start upgrade. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const plans = {
    monthly: {
      price: 9.99,
      period: 'month',
      features: [
        'Unlimited body metrics tracking',
        'All body fat calculation methods',
        'Progress photos with comparison',
        'Advanced analytics & trends',
        'Export your data anytime',
        'Priority support',
        'Early access to new features'
      ]
    },
    annual: {
      price: 69.99,
      period: 'year',
      monthlyPrice: 5.83,
      savings: 49.89,
      savingsPercent: 42,
      features: [
        'Everything in monthly plan',
        'Save 42% compared to monthly',
        'Annual progress report',
        'Custom goal setting',
        'Nutrition tracking (coming soon)',
        'Workout logging (coming soon)'
      ]
    }
  }

  const _currentPlan = selectedPlan === 'annual' ? plans.annual : plans.monthly

  // Mock subscription data
  const subscription = {
    status: 'free',
    trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    nextBillingDate: null,
    plan: null
  }

  const daysLeftInTrial = Math.ceil((subscription.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

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
              <h1 className="text-xl font-bold text-linear-text">Subscription</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Current Plan */}
        <Card className="bg-linear-card border-linear-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-linear-text">Current Plan</CardTitle>
                <CardDescription className="text-linear-text-secondary">
                  Your subscription status and benefits
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                Free Trial
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-linear-purple/20 bg-linear-purple/5">
              <Zap className="h-4 w-4 text-linear-purple" />
              <AlertDescription className="text-linear-text">
                <strong>{daysLeftInTrial} days left</strong> in your free trial. 
                Upgrade now to keep all your data and features.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-linear-text-secondary">Trial Progress</span>
                <span className="text-linear-text font-medium">
                  {7 - daysLeftInTrial} of 7 days
                </span>
              </div>
              <Progress value={(7 - daysLeftInTrial) / 7 * 100} className="h-2" />
            </div>
            
            <div className="pt-2">
              <p className="text-sm text-linear-text-secondary">
                After your trial ends, you'll be limited to:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-linear-text-secondary">
                <li className="flex items-center gap-2">
                  <X className="h-3 w-3 text-red-500" />
                  View-only access to past data
                </li>
                <li className="flex items-center gap-2">
                  <X className="h-3 w-3 text-red-500" />
                  No new entries or photos
                </li>
                <li className="flex items-center gap-2">
                  <X className="h-3 w-3 text-red-500" />
                  Limited to basic features
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Plans */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-linear-text mb-2">
              Choose Your Plan
            </h2>
            <p className="text-linear-text-secondary">
              Full access to all features. Cancel anytime.
            </p>
          </div>

          {/* Plan Toggle */}
          <div className="flex justify-center">
            <div className="bg-linear-card border border-linear-border rounded-lg p-1 flex">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPlan === 'monthly'
                    ? 'bg-linear-purple text-white'
                    : 'text-linear-text-secondary hover:text-linear-text'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('annual')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPlan === 'annual'
                    ? 'bg-linear-purple text-white'
                    : 'text-linear-text-secondary hover:text-linear-text'
                }`}
              >
                Annual
                <Badge variant="secondary" className="ml-2 text-xs">
                  Save 42%
                </Badge>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Monthly Plan */}
            <Card 
              className={`bg-linear-card transition-all cursor-pointer ${
                selectedPlan === 'monthly' 
                  ? 'border-linear-purple ring-2 ring-linear-purple/20' 
                  : 'border-linear-border hover:border-linear-text-tertiary'
              }`}
              onClick={() => setSelectedPlan('monthly')}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-linear-text">Monthly</CardTitle>
                  {selectedPlan === 'monthly' && (
                    <div className="h-5 w-5 rounded-full bg-linear-purple flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-linear-text">$9.99</span>
                  <span className="text-linear-text-secondary">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plans.monthly.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-linear-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Annual Plan */}
            <Card 
              className={`bg-linear-card transition-all cursor-pointer relative ${
                selectedPlan === 'annual' 
                  ? 'border-linear-purple ring-2 ring-linear-purple/20' 
                  : 'border-linear-border hover:border-linear-text-tertiary'
              }`}
              onClick={() => setSelectedPlan('annual')}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-linear-purple text-white">
                  BEST VALUE
                </Badge>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-linear-text">Annual</CardTitle>
                  {selectedPlan === 'annual' && (
                    <div className="h-5 w-5 rounded-full bg-linear-purple flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-linear-text">$69.99</span>
                  <span className="text-linear-text-secondary">/year</span>
                </div>
                <p className="text-sm text-green-500 mt-1">
                  Save ${plans.annual.savings} ({plans.annual.savingsPercent}% off)
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plans.annual.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-linear-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Upgrade Button */}
          <div className="text-center pt-4">
            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              size="lg"
              className="bg-linear-purple hover:bg-linear-purple/80 text-white px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to {selectedPlan === 'annual' ? 'Annual' : 'Monthly'}
                </>
              )}
            </Button>
            <p className="text-xs text-linear-text-tertiary mt-3">
              No commitment. Cancel anytime. Secure payment.
            </p>
          </div>
        </div>

        {/* Features Comparison */}
        <Card className="bg-linear-card border-linear-border">
          <CardHeader>
            <CardTitle className="text-linear-text">What's Included</CardTitle>
            <CardDescription className="text-linear-text-secondary">
              Everything you need to track your fitness journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-linear-text mb-2">Core Features</h4>
                <div className="space-y-2">
                  {[
                    'Unlimited weight entries',
                    'Body fat % tracking',
                    'FFMI calculations',
                    'Progress photos',
                    'Apple Health sync',
                    'Data export'
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-linear-text-secondary">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-linear-text mb-2">Premium Analytics</h4>
                <div className="space-y-2">
                  {[
                    'Trend predictions',
                    'Weekly reports',
                    'Goal tracking',
                    'Body composition analysis',
                    'Progress insights',
                    'Custom reminders'
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-linear-text-secondary">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="bg-linear-card border-linear-border">
          <CardHeader>
            <CardTitle className="text-linear-text">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-linear-text mb-1">Can I cancel anytime?</h4>
              <p className="text-sm text-linear-text-secondary">
                Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
            
            <Separator className="bg-linear-border" />
            
            <div>
              <h4 className="font-medium text-linear-text mb-1">What happens to my data if I cancel?</h4>
              <p className="text-sm text-linear-text-secondary">
                Your data is always yours. You can export it anytime, and we'll keep it safe for 90 days after cancellation in case you want to reactivate.
              </p>
            </div>
            
            <Separator className="bg-linear-border" />
            
            <div>
              <h4 className="font-medium text-linear-text mb-1">Do you offer refunds?</h4>
              <p className="text-sm text-linear-text-secondary">
                We offer a 30-day money-back guarantee for annual plans. Monthly plans can be cancelled at any time.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}