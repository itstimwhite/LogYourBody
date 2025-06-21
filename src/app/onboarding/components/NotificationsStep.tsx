'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, BellOff, Check } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function NotificationsStep() {
  const { updateData, nextStep, previousStep } = useOnboarding()
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(true)
  const [hasAsked, setHasAsked] = useState(false)

  useEffect(() => {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      setIsSupported(false)
    } else {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!isSupported) return
    
    setHasAsked(true)
    
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      
      if (result === 'granted') {
        updateData({ notificationsEnabled: true })
        
        // Show test notification
        new Notification('LogYourBody', {
          body: 'You\'ll get reminders for scans, updates, and check-ins.',
          icon: '/icon-192x192.png'
        })
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
    }
  }

  const skip = () => {
    updateData({ notificationsEnabled: false })
    nextStep()
  }

  return (
    <Card className="bg-linear-card border-linear-border">
      <CardHeader>
        <CardTitle className="text-linear-text">Enable Notifications</CardTitle>
        <CardDescription className="text-linear-text-secondary">
          Get reminders for scans, updates, and check-ins
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isSupported ? (
          <Alert>
            <BellOff className="h-4 w-4" />
            <AlertDescription>
              Notifications are not supported in your browser. 
              You can still use LogYourBody without them.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="text-center py-8">
              {permission === 'granted' ? (
                <>
                  <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-linear-text font-medium mb-2">
                    Notifications enabled!
                  </p>
                  <p className="text-sm text-linear-text-secondary">
                    You'll receive reminders to log your progress
                  </p>
                </>
              ) : permission === 'denied' ? (
                <>
                  <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                    <BellOff className="h-8 w-8 text-red-500" />
                  </div>
                  <p className="text-linear-text font-medium mb-2">
                    Notifications blocked
                  </p>
                  <p className="text-sm text-linear-text-secondary">
                    You can enable them later in your browser settings
                  </p>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-full bg-linear-purple/10 flex items-center justify-center mx-auto mb-4">
                    <Bell className="h-8 w-8 text-linear-purple" />
                  </div>
                  <p className="text-linear-text font-medium mb-2">
                    Stay on track with reminders
                  </p>
                  <p className="text-sm text-linear-text-secondary">
                    We'll remind you to log your metrics and celebrate milestones
                  </p>
                </>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <div className="h-5 w-5 rounded-full bg-linear-purple/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-linear-purple" />
                </div>
                <div>
                  <p className="text-linear-text font-medium">Daily logging reminders</p>
                  <p className="text-linear-text-secondary">Never forget to track your progress</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 text-sm">
                <div className="h-5 w-5 rounded-full bg-linear-purple/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-linear-purple" />
                </div>
                <div>
                  <p className="text-linear-text font-medium">Milestone celebrations</p>
                  <p className="text-linear-text-secondary">Get notified when you hit your goals</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 text-sm">
                <div className="h-5 w-5 rounded-full bg-linear-purple/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-linear-purple" />
                </div>
                <div>
                  <p className="text-linear-text font-medium">Weekly insights</p>
                  <p className="text-linear-text-secondary">Review your progress and trends</p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            variant="ghost"
            onClick={previousStep}
          >
            Back
          </Button>
          
          {permission === 'default' && isSupported && !hasAsked && (
            <Button
              onClick={requestPermission}
              className="ml-auto bg-linear-purple hover:bg-linear-purple/90 text-white"
            >
              Enable Notifications
            </Button>
          )}
          
          {(permission !== 'default' || !isSupported || hasAsked) && (
            <Button
              onClick={nextStep}
              className="ml-auto bg-linear-purple hover:bg-linear-purple/90 text-white"
            >
              Continue
            </Button>
          )}
        </div>

        {permission === 'default' && isSupported && (
          <button
            onClick={skip}
            className="text-sm text-linear-text-tertiary hover:text-linear-text text-center w-full"
          >
            Skip for now
          </button>
        )}
      </CardContent>
    </Card>
  )
}