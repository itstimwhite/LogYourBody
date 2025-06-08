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
    // Convert weight from lbs to kg for storage
    const weightInKg = data.weight / 2.20462;
    addMetric({
      ...data,
      weight: weightInKg,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-white/10">
        <h1 className="text-xl font-semibold">BodyMetrics</h1>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setShowLogModal(true)}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => navigate("/settings")}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
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
        <div className="md:w-1/3 border-t md:border-t-0 md:border-l border-white/10">
          <MetricsPanel
            metrics={currentMetrics}
            user={user}
            userAge={getUserAge()}
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
      />
    </div>
  );
};

export default Dashboard;
