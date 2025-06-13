import React, { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MetricsPanel } from "@/components/MetricsPanel";
import { TimelineSlider } from "@/components/TimelineSlider";
import { LogEntryModal } from "@/components/LogEntryModal";
import { WeightLoggingWrapper } from "@/components/weight-logging-v2/WeightLoggingWrapper";
import { WeightPrompt } from "@/components/WeightPrompt";
import { TrialGuard } from "@/components/TrialGuard";
import { VersionDisplay } from "@/components/VersionDisplay";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useSupabaseBodyMetrics } from "@/hooks/use-supabase-body-metrics";
import { useBodyMetrics } from "@/hooks/use-body-metrics";
import { useHealthKit } from "@/hooks/use-healthkit";
import { isNativeiOS } from "@/lib/platform";

// Lazy load heavy 3D component
const AvatarSilhouette = React.lazy(() => import("@/components/AvatarSilhouette").then(module => ({ default: module.AvatarSilhouette })));

// Loading fallback for avatar
const AvatarLoader = () => (
  <div className="h-full min-h-[400px] md:min-h-0 flex items-center justify-center bg-muted/30">
    <div className="text-center">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-sm text-muted-foreground">Loading 3D avatar...</p>
    </div>
  </div>
);

const Dashboard = () => {
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

  const [showPhoto, setShowPhoto] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showPremiumWeightLog, setShowPremiumWeightLog] = useState(false);
  const [showWeightPrompt, setShowWeightPrompt] = useState(false);
  const [healthKitWeightData, setHealthKitWeightData] = useState<any>(null);
  const [healthKitDataChecked, setHealthKitDataChecked] = useState(false);

  const handleToggleView = () => {
    setShowPhoto(!showPhoto);
  };

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
                console.log('HealthKit weight data found:', healthData.weight);
              }
            }
          } catch (error) {
            console.warn('Error checking HealthKit data:', error);
          } finally {
            setHealthKitDataChecked(true);
          }
        };
        
        // Start background check but don't wait for it
        checkHealthKitData();
        
        // Set timeout to mark as checked if it takes too long
        const timeout = setTimeout(() => {
          if (!healthKitDataChecked) {
            console.warn('HealthKit check timed out, proceeding without HealthKit data');
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
  const hasAppWeightData = metrics.length > 0 && metrics.some(m => m.weight > 0);
  const hasHealthKitWeightData = healthKitWeightData && healthKitWeightData.weight > 0;
  const hasWeightData = hasAppWeightData || hasHealthKitWeightData;

  // Show weight prompt if no data and not loading (use useEffect to avoid infinite re-renders)
  React.useEffect(() => {
    if (!loading && user && settings && healthKitDataChecked && !hasWeightData && !showWeightPrompt) {
      setShowWeightPrompt(true);
    }
  }, [loading, user, settings, healthKitDataChecked, hasWeightData, showWeightPrompt]);

  // Don't block on HealthKit - load in background
  if (loading || !user || !settings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your data...</p>
        </div>
      </div>
    );
  }

  // Show weight prompt for new users
  if (showWeightPrompt && !hasWeightData) {
    return (
      <TrialGuard>
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
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
      <div className="h-screen md:min-h-screen bg-background text-foreground flex flex-col overflow-hidden md:overflow-auto">
        {/* Header - Desktop only */}
        <div className="hidden md:flex justify-between items-center px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">
              LogYourBody
            </h1>
            <VersionDisplay />
          </div>
          <div className="flex gap-3">
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
              className="bg-secondary border-border text-foreground hover:bg-muted h-10 w-10"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => navigate("/settings")}
              className="bg-secondary border-border text-foreground hover:bg-muted h-10 w-10"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content - Mobile-first design with desktop fallback */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Mobile Top Bar with Toggle and Action Buttons */}
          <div className="md:hidden w-full px-4 py-3 bg-secondary/30 border-b border-border">
            <div className="flex items-center gap-4">
              {/* Avatar/Photo Toggle */}
              <div className="flex-1 bg-secondary rounded-lg p-1">
                <div className="flex">
                  <button
                    onClick={() => setShowPhoto(false)}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                      !showPhoto
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Avatar
                  </button>
                  <button
                    onClick={() => setShowPhoto(true)}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                      showPhoto
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Photo
                  </button>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
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
                  className="bg-secondary border-border text-foreground hover:bg-muted h-10 w-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => navigate("/settings")}
                  className="bg-secondary border-border text-foreground hover:bg-muted h-10 w-10"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content Area - Flexible layout for mobile/desktop */}
          <div className="flex-1 flex flex-col md:flex-row min-h-0">
            {/* Avatar Section - Top half on mobile, 2/3 on desktop */}
            <div className="flex-1 md:w-2/3 relative min-h-0">
              <Suspense fallback={<AvatarLoader />}>
                <AvatarSilhouette
                  gender={user.gender}
                  bodyFatPercentage={currentMetrics.bodyFatPercentage}
                  showPhoto={showPhoto}
                  profileImage={user.profileImage}
                  onToggleView={handleToggleView}
                  className="h-full w-full"
                  hideToggleOnMobile={true}
                />
              </Suspense>
            </div>

            {/* Metrics Panel - Bottom half on mobile, 1/3 on desktop */}
            <div className="flex-1 md:flex-none md:w-1/3 md:border-l border-border bg-secondary/30 min-h-0">
              <MetricsPanel
                metrics={currentMetrics}
                user={user}
                userAge={getUserAge()}
                formattedWeight={getFormattedWeight(currentMetrics.weight)}
                formattedHeight={getFormattedHeight(user.height)}
                formattedLeanBodyMass={getFormattedLeanBodyMass(
                  currentMetrics.leanBodyMass,
                )}
                showPhoto={showPhoto}
              />
            </div>
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
          initialWeight={currentMetrics.weight > 0 ? (settings.units === 'imperial' ? utils.kgToLbs(currentMetrics.weight) : currentMetrics.weight) : undefined}
          initialBodyFat={currentMetrics.bodyFatPercentage}
        />
      </div>
      </TrialGuard>
  );
};

export default Dashboard;
