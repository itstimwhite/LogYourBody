import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Crown, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBodyMetrics } from "@/hooks/use-body-metrics";
import { useSubscription } from "@/hooks/use-subscription";

const Settings = () => {
  const navigate = useNavigate();
  const {
    user,
    getUserAge,
    settings,
    updateSettings,
    updateUser,
    getFormattedHeight,
  } = useBodyMetrics();

  const { subscriptionInfo } = useSubscription();

  // Modal states
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [showBirthdayEdit, setShowBirthdayEdit] = useState(false);
  const [showGenderEdit, setShowGenderEdit] = useState(false);
  const [showHeightEdit, setShowHeightEdit] = useState(false);

  // Form states
  const [editName, setEditName] = useState(user.name);
  const [editBirthday, setEditBirthday] = useState(
    user.birthday.toISOString().split("T")[0],
  );
  const [editGender, setEditGender] = useState(user.gender);
  const [editHeightFeet, setEditHeightFeet] = useState(
    Math.floor(user.height / 30.48),
  );
  const [editHeightInches, setEditHeightInches] = useState(
    Math.round((user.height % 30.48) / 2.54),
  );
  const [editHeightCm, setEditHeightCm] = useState(user.height);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleUnitsChange = (checked: boolean) => {
    updateSettings({ units: checked ? "metric" : "imperial" });
  };

  const handleHealthKitToggle = (checked: boolean) => {
    updateSettings({ healthKitSyncEnabled: checked });
  };

  const handleGoogleFitToggle = (checked: boolean) => {
    updateSettings({ googleFitSyncEnabled: checked });
  };

  const handleNotificationsToggle = async (checked: boolean) => {
    if (checked) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          setNotificationsEnabled(true);
          console.log("Notifications enabled");
        } else {
          console.log("Notifications denied");
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleSaveName = () => {
    updateUser({ name: editName });
    setShowNameEdit(false);
  };

  const handleSaveBirthday = () => {
    updateUser({ birthday: new Date(editBirthday) });
    setShowBirthdayEdit(false);
  };

  const handleSaveGender = () => {
    updateUser({ gender: editGender });
    setShowGenderEdit(false);
  };

  const handleSaveHeight = () => {
    let heightInCm;
    if (settings.units === "imperial") {
      heightInCm = (editHeightFeet * 12 + editHeightInches) * 2.54;
    } else {
      heightInCm = editHeightCm;
    }
    updateUser({ height: Math.round(heightInCm) });
    setShowHeightEdit(false);
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
            <div
              className="flex items-center justify-between py-3 border-b border-border cursor-pointer hover:bg-secondary/20 rounded px-2 -mx-2"
              onClick={() => setShowNameEdit(true)}
            >
              <div className="text-base font-medium text-foreground">Name</div>
              <div className="flex items-center gap-2">
                <div className="text-muted-foreground">{user.name}</div>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Birthday */}
            <div
              className="flex items-center justify-between py-3 border-b border-border cursor-pointer hover:bg-secondary/20 rounded px-2 -mx-2"
              onClick={() => setShowBirthdayEdit(true)}
            >
              <div className="text-base font-medium text-foreground">
                Birthday
              </div>
              <div className="flex items-center gap-2">
                <div className="text-muted-foreground">
                  {user.birthday.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Biological Sex */}
            <div
              className="flex items-center justify-between py-3 border-b border-border cursor-pointer hover:bg-secondary/20 rounded px-2 -mx-2"
              onClick={() => setShowGenderEdit(true)}
            >
              <div className="text-base font-medium text-foreground">
                Biological sex
              </div>
              <div className="flex items-center gap-2">
                <div className="text-muted-foreground capitalize">
                  {user.gender}
                </div>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Height */}
            <div
              className="flex items-center justify-between py-3 border-b border-border cursor-pointer hover:bg-secondary/20 rounded px-2 -mx-2"
              onClick={() => setShowHeightEdit(true)}
            >
              <div className="text-base font-medium text-foreground">
                Height
              </div>
              <div className="flex items-center gap-2">
                <div className="text-muted-foreground">
                  {getFormattedHeight(user.height)}
                </div>
                <Edit className="h-4 w-4 text-muted-foreground" />
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
                  Units
                </div>
                <div className="text-sm text-muted-foreground">
                  {settings.units === "metric"
                    ? "Metric (kg, cm)"
                    : "Imperial (lbs, ft/in)"}
                </div>
              </div>
              <Switch
                checked={settings.units === "metric"}
                onCheckedChange={handleUnitsChange}
              />
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between py-4">
              <div>
                <div className="text-base font-medium text-foreground">
                  Notifications
                </div>
                <div className="text-sm text-muted-foreground">
                  Enable push notifications
                </div>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={handleNotificationsToggle}
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

      {/* Name Edit Modal */}
      <Dialog open={showNameEdit} onOpenChange={setShowNameEdit}>
        <DialogContent className="bg-background border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Edit Name
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowNameEdit(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveName} className="flex-1">
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Birthday Edit Modal */}
      <Dialog open={showBirthdayEdit} onOpenChange={setShowBirthdayEdit}>
        <DialogContent className="bg-background border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Edit Birthday
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="birthday">Birthday</Label>
              <Input
                id="birthday"
                type="date"
                value={editBirthday}
                onChange={(e) => setEditBirthday(e.target.value)}
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowBirthdayEdit(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveBirthday} className="flex-1">
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gender Edit Modal */}
      <Dialog open={showGenderEdit} onOpenChange={setShowGenderEdit}>
        <DialogContent className="bg-background border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Edit Biological Sex
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Biological Sex</Label>
              <Tabs
                value={editGender}
                onValueChange={(value: "male" | "female") =>
                  setEditGender(value)
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="male">Male</TabsTrigger>
                  <TabsTrigger value="female">Female</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowGenderEdit(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveGender} className="flex-1">
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Height Edit Modal */}
      <Dialog open={showHeightEdit} onOpenChange={setShowHeightEdit}>
        <DialogContent className="bg-background border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Edit Height
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {settings.units === "imperial" ? (
              <div className="space-y-4">
                <Label>Height (feet and inches)</Label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="feet" className="text-sm">
                      Feet
                    </Label>
                    <Input
                      id="feet"
                      type="number"
                      min="3"
                      max="8"
                      value={editHeightFeet}
                      onChange={(e) =>
                        setEditHeightFeet(parseInt(e.target.value) || 0)
                      }
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="inches" className="text-sm">
                      Inches
                    </Label>
                    <Input
                      id="inches"
                      type="number"
                      min="0"
                      max="11"
                      value={editHeightInches}
                      onChange={(e) =>
                        setEditHeightInches(parseInt(e.target.value) || 0)
                      }
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="height-cm">Height (centimeters)</Label>
                <Input
                  id="height-cm"
                  type="number"
                  min="100"
                  max="250"
                  value={editHeightCm}
                  onChange={(e) =>
                    setEditHeightCm(parseInt(e.target.value) || 0)
                  }
                  className="bg-secondary border-border text-foreground"
                />
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowHeightEdit(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveHeight} className="flex-1">
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
