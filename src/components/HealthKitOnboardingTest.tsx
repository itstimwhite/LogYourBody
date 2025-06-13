import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, RotateCcw, User, CheckCircle } from "lucide-react";
import { HealthKitSetup } from "./HealthKitSetup";
import { ProfileSetup } from "./ProfileSetup";
import { isNativeiOS } from "@/lib/platform";

type FlowState = "idle" | "healthkit" | "profile" | "complete";

export function HealthKitOnboardingTest() {
  const [flowState, setFlowState] = useState<FlowState>("idle");
  const [healthKitData, setHealthKitData] = useState<any>(null);

  const handleHealthKitComplete = (data?: any) => {
    console.log("HealthKit setup completed with data:", data);
    setHealthKitData(data);
    setFlowState("profile");
  };

  const handleHealthKitSkip = () => {
    console.log("HealthKit setup skipped");
    setHealthKitData(null);
    setFlowState("profile");
  };

  const handleProfileComplete = () => {
    console.log("Profile setup completed");
    setFlowState("complete");
  };

  const resetFlow = () => {
    setFlowState("idle");
    setHealthKitData(null);
  };

  // Render the actual flow components
  if (flowState === "healthkit") {
    return (
      <HealthKitSetup
        onComplete={handleHealthKitComplete}
        onSkip={handleHealthKitSkip}
      />
    );
  }

  if (flowState === "profile") {
    return (
      <div className="relative">
        <Button
          onClick={resetFlow}
          className="absolute left-4 top-4 z-10"
          variant="outline"
          size="sm"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Test
        </Button>
        <ProfileSetup
          onComplete={handleProfileComplete}
          healthKitData={healthKitData}
        />
      </div>
    );
  }

  // Control panel
  return (
    <div className="space-y-4">
      <Card className="border-border bg-secondary/30">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Heart className="mr-2 h-5 w-5 text-primary" />
            HealthKit Onboarding Flow Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {flowState === "complete" && (
            <div className="rounded border border-green-200 bg-green-50 p-4 text-green-700">
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5" />
                <span className="font-medium">Onboarding Flow Completed!</span>
              </div>
              <p className="mt-2 text-sm">
                The user would now be taken to the main dashboard.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-medium">Test Actions</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setFlowState("healthkit")}
                disabled={!isNativeiOS()}
                size="sm"
                variant="outline"
              >
                <Heart className="mr-2 h-4 w-4" />
                Start HealthKit Setup
              </Button>

              <Button
                onClick={() => setFlowState("profile")}
                size="sm"
                variant="outline"
              >
                <User className="mr-2 h-4 w-4" />
                Start Profile Setup
              </Button>

              {flowState === "complete" && (
                <Button
                  onClick={resetFlow}
                  size="sm"
                  variant="outline"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Test
                </Button>
              )}
            </div>

            {!isNativeiOS() && (
              <div className="rounded border border-orange-200 bg-orange-50 p-2 text-sm text-orange-700">
                HealthKit setup is only available on iOS devices. The flow will skip directly to profile setup on other platforms.
              </div>
            )}
          </div>

          {healthKitData && (
            <div className="space-y-2">
              <h4 className="font-medium">HealthKit Data Retrieved</h4>
              <div className="rounded border bg-muted/30 p-3 text-sm">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(healthKitData, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-medium">Flow State</h4>
            <div className="text-sm text-muted-foreground">
              Current state: <code className="rounded bg-muted px-2 py-1">{flowState}</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}