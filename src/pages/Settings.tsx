import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBodyMetrics } from "@/hooks/use-body-metrics";
import { useSubscription } from "@/hooks/use-subscription";

const Settings = () => {
  const navigate = useNavigate();
  const { user, getUserAge, settings, updateSettings, getFormattedHeight } =
    useBodyMetrics();

  const { subscriptionInfo } = useSubscription();
  const handleUnitsChange = (checked: boolean) => {
    updateSettings({ units: checked ? "metric" : "imperial" });
  };

  const handleHealthKitToggle = (checked: boolean) => {
    updateSettings({ healthKitSyncEnabled: checked });
  };

  const handleGoogleFitToggle = (checked: boolean) => {
    updateSettings({ googleFitSyncEnabled: checked });
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
            {/* User Name */}
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <div className="text-base font-medium text-foreground">
                  Name
                </div>
              </div>
              <div className="text-muted-foreground">{user.name}</div>
            </div>

            {/* Birthday */}
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <div className="text-base font-medium text-foreground">
                  Birthday
                </div>
              </div>
              <div className="text-muted-foreground">
                {user.birthday.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>

            {/* Biological Sex */}
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <div className="text-base font-medium text-foreground">
                  Biological sex
                </div>
              </div>
              <div className="text-muted-foreground capitalize">
                {user.gender}
              </div>
            </div>

            {/* Height */}
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <div className="text-base font-medium text-foreground">
                  Height
                </div>
              </div>
              <div className="text-muted-foreground">
                {getFormattedHeight(user.height)}
              </div>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="space-y-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide border-b border-border pb-3">
            Subscription
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-base font-medium text-foreground flex items-center gap-2">
                    Premium
                    {subscriptionInfo.status === "trial" && (
                      <Badge variant="outline" className="text-xs">
                        {subscriptionInfo.daysRemainingInTrial}d left
                      </Badge>
                    )}
                    {subscriptionInfo.status === "active" && (
                      <Badge className="text-xs bg-green-500">Active</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {subscriptionInfo.status === "trial"
                      ? "Free trial"
                      : subscriptionInfo.status === "active"
                        ? "Premium subscription"
                        : "Manage your subscription"}
                  </div>
                </div>
              </div>
              <ArrowLeft
                className="h-4 w-4 text-muted-foreground rotate-180 cursor-pointer"
                onClick={() => navigate("/subscription")}
              />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide border-b border-border pb-3">
            Settings
          </h2>

          <div className="space-y-4">
            {/* Units Toggle */}
            <div className="flex items-center justify-between py-4">
              <div>
                <div className="text-base font-medium text-foreground">
                  Metric units
                </div>
                <div className="text-sm text-muted-foreground">
                  {settings.units === "metric" ? "kg, cm" : "lbs, ft/in"}
                </div>
              </div>
              <Switch
                checked={settings.units === "metric"}
                onCheckedChange={handleUnitsChange}
              />
            </div>

            {/* Sync from Apple HealthKit */}
            <div className="flex items-center justify-between py-4">
              <div>
                <div className="text-base font-medium text-foreground">
                  Sync from Apple HealthKit
                </div>
                <div className="text-sm text-muted-foreground">iOS only</div>
              </div>
              <Switch
                checked={settings.healthKitSyncEnabled}
                onCheckedChange={handleHealthKitToggle}
              />
            </div>

            {/* Sync from Google Fit */}
            <div className="flex items-center justify-between py-4">
              <div>
                <div className="text-base font-medium text-foreground">
                  Sync from Google Fit
                </div>
                <div className="text-sm text-muted-foreground">
                  All platforms
                </div>
              </div>
              <Switch
                checked={settings.googleFitSyncEnabled}
                onCheckedChange={handleGoogleFitToggle}
              />
            </div>

            {/* Notifications */}
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

        {/* Account */}
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
