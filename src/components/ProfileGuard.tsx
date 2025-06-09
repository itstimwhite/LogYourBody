import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { ProfileSetup } from "./ProfileSetup";

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

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user || !isSupabaseConfigured || !supabase) {
      // In development/mock mode, assume profile is complete
      console.log("ProfileGuard: Supabase not configured, allowing access");
      setLoading(false);
      return;
    }

    console.log("ProfileGuard: Loading profile for user:", user.id);

    try {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      console.log("ProfileGuard: Profile query result:", { profileData, error });

      if (error && error.code !== "PGRST116") {
        console.error("ProfileGuard: Error loading profile:", error);
        // If there's a database error, allow access and let the user try again
        setLoading(false);
        return;
      }

      if (!profileData || isProfileIncomplete(profileData)) {
        console.log("ProfileGuard: Profile incomplete, showing setup");
        setNeedsSetup(true);
      } else {
        console.log("ProfileGuard: Profile complete, allowing access");
        setProfile(profileData);
        setNeedsSetup(false);
      }
    } catch (error) {
      console.error("ProfileGuard: Profile loading error:", error);
      // On error, allow access rather than blocking the user
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

  if (needsSetup) {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  return <>{children}</>;
}