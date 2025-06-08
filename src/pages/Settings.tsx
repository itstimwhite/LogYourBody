import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Smartphone, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBodyMetrics } from "@/hooks/use-body-metrics";

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useBodyMetrics();

  const [name, setName] = useState(user.name);
  const [gender, setGender] = useState(user.gender);
  const [height, setHeight] = useState(user.height.toString());
  const [birthday, setBirthday] = useState(
    user.birthday.toISOString().split("T")[0],
  );
  const [healthKitEnabled, setHealthKitEnabled] = useState(false);
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
          onClick={() => navigate('/dashboard')}
          className="bg-secondary border-border text-foreground hover:bg-muted h-10 w-10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
      </div>

      {/* Settings List */}
      <div className="p-6 space-y-8">
        {/* Personal Information */}
        <div className="space-y-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide border-b border-border pb-3">
            Personal Information
          </h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <div className="text-base font-medium text-foreground">Name</div>
              </div>
              <div className="text-muted-foreground">{name}</div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <div className="text-base font-medium text-foreground">Biological sex</div>
              </div>
              <div className="text-muted-foreground capitalize">{gender}</div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <div className="text-base font-medium text-foreground">Birthday</div>
              </div>
              <div className="text-muted-foreground">
                {new Date(birthday).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <div className="text-base font-medium text-foreground">Height</div>
              </div>
              <div className="text-muted-foreground">
                {height ? formatHeight(parseInt(height)) : ''}
              </div>
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
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <div className="text-base font-medium text-foreground">Share data with Apple Health</div>
                  <div className="text-sm text-muted-foreground">iOS only</div>
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
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <div className="text-base font-medium text-foreground">Real temperatures</div>
                  <div className="text-sm text-muted-foreground">All platforms</div>
                </div>
              </div>
              <Switch
                checked={googleFitEnabled}
                onCheckedChange={setGoogleFitEnabled}
              />
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <div className="text-base font-medium text-foreground">Notifications</div>
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
                <div className="text-base font-medium text-foreground">Email</div>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180" />
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <div className="text-base font-medium text-foreground">Password</div>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180" />
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <div className="text-base font-medium text-foreground">Upgrade Autopilot plan</div>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180" />
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <div className="text-base font-medium text-destructive">Logout</div>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180" />
            </div>
          </div>
        </div>
      </div>
    </div>
              <Label htmlFor="height" className="text-white/80 mb-2 block">
                Height (cm)
              </Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
              <p className="text-white/40 text-sm mt-1">
                {height ? formatHeight(parseInt(height)) : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-white/90 border-b border-white/10 pb-2">
            Integrations
          </h2>

          <div className="space-y-4">
            {/* HealthKit */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">HealthKit</div>
                  <div className="text-white/60 text-sm">iOS only</div>
                </div>
              </div>
              <Switch
                checked={healthKitEnabled}
                onCheckedChange={setHealthKitEnabled}
              />
            </div>

            {/* Google Fit */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">Google Fit</div>
                  <div className="text-white/60 text-sm">All platforms</div>
                </div>
              </div>
              <Switch
                checked={googleFitEnabled}
                onCheckedChange={setGoogleFitEnabled}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6">
          <Button
            onClick={handleSave}
            className="w-full bg-white text-black hover:bg-white/90 font-semibold"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;