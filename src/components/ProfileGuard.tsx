import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { ProfileSetup } from "./ProfileSetup";
import { HealthKitSetup } from "./HealthKitSetup";
import { isNativeiOS, logPlatformInfo } from "@/lib/platform";

interface ProfileGuardProps {
  children: React.ReactNode;
}

interface UserProfile {
  id: string;
  name: string;
  gender: "male" | "female";
  birthday: string;
  height: number;
  email: string;
}

export function ProfileGuard({ children }: ProfileGuardProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [showHealthKitSetup, setShowHealthKitSetup] = useState(false);
  const [healthKitData, setHealthKitData] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Log platform info for debugging
    logPlatformInfo();
    loadProfile();
    
    // Fallback timeout to ensure we never hang indefinitely
    const fallbackTimeout = setTimeout(() => {
      if (loading) {
        console.warn("ProfileGuard: Fallback timeout triggered, showing profile setup");
        setNeedsSetup(true);
        setLoading(false);
      }
    }, 15000); // 15 second fallback
    
    return () => clearTimeout(fallbackTimeout);
  }, [user, loading]);

  const loadProfile = async () => {
    if (!user || !isSupabaseConfigured || !supabase) {
      // In development/mock mode, assume profile is complete
      console.log("ProfileGuard: Supabase not configured, allowing access");
      setLoading(false);
      return;
    }

    console.log("ProfileGuard: Loading profile for user:", user.id);

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile query timeout')), 10000);
      });

      const queryPromise = supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: profileData, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      console.log("ProfileGuard: Profile query result:", { profileData, error });

      if (error && error.code !== "PGRST116") {
        console.error("ProfileGuard: Error loading profile:", error);
        // If there's a database error, allow access and let the user try again
        setLoading(false);
        return;
      }

      if (!profileData || isProfileIncomplete(profileData)) {
        console.log("ProfileGuard: Profile incomplete, checking platform for next step");
        console.log("ProfileGuard: Profile data:", profileData);
        console.log("ProfileGuard: isProfileIncomplete result:", isProfileIncomplete(profileData));
        console.log("ProfileGuard: isNativeiOS result:", isNativeiOS());
        console.log("ProfileGuard: healthKitData:", healthKitData);
        
        // Show HealthKit setup first ONLY on native iOS if profile is incomplete
        if (isNativeiOS() && !healthKitData) {
          console.log("ProfileGuard: Native iOS detected, showing HealthKit setup");
          setShowHealthKitSetup(true);
        } else {
          console.log("ProfileGuard: Not native iOS or HealthKit already handled, showing profile setup");
          setNeedsSetup(true);
        }
      } else {
        console.log("ProfileGuard: Profile complete, allowing access");
        setProfile(profileData);
        setNeedsSetup(false);
      }
    } catch (error) {
      console.error("ProfileGuard: Profile loading error:", error);
      // On timeout or error, show profile setup rather than blocking the user
      console.log("ProfileGuard: Showing profile setup due to error");
      setNeedsSetup(true);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const isProfileIncomplete = (profile: any): boolean => {
    if (!profile) return true;
    
    // Check for default/placeholder values that indicate incomplete setup
    const hasDefaultGender = !profile.gender;
    const hasDefaultBirthday = !profile.birthday || profile.birthday === new Date().toISOString().split("T")[0];
    const hasDefaultHeight = !profile.height || profile.height === 180; // Default height from AuthContext
    const hasEmptyName = !profile.name || profile.name === "User";

    return hasDefaultGender || hasDefaultBirthday || hasDefaultHeight || hasEmptyName;
  };

  const handleHealthKitComplete = (data?: any) => {
    console.log("HealthKit setup completed with data:", data);
    setHealthKitData(data);
    setShowHealthKitSetup(false);
    setNeedsSetup(true); // Now show profile setup with HealthKit data
  };

  const handleHealthKitSkip = () => {
    console.log("HealthKit setup skipped");
    setShowHealthKitSetup(false);
    setNeedsSetup(true); // Show profile setup without HealthKit data
  };

  const handleProfileComplete = () => {
    setNeedsSetup(false);
    loadProfile(); // Reload to get updated profile
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (showHealthKitSetup) {
    return (
      <HealthKitSetup
        onComplete={handleHealthKitComplete}
        onSkip={handleHealthKitSkip}
      />
    );
  }

  if (needsSetup) {
    return (
      <ProfileSetup
        onComplete={handleProfileComplete}
        healthKitData={healthKitData}
      />
    );
  }

  return <>{children}</>;
}