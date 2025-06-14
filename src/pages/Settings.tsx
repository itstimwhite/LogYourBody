import React, { useState, useEffect } from "react";
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
import {
  HeightWheelPicker,
  DateWheelPicker,
} from "@/components/ui/wheel-picker";
import { ArrowLeft, Crown, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBodyMetrics } from "@/hooks/use-body-metrics";
import { useSubscription } from "@/hooks/use-subscription";
import { BiometricSetup } from "@/components/BiometricSetup";
import { VersionDisplay } from "@/components/VersionDisplay";
import { DatabaseDebug } from "@/components/DatabaseDebug";
import { RevenueCatDebug } from "@/components/RevenueCatDebug";
import { HealthKitSyncButton } from "@/components/HealthKitSyncButton";
import { HealthKitDebug } from "@/components/HealthKitDebug";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseBodyMetrics } from "@/hooks/use-supabase-body-metrics";
import { useSupabaseSubscription } from "@/hooks/use-supabase-subscription";
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation";
import { LogOut } from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const {
    user,
    getUserAge,
    settings,
    updateSettings,
    updateUser,
    getFormattedHeight,
    loading,
  } = useSupabaseBodyMetrics();

  const { subscriptionInfo } = useSupabaseSubscription();

  // Modal states
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [showBirthdayEdit, setShowBirthdayEdit] = useState(false);
  const [showHeightEdit, setShowHeightEdit] = useState(false);
  const [showEmailEdit, setShowEmailEdit] = useState(false);
  const [showPasswordEdit, setShowPasswordEdit] = useState(false);

  // Form states
  const [editName, setEditName] = useState(user?.name || "");
  const [editBirthday, setEditBirthday] = useState(
    user?.birthday ? user.birthday : new Date(2000, 0, 1),
  );
  const [editHeightCm, setEditHeightCm] = useState(user?.height || 175);
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [editPassword, setEditPassword] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Update form states when user data loads
  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditBirthday(user.birthday ? user.birthday : new Date(2000, 0, 1));
      setEditHeightCm(user.height || 175);
      setEditEmail(user.email || "");
    }
  }, [user]);

  const handleUnitsChange = (checked: boolean) => {
    updateSettings({ units: checked ? "metric" : "imperial" });
  };

  const handleGenderChange = (value: "male" | "female") => {
    console.log("Gender changing to:", value);
    updateUser({ gender: value });
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
    // editBirthday is now a Date object from the wheel picker
    updateUser({
      birthday:
        editBirthday instanceof Date ? editBirthday : new Date(editBirthday),
    });
    setShowBirthdayEdit(false);
  };

  const handleSaveHeight = () => {
    // editHeightCm is now the height in cm from the wheel picker
    updateUser({ height: Math.round(editHeightCm) });
    setShowHeightEdit(false);
  };

  const handleSaveEmail = () => {
    updateUser({ email: editEmail });
    setShowEmailEdit(false);
  };

  const handleSavePassword = () => {
    // In real app, this would update password
    console.log("Password updated");
    setEditPassword("");
    setShowPasswordEdit(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Add swipe navigation to go back to dashboard
  useSwipeNavigation({
    onSwipeRight: () => navigate("/dashboard"),
    threshold: 100,
  });

  // Show loading skeleton for better perceived performance
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-bg text-linear-text font-inter">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="h-16 border-b border-linear-border bg-linear-card" />

          {/* Content skeleton */}
          <div className="space-y-8 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-4 w-24 rounded bg-linear-border" />
                <div className="space-y-3">
                  <div className="h-12 rounded bg-linear-card" />
                  <div className="h-12 rounded bg-linear-card" />
                  <div className="h-12 rounded bg-linear-card" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (!user || !settings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-bg font-inter">
        <div className="text-center">
          <p className="text-linear-text-secondary">
            Failed to load settings. Please try again.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 border-linear-border bg-linear-card text-linear-text hover:bg-linear-border/50"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="flex h-screen flex-col overflow-hidden bg-linear-bg text-linear-text font-inter">
        {/* Header with safe area padding */}
        <div className="flex flex-shrink-0 items-center gap-4 border-b border-linear-border px-6 pb-4 pt-safe-top">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="h-10 w-10 text-linear-text-secondary hover:text-linear-text hover:bg-linear-border/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold tracking-tight text-linear-text">Settings</h1>
        </div>

        {/* Settings List - Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-8 p-6 pb-safe-bottom">
          {/* Personal Information */}
          <div className="space-y-6">
            <div className="space-y-6">
              {/* User Name */}
              <div
                className="-mx-2 flex cursor-pointer items-center justify-between rounded border-b border-linear-border px-2 py-3 hover:bg-linear-border/20 transition-colors"
                onClick={() => setShowNameEdit(true)}
              >
                <div className="text-base font-medium text-linear-text">
                  Name
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-linear-text-secondary">
                    {user?.name || "Not set"}
                  </div>
                  <Edit className="h-4 w-4 text-linear-text-tertiary" />
                </div>
              </div>

              {/* Birthday */}
              <div
                className="-mx-2 flex cursor-pointer items-center justify-between rounded border-b border-linear-border px-2 py-3 hover:bg-linear-border/20 transition-colors"
                onClick={() => setShowBirthdayEdit(true)}
              >
                <div className="text-base font-medium text-linear-text">
                  Birthday
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-linear-text-secondary">
                    {user?.birthday
                      ? user.birthday.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Not set"}
                  </div>
                  <Edit className="h-4 w-4 text-linear-text-tertiary" />
                </div>
              </div>

              {/* Biological Sex - Inline */}
              <div className="border-b border-linear-border py-3">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-base font-medium text-linear-text">
                    Biological sex
                  </div>
                </div>
                <Tabs
                  value={user?.gender || "male"}
                  onValueChange={handleGenderChange}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 border border-linear-border bg-linear-card">
                    <TabsTrigger
                      value="male"
                      className="text-linear-text data-[state=inactive]:border-linear-border data-[state=active]:bg-linear-purple data-[state=inactive]:bg-transparent data-[state=active]:text-white data-[state=inactive]:text-linear-text-secondary"
                    >
                      Male
                    </TabsTrigger>
                    <TabsTrigger
                      value="female"
                      className="text-linear-text data-[state=inactive]:border-linear-border data-[state=active]:bg-linear-purple data-[state=inactive]:bg-transparent data-[state=active]:text-white data-[state=inactive]:text-linear-text-secondary"
                    >
                      Female
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Height */}
              <div
                className="-mx-2 flex cursor-pointer items-center justify-between rounded border-b border-linear-border px-2 py-3 hover:bg-linear-border/20 transition-colors"
                onClick={() => setShowHeightEdit(true)}
              >
                <div className="text-base font-medium text-linear-text">
                  Height
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-linear-text-secondary">
                    {user?.height ? getFormattedHeight(user.height) : "Not set"}
                  </div>
                  <Edit className="h-4 w-4 text-linear-text-tertiary" />
                </div>
              </div>
            </div>
          </div>

          {/* Subscription - TEMPORARILY HIDDEN FOR TESTING */}
          {false && (
            <div className="space-y-6">
              <h2 className="border-b border-border pb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Subscription
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Crown className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-base font-medium text-foreground">
                        Premium
                        {subscriptionInfo.status === "trial" && (
                          <Badge variant="outline" className="text-xs">
                            {subscriptionInfo.daysRemainingInTrial}d left
                          </Badge>
                        )}
                        {subscriptionInfo.status === "active" && (
                          <Badge className="bg-green-500 text-xs">Active</Badge>
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
                    className="h-4 w-4 rotate-180 cursor-pointer text-muted-foreground"
                    onClick={() => navigate("/subscription")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="space-y-6">
            <h2 className="border-b border-border pb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Settings
            </h2>

            <div className="space-y-4">
              {/* Units Toggle - Use Tabs instead of Switch */}
              <div className="border-b border-border py-4">
                <div className="mb-3">
                  <div className="text-base font-medium text-foreground">
                    Units
                  </div>
                </div>
                <Tabs
                  value={settings?.units || "imperial"}
                  onValueChange={(value) =>
                    updateSettings({ units: value as "imperial" | "metric" })
                  }
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 border border-border bg-secondary">
                    <TabsTrigger
                      value="imperial"
                      className="text-foreground data-[state=inactive]:border-muted-foreground/20 data-[state=active]:bg-primary data-[state=inactive]:bg-transparent data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground"
                    >
                      Imperial (lbs, ft/in)
                    </TabsTrigger>
                    <TabsTrigger
                      value="metric"
                      className="text-foreground data-[state=inactive]:border-muted-foreground/20 data-[state=active]:bg-primary data-[state=inactive]:bg-transparent data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground"
                    >
                      Metric (kg, cm)
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
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
              <div className="border-b border-border py-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-base font-medium text-foreground">
                      Sync from Apple HealthKit
                    </div>
                    <div className="text-sm text-muted-foreground">
                      iOS only
                    </div>
                  </div>
                  <Switch
                    checked={settings?.healthKitSyncEnabled || false}
                    onCheckedChange={handleHealthKitToggle}
                  />
                </div>
                {settings?.healthKitSyncEnabled && <HealthKitSyncButton />}
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
                  checked={settings?.googleFitSyncEnabled || false}
                  onCheckedChange={handleGoogleFitToggle}
                />
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="space-y-6">
            <h2 className="border-b border-border pb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Account
            </h2>

            <div className="space-y-4">
              {/* Email */}
              <div
                className="-mx-2 flex cursor-pointer items-center justify-between rounded px-2 py-4 hover:bg-secondary/20"
                onClick={() => setShowEmailEdit(true)}
              >
                <div className="text-base font-medium text-foreground">
                  Email
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-muted-foreground">
                    {user?.email || "Not set"}
                  </div>
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Password */}
              <div
                className="-mx-2 flex cursor-pointer items-center justify-between rounded px-2 py-4 hover:bg-secondary/20"
                onClick={() => setShowPasswordEdit(true)}
              >
                <div className="text-base font-medium text-foreground">
                  Password
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-muted-foreground">••••••••</div>
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Biometric Authentication Section */}
            <div className="border-t border-border pt-6">
              <h2 className="mb-6 border-b border-border pb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Security
              </h2>
              <BiometricSetup />
            </div>

            {/* Database Status Section */}
            <div className="border-t border-border pt-6">
              <h2 className="mb-6 border-b border-border pb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                System Status
              </h2>
              <DatabaseDebug />
            </div>

            {/* HealthKit Debug Section */}
            <div className="border-t border-border pt-6">
              <h2 className="mb-6 border-b border-border pb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                HealthKit Integration
              </h2>
              <HealthKitDebug />
            </div>

            {/* RevenueCat Debug Section */}
            <div className="border-t border-border pt-6">
              <h2 className="mb-6 border-b border-border pb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                RevenueCat Integration
              </h2>
              <RevenueCatDebug />
            </div>

            {/* Version Information Section */}
            <div className="border-t border-border pt-6">
              <h2 className="mb-6 border-b border-border pb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Version Information
              </h2>
              <VersionDisplay showBuildInfo={true} />
            </div>

            {/* Logout Section */}
            <div className="border-t border-border pt-6">
              <div
                className="-mx-2 flex cursor-pointer items-center justify-between rounded px-2 py-4 hover:bg-secondary/20"
                onClick={handleLogout}
              >
                <div className="flex items-center gap-3">
                  <LogOut className="h-4 w-4 text-destructive" />
                  <div className="text-base font-medium text-destructive">
                    Logout
                  </div>
                </div>
                <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Name Edit Modal */}
        <Dialog open={showNameEdit} onOpenChange={setShowNameEdit}>
          <DialogContent className="max-w-md border-border bg-background text-foreground">
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
                  className="border-border bg-secondary text-foreground"
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
          <DialogContent className="max-w-md border-border bg-background text-foreground">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Edit Birthday
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Birthday</Label>
                <DateWheelPicker
                  date={editBirthday}
                  onDateChange={setEditBirthday}
                  className="h-60"
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

        {/* Height Edit Modal */}
        <Dialog open={showHeightEdit} onOpenChange={setShowHeightEdit}>
          <DialogContent className="max-w-md border-border bg-background text-foreground">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Edit Height
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Height</Label>
                <HeightWheelPicker
                  heightInCm={editHeightCm}
                  units={settings?.units || "imperial"}
                  onHeightChange={setEditHeightCm}
                  className="h-60"
                />
              </div>
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

        {/* Email Edit Modal */}
        <Dialog open={showEmailEdit} onOpenChange={setShowEmailEdit}>
          <DialogContent className="max-w-md border-border bg-background text-foreground">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Edit Email
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="border-border bg-secondary text-foreground"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowEmailEdit(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveEmail} className="flex-1">
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Password Edit Modal */}
        <Dialog open={showPasswordEdit} onOpenChange={setShowPasswordEdit}>
          <DialogContent className="max-w-md border-border bg-background text-foreground">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Change Password
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="border-border bg-secondary text-foreground"
                  placeholder="Enter new password"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordEdit(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleSavePassword} className="flex-1">
                  Update Password
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
};

export default Settings;
