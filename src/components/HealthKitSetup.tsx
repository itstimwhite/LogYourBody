import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  Activity,
  Scale,
  TrendingUp,
  Shield,
  ArrowRight,
} from "lucide-react";
import { useHealthKit } from "@/hooks/use-healthkit";
import { isNativeiOS } from "@/lib/platform";

interface HealthKitSetupProps {
  onComplete: (healthData?: any) => void;
  onSkip: () => void;
}

export function HealthKitSetup({ onComplete, onSkip }: HealthKitSetupProps) {
  const { isAvailable, requestPermissions, getHealthData, loading } =
    useHealthKit();
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
      console.log(
        "HealthKitSetup: HealthKit not available after loading, skipping",
      );
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
      console.error("HealthKit setup error:", error);
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
    <div className="safe-area-inset flex min-h-svh flex-col justify-between bg-background p-6">
      <div className="flex flex-1 flex-col justify-center space-y-8">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="mb-2 text-2xl font-bold text-foreground">
              Connect Apple Health
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Automatically sync your body composition data from Apple Health
              for a seamless tracking experience.
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-4">
          <Card className="border-border bg-secondary/30">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Scale className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    Automatic Weight Sync
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your weight measurements will automatically appear in
                    LogYourBody
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-secondary/30">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    Body Composition Data
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Import body fat percentage and lean body mass from
                    compatible devices
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-secondary/30">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    Historical Data
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Access your existing health data to see your complete
                    fitness journey
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
              <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <h3 className="mb-1 text-sm font-medium text-foreground">
                  Your Privacy is Protected
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  LogYourBody only accesses the health data you choose to share.
                  Your data stays secure on your device and is never shared
                  without your permission.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Action Buttons at Bottom */}
      <div className="space-y-4 pb-safe-bottom">
        <Button
          onClick={handleEnableHealthKit}
          disabled={isRequesting || loading}
          className="h-14 w-full rounded-2xl text-base font-medium"
          size="lg"
        >
          {isRequesting || loading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
              Requesting Permission...
            </>
          ) : (
            <>
              Connect Apple Health
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={onSkip}
          disabled={isRequesting || loading}
          className="h-14 w-full rounded-2xl border-2 text-base"
          size="lg"
        >
          Set Up Later
        </Button>
      </div>

      {/* Fixed Action Buttons at Bottom */}
      <div className="space-y-4 pb-safe-bottom">
        <p className="text-center text-sm text-muted-foreground">
          You can always enable this later in Settings
        </p>
      </div>
    </div>
  );
}
