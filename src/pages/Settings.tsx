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
import { HeightWheelPicker, DateWheelPicker } from "@/components/ui/wheel-picker";
import { ArrowLeft, Crown, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBodyMetrics } from "@/hooks/use-body-metrics";
import { useSubscription } from "@/hooks/use-subscription";
import { BiometricSetup } from "@/components/BiometricSetup";
import { VersionDisplay } from "@/components/VersionDisplay";
import { DatabaseDebug } from "@/components/DatabaseDebug";
import { RevenueCatDebug } from "@/components/RevenueCatDebug";
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
    updateUser({ birthday: editBirthday instanceof Date ? editBirthday : new Date(editBirthday) });
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
      <div className="min-h-screen bg-background text-foreground">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="h-16 bg-secondary/20 border-b border-border" />
          
          {/* Content skeleton */}
          <div className="p-6 space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-4">
                <div className="h-4 w-24 bg-secondary/30 rounded" />
                <div className="space-y-3">
                  <div className="h-12 bg-secondary/20 rounded" />
                  <div className="h-12 bg-secondary/20 rounded" />
                  <div className="h-12 bg-secondary/20 rounded" />
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load settings. Please try again.</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
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
      <div className="h-screen md:min-h-screen bg-background text-foreground flex flex-col overflow-hidden md:overflow-auto">
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
        <div className="flex-1 p-6 space-y-8 overflow-y-auto md:overflow-visible">
          {/* Personal Information */}
          <div className="space-y-6">
            <div className="space-y-6">
              {/* User Name */}
              <div
                className="flex items-center justify-between py-3 border-b border-border cursor-pointer hover:bg-secondary/20 rounded px-2 -mx-2"
                onClick={() => setShowNameEdit(true)}
              >
                <div className="text-base font-medium text-foreground">
                  Name
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-muted-foreground">{user?.name || "Not set"}</div>
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
                    {user?.birthday ? user.birthday.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }) : "Not set"}
                  </div>
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Biological Sex - Inline */}
              <div className="py-3 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-base font-medium text-foreground">
                    Biological sex
                  </div>
                </div>
                <Tabs
                  value={user?.gender || "male"}
                  onValueChange={handleGenderChange}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 bg-secondary border border-border">
                    <TabsTrigger
                      value="male"
                      className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:bg-transparent data-[state=inactive]:border-muted-foreground/20"
                    >
                      Male
                    </TabsTrigger>
                    <TabsTrigger
                      value="female"
                      className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:bg-transparent data-[state=inactive]:border-muted-foreground/20"
                    >
                      Female
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
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
                    {user?.height ? getFormattedHeight(user.height) : "Not set"}
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
              {/* Units Toggle - Use Tabs instead of Switch */}
              <div className="py-4 border-b border-border">
                <div className="mb-3">
                  <div className="text-base font-medium text-foreground">
                    Units
                  </div>
                </div>
                <Tabs
                  value={settings?.units || "imperial"}
                  onValueChange={(value) => updateSettings({ units: value as "imperial" | "metric" })}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 bg-secondary border border-border">
                    <TabsTrigger value="imperial">
                      Imperial (lbs, ft/in)
                    </TabsTrigger>
                    <TabsTrigger value="metric">
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
              <div className="py-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-base font-medium text-foreground">
                      Sync from Apple HealthKit
                    </div>
                    <div className="text-sm text-muted-foreground">iOS only</div>
                  </div>
                  <Switch
                    checked={settings?.healthKitSyncEnabled || false}
                    onCheckedChange={handleHealthKitToggle}
                  />
                </div>
                {settings?.healthKitSyncEnabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // TODO: Implement manual sync
                      console.log('Manual HealthKit sync requested');
                    }}
                    className="w-full bg-secondary border-border text-foreground hover:bg-muted"
                  >
                    Sync now
                  </Button>
                )}
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
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide border-b border-border pb-3">
              Account
            </h2>

            <div className="space-y-4">
              {/* Email */}
              <div
                className="flex items-center justify-between py-4 cursor-pointer hover:bg-secondary/20 rounded px-2 -mx-2"
                onClick={() => setShowEmailEdit(true)}
              >
                <div className="text-base font-medium text-foreground">
                  Email
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-muted-foreground">{user?.email || "Not set"}</div>
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Password */}
              <div
                className="flex items-center justify-between py-4 cursor-pointer hover:bg-secondary/20 rounded px-2 -mx-2"
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
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide border-b border-border pb-3 mb-6">
                Security
              </h2>
              <BiometricSetup />
            </div>

            {/* Database Status Section */}
            <div className="border-t border-border pt-6">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide border-b border-border pb-3 mb-6">
                System Status
              </h2>
              <DatabaseDebug />
            </div>

            {/* RevenueCat Debug Section */}
            <div className="border-t border-border pt-6">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide border-b border-border pb-3 mb-6">
                RevenueCat Integration
              </h2>
              <RevenueCatDebug />
            </div>

            {/* Version Information Section */}
            <div className="border-t border-border pt-6">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide border-b border-border pb-3 mb-6">
                Version Information
              </h2>
              <VersionDisplay showBuildInfo={true} />
            </div>

            {/* Logout Section */}
            <div className="border-t border-border pt-6">
              <div
                className="flex items-center justify-between py-4 cursor-pointer hover:bg-secondary/20 rounded px-2 -mx-2"
                onClick={handleLogout}
              >
                <div className="flex items-center gap-3">
                  <LogOut className="h-4 w-4 text-destructive" />
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
          <DialogContent className="bg-background border-border text-foreground max-w-md">
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
          <DialogContent className="bg-background border-border text-foreground max-w-md">
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
                  className="bg-secondary border-border text-foreground"
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
          <DialogContent className="bg-background border-border text-foreground max-w-md">
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
                  className="bg-secondary border-border text-foreground"
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
