import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Smartphone, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBodyMetrics } from "@/hooks/use-body-metrics";

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useBodyMetrics();

  const [name] = useState(user.name);
  const [gender] = useState(user.gender);
  const [height] = useState(user.height.toString());
  const [birthday] = useState(user.birthday.toISOString().split("T")[0]);
  const [healthKitEnabled, setHealthKitEnabled] = useState(true);
  const [googleFitEnabled, setGoogleFitEnabled] = useState(false);

  const handleSave = () => {
    updateUser({
      name,
      gender,
      height: parseInt(height),
      birthday: new Date(birthday),
    });
    navigate("/dashboard");
  };

  const formatHeight = (cm: number) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border">
        <Button
          size="icon"
          variant="outline"
          onClick={() => navigate("/dashboard")}
          className="bg-secondary border-border text-foreground hover:bg-muted h-10 w-10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
      </div>

      {/* Settings List */}
      <div className="p-6 space-y-8">
        {/* Personal Information */}
        <div className="space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <div className="text-base font-medium text-foreground">
                  Birthday
                </div>
              </div>
              <div className="text-muted-foreground">
                {new Date(birthday).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <div className="text-base font-medium text-foreground">
                  Biological sex
                </div>
              </div>
              <div className="text-muted-foreground capitalize">{gender}</div>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="space-y-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide border-b border-border pb-3">
            Settings
          </h2>

          <div className="space-y-4">
            {/* HealthKit */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-base font-medium text-foreground">
                    Share data with Apple Health
                  </div>
                </div>
              </div>
              <Switch
                checked={healthKitEnabled}
                onCheckedChange={setHealthKitEnabled}
              />
            </div>

            {/* Google Fit */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-base font-medium text-foreground">
                    Real temperatures
                  </div>
                </div>
              </div>
              <Switch
                checked={googleFitEnabled}
                onCheckedChange={setGoogleFitEnabled}
              />
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <div className="text-base font-medium text-foreground">
                  Notifications
                </div>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide border-b border-border pb-3">
            Account
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-4">
              <div>
                <div className="text-base font-medium text-foreground">
                  Email
                </div>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180" />
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <div className="text-base font-medium text-foreground">
                  Password
                </div>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180" />
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <div className="text-base font-medium text-foreground">
                  Upgrade Autopilot plan
                </div>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180" />
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <div className="text-base font-medium text-destructive">
                  Logout
                </div>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
