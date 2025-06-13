import React, { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProfilePanel } from "@/components/profile/ProfilePanel";
import { TimelineSlider } from "@/components/profile/TimelineSlider";
import { AvatarDisplay } from "@/components/profile/AvatarDisplay";
import { TabView, createProfileTabs } from "@/components/profile/TabView";
import { LogEntryModal } from "@/components/LogEntryModal";
import { WeightLoggingWrapper } from "@/components/weight-logging-v2/WeightLoggingWrapper";
import { WeightPrompt } from "@/components/WeightPrompt";
import { TrialGuard } from "@/components/TrialGuard";
import { VersionDisplay } from "@/components/VersionDisplay";
import { EmailConfirmationBanner } from "@/components/EmailConfirmationBanner";
import { isSupabaseConfigured } from "@/lib/supabase";

// Helper function to calculate age from birthday
function getAgeFromBirthday(birthday?: string): number {
  if (!birthday) return 30; // Default age

  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return Math.max(18, Math.min(65, age)); // Clamp to reasonable range
}
import { useSupabaseBodyMetrics } from "@/hooks/use-supabase-body-metrics";
import { useBodyMetrics } from "@/hooks/use-body-metrics";
import { useHealthKit } from "@/hooks/use-healthkit";
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation";
import { isNativeiOS } from "@/lib/platform";

// Keep the old AvatarSilhouette as lazy-loaded fallback (not used in main flow anymore)
const AvatarSilhouette = React.lazy(() =>
  import("@/components/AvatarSilhouette").then((module) => ({
    default: module.AvatarSilhouette,
  })),
);

// Loading fallback for avatar
const AvatarLoader = () => (
  <div className="flex h-full min-h-[400px] items-center justify-center bg-muted/30 md:min-h-0">
    <div className="text-center">
      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      <p className="text-sm text-muted-foreground">Loading 3D avatar...</p>
    </div>
  </div>
);

