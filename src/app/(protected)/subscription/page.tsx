'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import {
  ArrowLeft,
  Crown,
  Calendar,
  CreditCard,
  AlertCircle,
  Check,
} from 'lucide-react'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'

interface SubscriptionInfo {
  status: 'trial' | 'active' | 'expired' | 'cancelled'
  daysRemainingInTrial?: number
  trialEndDate?: Date
  subscriptionEndDate?: Date
}

interface BillingInfo {
  nextBillingDate?: Date
  amount?: number
  currency?: string
  paymentMethod?: string
}

export default function SubscriptionPage() {
  const router = useRouter()
  
  // Mock subscription data - in real app this would come from RevenueCat/Stripe
  const [subscriptionInfo] = useState<SubscriptionInfo>({
    status: 'trial',
    daysRemainingInTrial: 5,
    trialEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  })

  const [billingInfo] = useState<BillingInfo>({
    nextBillingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    amount: 4.99,
    currency: 'USD',
    paymentMethod: '•••• 4242',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A'
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusBadge = () => {
    switch (subscriptionInfo.status) {
      case 'trial':
        return (
          <Badge variant="outline" className="border-linear-purple text-linear-purple">
            Trial Active
          </Badge>
        )
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>
      case 'expired':
      case 'cancelled':
        return <Badge variant="destructive">Expired</Badge>
      default:
        return null
    }
  }

  const handleUpgrade = () => {
    // In real app, this would trigger RevenueCat purchase flow
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setShowUpgrade(false)
    }, 2000)
  }

  const handleManageSubscription = () => {
    // Open App Store or Play Store subscription management
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      window.open('https://apps.apple.com/account/subscriptions', '_blank')
    } else {
      window.open('https://play.google.com/store/account/subscriptions', '_blank')
    }
  }

  if (showUpgrade) {
    return (
      <div className="min-h-screen bg-linear-bg text-linear-text font-inter">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowUpgrade(false)}
                className="h-10 w-10 text-linear-text-secondary hover:text-linear-text"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-linear-text">Upgrade to Premium</h1>
            </div>

            {/* Pricing Card */}
            <div className="mb-8 rounded-2xl border border-linear-border bg-linear-card p-8 text-center">
              <Crown className="mx-auto mb-4 h-12 w-12 text-linear-purple" />
              <h2 className="mb-2 text-3xl font-bold text-linear-text">Premium</h2>
              <p className="mb-6 text-linear-text-secondary">
                Unlock all features and track unlimited measurements
              </p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-linear-text">$4.99</span>
                <span className="text-linear-text-secondary">/month</span>
              </div>

              <Button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full bg-linear-text text-linear-bg px-8 py-4 text-lg font-medium rounded-xl hover:bg-linear-text-secondary transition-all duration-200"
              >
                {isLoading ? 'Processing...' : 'Start Premium'}
              </Button>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-linear-text">What&apos;s included:</h3>
              <div className="grid gap-3">
                {[
                  'Unlimited body measurements',
                  'Advanced analytics & trends',
                  'Photo progress tracking',
                  'Health app sync (iOS/Android)',
                  'Export data anytime',
                  'Priority customer support',
                  'No ads, ever',
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-purple/10">
                      <Check className="h-4 w-4 text-linear-purple" />
                    </div>
                    <span className="text-linear-text-secondary">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-linear-text-secondary">
              Cancel anytime. No hidden fees or commitments.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-bg text-linear-text font-inter">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => router.push('/settings')}
              className="h-10 w-10 text-linear-text-secondary hover:text-linear-text"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-linear-purple" />
              <h1 className="text-2xl font-bold text-linear-text">Subscription</h1>
            </div>
          </div>

          <div className="space-y-8">
            {/* Current Status */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-linear-text">Current Plan</h2>
                {getStatusBadge()}
              </div>

              <div className="rounded-xl border border-linear-border bg-linear-card p-6">
                {subscriptionInfo.status === 'trial' ? (
                  <>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-purple/10">
                        <Crown className="h-6 w-6 text-linear-purple" />
                      </div>
                      <div>
                        <div className="font-semibold text-linear-text">Free Trial</div>
                        <div className="text-sm text-linear-text-secondary">
                          {subscriptionInfo.daysRemainingInTrial} days remaining
                        </div>
                      </div>
                    </div>

                    {subscriptionInfo.trialEndDate && (
                      <div className="mb-4 flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-linear-text-secondary" />
                        <span className="text-linear-text-secondary">
                          Trial ends on {formatDate(subscriptionInfo.trialEndDate)}
                        </span>
                      </div>
                    )}

                    <Button
                      onClick={() => setShowUpgrade(true)}
                      className="w-full bg-linear-text text-linear-bg hover:bg-linear-text-secondary"
                    >
                      Upgrade to Premium
                    </Button>
                  </>
                ) : subscriptionInfo.status === 'active' ? (
                  <>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                        <Crown className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-linear-text">Premium</div>
                        <div className="text-sm text-linear-text-secondary">
                          Active subscription
                        </div>
                      </div>
                    </div>

                    {subscriptionInfo.subscriptionEndDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-linear-text-secondary" />
                        <span className="text-linear-text-secondary">
                          Renews on {formatDate(subscriptionInfo.subscriptionEndDate)}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                        <AlertCircle className="h-6 w-6 text-red-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-linear-text">
                          Subscription Expired
                        </div>
                        <div className="text-sm text-linear-text-secondary">
                          Reactivate to continue using LogYourBody
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => setShowUpgrade(true)}
                      className="w-full bg-linear-text text-linear-bg hover:bg-linear-text-secondary"
                    >
                      Reactivate Premium
                    </Button>
                  </>
                )}
              </div>
            </section>

            {/* Billing Information */}
            {subscriptionInfo.status === 'active' && billingInfo && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-linear-text">Billing Information</h2>

                <div className="rounded-xl border border-linear-border bg-linear-card p-6">
                  <div className="space-y-4">
                    {billingInfo.nextBillingDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-linear-text-secondary">
                          Next billing date
                        </span>
                        <span className="font-medium text-linear-text">
                          {formatDate(billingInfo.nextBillingDate)}
                        </span>
                      </div>
                    )}

                    {billingInfo.amount && (
                      <div className="flex items-center justify-between">
                        <span className="text-linear-text-secondary">Amount</span>
                        <span className="font-medium text-linear-text">
                          ${billingInfo.amount} {billingInfo.currency}
                        </span>
                      </div>
                    )}

                    {billingInfo.paymentMethod && (
                      <div className="flex items-center justify-between">
                        <span className="text-linear-text-secondary">Payment method</span>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-linear-text-secondary" />
                          <span className="font-medium text-linear-text">
                            {billingInfo.paymentMethod}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Manage Subscription */}
            {subscriptionInfo.status === 'active' && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-linear-text">Manage Subscription</h2>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={handleManageSubscription}
                    disabled={isLoading}
                    className="w-full border-linear-border text-linear-text hover:bg-linear-border/30"
                  >
                    Manage in App Store
                  </Button>

                  <p className="text-center text-xs text-linear-text-secondary">
                    To cancel or modify your subscription, use your device&apos;s App Store or Google Play settings.
                  </p>
                </div>
              </section>
            )}

            {/* Premium Features Preview */}
            {subscriptionInfo.status !== 'active' && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-linear-text">Premium Features</h2>

                <div className="rounded-xl border border-linear-border bg-linear-card p-6">
                  <div className="space-y-3">
                    {[
                      'Unlimited body measurements',
                      'Advanced analytics & trends',
                      'Photo progress tracking',
                      'Health app sync',
                      'Export data',
                      'Priority support',
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Crown className="h-4 w-4 flex-shrink-0 text-linear-purple" />
                        <span className="text-sm text-linear-text-secondary">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}