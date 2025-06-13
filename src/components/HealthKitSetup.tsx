import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Activity, Scale, TrendingUp, Shield, ArrowRight } from 'lucide-react';
import { useHealthKit } from '@/hooks/use-healthkit';
import { isNativeiOS } from '@/lib/platform';

interface HealthKitSetupProps {
  onComplete: (healthData?: any) => void;
  onSkip: () => void;
}

export function HealthKitSetup({ onComplete, onSkip }: HealthKitSetupProps) {
  const { isAvailable, requestPermissions, getHealthData, loading } = useHealthKit();
  const [isRequesting, setIsRequesting] = useState(false);

  // Early exit for non-iOS platforms or when loading completes and HealthKit isn't available
  React.useEffect(() => {
    if (!isNativeiOS()) {
      console.log("HealthKitSetup: Not native iOS, skipping");
      onComplete();
      return;
    }

    // Wait for loading to complete, then check availability
    if (!loading && !isAvailable) {
      console.log("HealthKitSetup: HealthKit not available after loading, skipping");
      onComplete();
    }
  }, [isAvailable, loading, onComplete]);

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

  // Only show on native iOS
  if (!isNativeiOS() || !isAvailable) {
    // HealthKit not available, skip this step
    onComplete();
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-6 safe-area-inset">
      <div className="flex-1 flex flex-col justify-center space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Heart className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Connect Apple Health
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Automatically sync your body composition data from Apple Health for a seamless tracking experience.
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-4">
          <Card className="border-border bg-secondary/30">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Scale className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">Automatic Weight Sync</h3>
                  <p className="text-muted-foreground text-xs mt-1">
                    Your weight measurements will automatically appear in LogYourBody
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-secondary/30">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">Body Composition Data</h3>
                  <p className="text-muted-foreground text-xs mt-1">
                    Import body fat percentage and lean body mass from compatible devices
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-secondary/30">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">Historical Data</h3>
                  <p className="text-muted-foreground text-xs mt-1">
                    Access your existing health data to see your complete fitness journey
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Notice */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground text-sm mb-1">Your Privacy is Protected</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  LogYourBody only accesses the health data you choose to share. 
                  Your data stays secure on your device and is never shared without your permission.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
      
      {/* Fixed Action Buttons at Bottom */}
      <div className="space-y-4 pb-safe">
        <Button
          onClick={handleEnableHealthKit}
          disabled={isRequesting || loading}
          className="w-full h-14 text-base font-medium rounded-2xl"
          size="lg"
        >
          {isRequesting || loading ? (
            <>
              <div className="h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin mr-2" />
              Requesting Permission...
            </>
          ) : (
            <>
              Connect Apple Health
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={onSkip}
          disabled={isRequesting || loading}
          className="w-full h-14 text-base border-2 rounded-2xl"
          size="lg"
        >
          Set Up Later
        </Button>

      </div>
      
      {/* Fixed Action Buttons at Bottom */}
      <div className="space-y-4 pb-safe">
        <p className="text-center text-sm text-muted-foreground">
          You can always enable this later in Settings
        </p>
      </div>
    </div>
  );
}