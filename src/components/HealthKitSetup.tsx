import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Activity, TrendingUp, Lock, ChevronRight } from 'lucide-react';
import { useHealthKit } from '@/hooks/use-healthkit';

interface HealthKitSetupProps {
  onComplete: (healthData?: any) => void;
  onSkip: () => void;
}

export function HealthKitSetup({ onComplete, onSkip }: HealthKitSetupProps) {
  const { isAvailable, requestPermissions, getHealthData, loading } = useHealthKit();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleEnableHealthKit = async () => {
    setIsRequesting(true);
    
    try {
      const granted = await requestPermissions();
      
      if (granted) {
        // Get health data to pre-fill profile
        const healthData = await getHealthData();
        onComplete(healthData);
      } else {
        // Permissions denied, continue without health data
        onComplete();
      }
    } catch (error) {
      console.error('HealthKit setup error:', error);
      onComplete();
    } finally {
      setIsRequesting(false);
    }
  };

  if (!isAvailable) {
    // HealthKit not available, skip this step
    onComplete();
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-background border-border">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold text-foreground">
              Connect Health Data
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Automatically sync your health metrics and pre-fill your profile with Apple Health data
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Benefits List */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Auto-fill Profile</h4>
                <p className="text-sm text-muted-foreground">
                  Height, weight, and birthday from your Health app
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Sync Weight History</h4>
                <p className="text-sm text-muted-foreground">
                  Import your existing weight and body composition data
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Privacy Protected</h4>
                <p className="text-sm text-muted-foreground">
                  You control what data is shared and can revoke access anytime
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground text-center">
              LogYourBody only accesses the health data you explicitly allow. 
              Your data stays secure and private on your device.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleEnableHealthKit}
              disabled={isRequesting || loading}
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              {isRequesting || loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                  Connecting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Connect Apple Health
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={onSkip}
              disabled={isRequesting || loading}
              className="w-full h-12 text-muted-foreground hover:text-foreground"
            >
              Set up manually instead
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}