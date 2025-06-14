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
      console.warn(
        "ProfileGuard: Fallback timeout triggered, allowing access without profile check",
      );
      setLoading(false);
      // Don't force profile setup on timeout - just allow access
    }, 5000); // 5 second fallback - reduced from 15

    return () => clearTimeout(fallbackTimeout);
  }, [user]); // Remove loading from dependencies to avoid infinite loop

  const loadProfile = async () => {
    if (!user || !isSupabaseConfigured || !supabase) {
      // In development/mock mode, assume profile is complete
      console.log("ProfileGuard: Supabase not configured, allowing access");
      setLoading(false);
      return;
    }

    console.log("ProfileGuard: Loading profile for user:", user.id);

    try {
      // Add timeout to prevent hanging - increase to 10 seconds for better reliability
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Profile query timeout")), 10000);
      });

      const queryPromise = supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: profileData, error } = (await Promise.race([
        queryPromise,
        timeoutPromise,
      ])) as any;

      console.log("ProfileGuard: Profile query result:", {
        profileData,
        error,
      });

      if (error && error.code !== "PGRST116") {
        console.error("ProfileGuard: Error loading profile:", error);
        // If there's a database error, allow access and let the user try again
        setLoading(false);
        return;
      }

      if (!profileData || isProfileIncomplete(profileData)) {
        console.log(
          "ProfileGuard: Profile incomplete, checking platform for next step",
        );
        console.log("ProfileGuard: Profile data:", profileData);
        console.log(
          "ProfileGuard: isProfileIncomplete result:",
          isProfileIncomplete(profileData),
        );
        console.log("ProfileGuard: isNativeiOS result:", isNativeiOS());
        console.log("ProfileGuard: healthKitData:", healthKitData);

        // Show HealthKit setup first ONLY on native iOS if profile is incomplete
        if (isNativeiOS() && !healthKitData) {
          console.log(
            "ProfileGuard: Native iOS detected, showing HealthKit setup",
          );
          setShowHealthKitSetup(true);
        } else {
          console.log(
            "ProfileGuard: Not native iOS or HealthKit already handled, showing profile setup",
          );
          setNeedsSetup(true);
        }
      } else {
        console.log("ProfileGuard: Profile complete, allowing access");
        setProfile(profileData);
        setNeedsSetup(false);
      }
    } catch (error: any) {
      console.error("ProfileGuard: Profile loading error:", error);
      
      // Check if it's a timeout error
      if (error.message === "Profile query timeout") {
        console.warn("ProfileGuard: Query timed out - database might be slow");
      }
      
      // On timeout or error, allow access rather than blocking the user
      console.log(
        "ProfileGuard: Allowing access due to error - user can complete profile later",
      );
      
      // Set a default empty profile to prevent issues
      setProfile({
        id: user.id,
        name: user.email?.split('@')[0] || 'User',
        gender: 'male' as const,
        birthday: new Date(Date.now() - 30 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        height: 180,
        email: user.email || '',
      });
      
      setLoading(false);
      setNeedsSetup(false); // Don't force setup on error
    } finally {
      setLoading(false);
    }
  };

  const isProfileIncomplete = (profile: any): boolean => {
    if (!profile) return true;

    // Be more lenient - only require essential fields for basic functionality
    // Only show onboarding for completely empty/new profiles
    const hasNoName =
      !profile.name || profile.name === "User" || profile.name.trim() === "";
    const hasNoGender = !profile.gender;
    const hasNoHeight = !profile.height || profile.height === 180; // Default height from AuthContext
    const hasNoBirthday = !profile.birthday;

    // Only consider profile incomplete if ALL essential fields are missing/default
    // This prevents re-showing onboarding for users who have already set up their profile
    const essentialFieldsMissing =
      hasNoName && hasNoGender && hasNoHeight && hasNoBirthday;

    console.log("ProfileGuard: Profile completeness check:", {
      hasNoName,
      hasNoGender,
      hasNoHeight,
      hasNoBirthday,
      essentialFieldsMissing,
      profile: {
        name: profile.name,
        gender: profile.gender,
        height: profile.height,
        birthday: profile.birthday,
      },
    });

    return essentialFieldsMissing;
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
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading profile...</p>
          <p className="mt-2 text-xs text-muted-foreground">Please wait...</p>
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
