import React, { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MetricsPanel } from "@/components/MetricsPanel";
import { TimelineSlider } from "@/components/TimelineSlider";
import { LogEntryModal } from "@/components/LogEntryModal";
import { WeightPrompt } from "@/components/WeightPrompt";
import { TrialGuard } from "@/components/TrialGuard";
import { VersionDisplay } from "@/components/VersionDisplay";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useSupabaseBodyMetrics } from "@/hooks/use-supabase-body-metrics";
import { useBodyMetrics } from "@/hooks/use-body-metrics";

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
  const [showWeightPrompt, setShowWeightPrompt] = useState(false);

  const handleToggleView = () => {
    setShowPhoto(!showPhoto);
  };

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

  // Check if user has any weight data
  const hasWeightData = metrics.length > 0 && metrics.some(m => m.weight > 0);

  // Show weight prompt if no data and not loading (use useEffect to avoid infinite re-renders)
  React.useEffect(() => {
    if (!loading && user && settings && !hasWeightData && !showWeightPrompt) {
      setShowWeightPrompt(true);
    }
  }, [loading, user, settings, hasWeightData, showWeightPrompt]);

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
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-border">
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
                  setShowLogModal(true);
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

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Left Side - Avatar (2/3) */}
          <div className="flex-1 md:w-2/3 relative">
            <Suspense fallback={<AvatarLoader />}>
              <AvatarSilhouette
                gender={user.gender}
                bodyFatPercentage={currentMetrics.bodyFatPercentage}
                showPhoto={showPhoto}
                profileImage={user.profileImage}
                onToggleView={handleToggleView}
                className="h-full min-h-[400px] md:min-h-0"
              />
            </Suspense>
          </div>

          {/* Right Side - Metrics (1/3) */}
          <div className="md:w-1/3 border-t md:border-t-0 md:border-l border-border bg-secondary/30">
            <MetricsPanel
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

        {/* Timeline Slider */}
        <TimelineSlider
          metrics={metrics}
          selectedIndex={selectedDateIndex}
          onIndexChange={setSelectedDateIndex}
        />

        {/* Log Entry Modal */}
        <LogEntryModal
          open={showLogModal}
          onOpenChange={setShowLogModal}
          onSave={handleAddMetric}
          units={settings.units}
        />
      </div>
      </TrialGuard>
  );
};

export default Dashboard;