const Dashboard = () => {
  console.log("Dashboard: Component rendering");
  const navigate = useNavigate();
  // Use Supabase hook if configured, otherwise use local hook
  const supabaseHook = useSupabaseBodyMetrics();
  const localHook = useBodyMetrics();

  // Initialize HealthKit on iOS
  const healthKit = useHealthKit();

  const {
    user,
    metrics,
    currentMetrics,
    selectedDateIndex,
    setSelectedDateIndex,
    addMetric,
    getUserAge,
    getFormattedWeight,
    getFormattedHeight,
    getFormattedLeanBodyMass,
    settings,
    utils,
  } = isSupabaseConfigured ? supabaseHook : localHook;

  const loading = isSupabaseConfigured ? supabaseHook.loading : false;

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showPremiumWeightLog, setShowPremiumWeightLog] = useState(false);
  const [showWeightPrompt, setShowWeightPrompt] = useState(false);
  const [healthKitWeightData, setHealthKitWeightData] = useState<any>(null);
  const [healthKitDataChecked, setHealthKitDataChecked] = useState(false);

  const handleTabChange = (tabIndex: number) => {
    setActiveTabIndex(tabIndex);
  };

  // Add swipe navigation to go to settings
  useSwipeNavigation({
    onSwipeLeft: () => navigate("/settings"),
    threshold: 100,
  });

  // Check HealthKit data on iOS - non-blocking background operation
  React.useEffect(() => {
    if (!healthKitDataChecked) {
      if (isNativeiOS() && healthKit.isAvailable) {
        // Run HealthKit check in background without blocking UI
        const checkHealthKitData = async () => {
          try {
            // Request permissions if not already authorized
            if (!healthKit.isAuthorized) {
              await healthKit.requestPermissions();
            }

            if (healthKit.isAuthorized) {
              // Get recent weight data
              const healthData = await healthKit.getHealthData();
              if (healthData && healthData.weight) {
                setHealthKitWeightData(healthData);
                console.log("HealthKit weight data found:", healthData.weight);
              }
            }
          } catch (error) {
            console.warn("Error checking HealthKit data:", error);
          } finally {
            setHealthKitDataChecked(true);
          }
        };

        // Start background check but don't wait for it
        checkHealthKitData();

        // Set timeout to mark as checked if it takes too long
        const timeout = setTimeout(() => {
          if (!healthKitDataChecked) {
            console.warn(
              "HealthKit check timed out, proceeding without HealthKit data",
            );
            setHealthKitDataChecked(true);
          }
        }, 3000); // Reduced to 3 seconds

        return () => clearTimeout(timeout);
      } else {
        // Not on iOS or HealthKit not available, mark as checked immediately
        setHealthKitDataChecked(true);
      }
    }
  }, [healthKit.isAvailable, healthKit.isAuthorized, healthKitDataChecked]);

  const handleAddMetric = (data: {
    weight: number;
    bodyFatPercentage: number;
    method: any;
    date: Date;
  }) => {
    // Convert weight to kg for storage based on current units
    let weightInKg = data.weight;
    if (settings.units === "imperial") {
      weightInKg = utils.lbsToKg(data.weight);
    }
    addMetric({
      ...data,
      weight: weightInKg,
    });
  };

  // Check if user has any weight data (including HealthKit data)
  const hasAppWeightData =
    metrics.length > 0 && metrics.some((m) => m.weight > 0);
  const hasHealthKitWeightData =
    healthKitWeightData && healthKitWeightData.weight > 0;
  const hasWeightData = hasAppWeightData || hasHealthKitWeightData;

  // Show weight prompt if no data and not loading (use useEffect to avoid infinite re-renders)
  React.useEffect(() => {
    if (
      !loading &&
      user &&
      settings &&
      healthKitDataChecked &&
      !hasWeightData &&
      !showWeightPrompt
    ) {
      setShowWeightPrompt(true);
    }
  }, [
    loading,
    user,
    settings,
    healthKitDataChecked,
    hasWeightData,
    showWeightPrompt,
  ]);

  // Don't block on HealthKit - load in background
  if (loading || !user || !settings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading your data...</p>
        </div>
      </div>
    );
  }

  // Show weight prompt for new users
  if (showWeightPrompt && !hasWeightData) {
    return (
      <TrialGuard>
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
          <WeightPrompt
            onComplete={(data) => {
              handleAddMetric(data);
              setShowWeightPrompt(false);
            }}
            units={settings.units}
          />
        </div>
      </TrialGuard>
    );
  }

  return (
    <TrialGuard>
      <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground md:min-h-screen md:overflow-auto">
        {/* Email confirmation banner */}
        <div className="px-4 pt-4 md:px-6">
          <EmailConfirmationBanner />
        </div>

        {/* Header - Desktop only */}
        <div className="hidden items-center justify-between border-b border-border px-6 py-4 md:flex">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">
              LogYourBody
            </h1>
            <VersionDisplay />
          </div>
          <div className="flex gap-3">
            {/* Development: HealthKit Test Button - only on iOS */}
            {isNativeiOS() && (
              <Button
                size="icon"
                variant="outline"
                onClick={() => navigate("/healthkit-test")}
                className="border-border bg-secondary text-foreground hover:bg-muted"
                title="HealthKit Testing (Development)"
              >
                <Heart className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                if (!hasWeightData) {
                  setShowWeightPrompt(true);
                } else {
                  setShowPremiumWeightLog(true);
                }
              }}
              className="h-10 w-10 border-border bg-secondary text-foreground hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => navigate("/settings")}
              className="h-10 w-10 border-border bg-secondary text-foreground hover:bg-muted"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content - Refactored with TabView */}
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          {/* Avatar/Photo Section with Tabs - Top half on mobile, 2/3 on desktop */}
          <div className="relative min-h-0 flex-1 md:w-2/3">
            <TabView
              tabs={createProfileTabs(
                <Suspense fallback={<AvatarLoader />}>
                  <AvatarDisplay
                    gender={user.gender}
                    bodyFatPercentage={currentMetrics.bodyFatPercentage}
                    showPhoto={false}
                    className="h-full w-full"
                    weight={currentMetrics.weight}
                    height={user.height}
                    age={getAgeFromBirthday(user.birthday)}
                  />
                </Suspense>,
                <Suspense fallback={<AvatarLoader />}>
                  <AvatarDisplay
                    gender={user.gender}
                    bodyFatPercentage={currentMetrics.bodyFatPercentage}
                    showPhoto={true}
                    profileImage={user.profileImage}
                    className="h-full w-full"
                    weight={currentMetrics.weight}
                    height={user.height}
                    age={getAgeFromBirthday(user.birthday)}
                  />
                </Suspense>,
              )}
              defaultIndex={activeTabIndex}
              onTabChange={handleTabChange}
              swipeEnabled={true}
              className="h-full w-full"
            />

            {/* Mobile Action Buttons - Floating */}
            <div className="top-safe-top absolute right-4 z-20 flex gap-3 md:hidden">
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  if (!hasWeightData) {
                    setShowWeightPrompt(true);
                  } else {
                    setShowPremiumWeightLog(true);
                  }
                }}
                className="h-10 w-10 border-border bg-background/80 text-foreground shadow-lg backdrop-blur-sm hover:bg-muted"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => navigate("/settings")}
                className="h-10 w-10 border-border bg-background/80 text-foreground shadow-lg backdrop-blur-sm hover:bg-muted"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Profile Panel - Bottom half on mobile, 1/3 on desktop */}
          <div className="min-h-0 flex-1 border-border md:w-1/3 md:flex-none md:border-l">
            <ProfilePanel
              metrics={currentMetrics}
              user={user}
              userAge={getUserAge()}
              formattedWeight={getFormattedWeight(currentMetrics.weight)}
              formattedHeight={getFormattedHeight(user.height)}
              formattedLeanBodyMass={getFormattedLeanBodyMass(
                currentMetrics.leanBodyMass,
              )}
            />
          </div>
        </div>

        {/* Timeline Slider - Flex shrink on mobile */}
        <div className="flex-shrink-0">
          <TimelineSlider
            metrics={metrics}
            selectedIndex={selectedDateIndex}
            onIndexChange={setSelectedDateIndex}
          />
        </div>

        {/* Log Entry Modal */}
        <LogEntryModal
          open={showLogModal}
          onOpenChange={setShowLogModal}
          onSave={handleAddMetric}
          units={settings.units}
        />

        {/* Premium Weight Logging Screen */}
        <WeightLoggingWrapper
          show={showPremiumWeightLog}
          onSave={handleAddMetric}
          onClose={() => setShowPremiumWeightLog(false)}
          units={settings.units}
          initialWeight={
            currentMetrics.weight > 0
              ? settings.units === "imperial"
                ? utils.kgToLbs(currentMetrics.weight)
                : currentMetrics.weight
              : undefined
          }
          initialBodyFat={currentMetrics.bodyFatPercentage}
        />
      </div>
    </TrialGuard>
  );
};

export default Dashboard;
