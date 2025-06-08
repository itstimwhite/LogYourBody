import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AvatarSilhouette } from "@/components/AvatarSilhouette";
import { MetricsPanel } from "@/components/MetricsPanel";
import { TimelineSlider } from "@/components/TimelineSlider";
import { LogEntryModal } from "@/components/LogEntryModal";
import { useBodyMetrics } from "@/hooks/use-body-metrics";

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    user,
    metrics,
    currentMetrics,
    selectedDateIndex,
    setSelectedDateIndex,
    addMetric,
    getUserAge,
    getFormattedWeight,
    settings,
    utils,
  } = useBodyMetrics();

  const [showPhoto, setShowPhoto] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);

  const handleToggleView = () => {
    setShowPhoto(!showPhoto);
  };

  const handleAddMetric = (data: {
    weight: number;
    bodyFatPercentage: number;
    method: any;
    date: Date;
  }) => {
    // Always store weight in kg (imperial) - convert if needed
    const weightInKg = utils.lbsToKg(data.weight);
    addMetric({
      ...data,
      weight: weightInKg,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-border">
        <h1 className="text-xl font-semibold tracking-tight">LogYourBody</h1>
        <div className="flex gap-3">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setShowLogModal(true)}
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
          <AvatarSilhouette
            gender={user.gender}
            bodyFatPercentage={currentMetrics.bodyFatPercentage}
            showPhoto={showPhoto}
            profileImage={user.profileImage}
            onToggleView={handleToggleView}
            className="h-full min-h-[400px] md:min-h-0"
          />
        </div>

        {/* Right Side - Metrics (1/3) */}
        <div className="md:w-1/3 border-t md:border-t-0 md:border-l border-border bg-secondary/30">
          <MetricsPanel
            metrics={currentMetrics}
            user={user}
            userAge={getUserAge()}
            formattedWeight={getFormattedWeight(currentMetrics.weight)}
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
  );
};

export default Dashboard;
