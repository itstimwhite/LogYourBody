import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HealthKitDebug } from "@/components/HealthKitDebug";
import { HealthKitOnboardingTest } from "@/components/HealthKitOnboardingTest";

const HealthKitTest = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border px-6 py-4">
        <Button
          size="icon"
          variant="outline"
          onClick={() => navigate("/dashboard")}
          className="h-10 w-10 border-border bg-secondary text-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">HealthKit Testing</h1>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6 p-6">
        <HealthKitOnboardingTest />
        
        <HealthKitDebug />
      </div>
    </div>
  );
};

export default HealthKitTest;