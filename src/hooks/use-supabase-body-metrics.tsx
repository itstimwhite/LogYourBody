import { useState, useCallback, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  BodyMetrics,
  UserProfile,
  DashboardMetrics,
  MeasurementMethod,
  UserSettings,
} from "@/types/bodymetrics";

// Utility functions for unit conversion
function lbsToKg(lbs: number): number {
  return lbs / 2.20462;
}

function kgToLbs(kg: number): number {
  return kg * 2.20462;
}

function cmToFeet(cm: number): string {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}

function cmToInches(cm: number): number {
  return cm / 2.54;
}

function calculateLeanBodyMass(
  weight: number,
  bodyFatPercentage: number,
): number {
  return weight * (1 - bodyFatPercentage / 100);
}

function calculateFFMI(leanBodyMass: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return leanBodyMass / (heightM * heightM);
}

export function useSupabaseBodyMetrics() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<BodyMetrics[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setUserProfile({
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          gender: profileData.gender,
          birthday: new Date(profileData.birthday),
          height: profileData.height,
          profileImage: profileData.profile_image_url,
        });
      }

      // Load settings
      const { data: settingsData } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (settingsData) {
        setSettings({
          userId: settingsData.user_id,
          units: settingsData.units,
          healthKitSyncEnabled: settingsData.health_kit_sync_enabled,
          googleFitSyncEnabled: settingsData.google_fit_sync_enabled,
        });
      }

      // Load metrics
      const { data: metricsData } = await supabase
        .from("body_metrics")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (metricsData) {
        const formattedMetrics: BodyMetrics[] = metricsData.map((metric) => ({
          id: metric.id,
          userId: metric.user_id,
          date: new Date(metric.date),
          weight: metric.weight,
          bodyFatPercentage: metric.body_fat_percentage,
          method: metric.method,
        }));
        setMetrics(formattedMetrics);
        setSelectedDateIndex(Math.max(0, formattedMetrics.length - 1));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const sortedMetrics = useMemo(
    () => [...metrics].sort((a, b) => a.date.getTime() - b.date.getTime()),
    [metrics],
  );

  const currentMetrics = useMemo((): DashboardMetrics => {
    const metric = sortedMetrics[selectedDateIndex];
    if (!metric || !userProfile) {
      return {
        bodyFatPercentage: 0,
        weight: 0,
        ffmi: 0,
        leanBodyMass: 0,
        date: new Date(),
      };
    }

    const leanBodyMass = calculateLeanBodyMass(
      metric.weight,
      metric.bodyFatPercentage,
    );
    const ffmi = calculateFFMI(leanBodyMass, userProfile.height);

    return {
      bodyFatPercentage: metric.bodyFatPercentage,
      weight: metric.weight,
      ffmi: Math.round(ffmi * 10) / 10,
      leanBodyMass: Math.round(leanBodyMass * 10) / 10,
      date: metric.date,
    };
  }, [sortedMetrics, selectedDateIndex, userProfile]);

  const addMetric = useCallback(
    async (newMetric: Omit<BodyMetrics, "id" | "userId">) => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("body_metrics")
          .insert({
            user_id: user.id,
            date: newMetric.date.toISOString().split("T")[0],
            weight: newMetric.weight,
            body_fat_percentage: newMetric.bodyFatPercentage,
            method: newMetric.method,
          })
          .select()
          .single();

        if (error) {
          console.error("Error adding metric:", error);
          return;
        }

        if (data) {
          const formattedMetric: BodyMetrics = {
            id: data.id,
            userId: data.user_id,
            date: new Date(data.date),
            weight: data.weight,
            bodyFatPercentage: data.body_fat_percentage,
            method: data.method,
          };

          setMetrics((prev) => [...prev, formattedMetric]);
          // Select the newest entry
          setSelectedDateIndex(sortedMetrics.length);
        }
      } catch (error) {
        console.error("Error in addMetric:", error);
      }
    },
    [user, sortedMetrics.length],
  );

  const updateUser = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user || !userProfile) return;

      try {
        const updateData: any = {};
        if (updates.name) updateData.name = updates.name;
        if (updates.email) updateData.email = updates.email;
        if (updates.gender) updateData.gender = updates.gender;
        if (updates.birthday)
          updateData.birthday = updates.birthday.toISOString().split("T")[0];
        if (updates.height) updateData.height = updates.height;
        if (updates.profileImage)
          updateData.profile_image_url = updates.profileImage;

        updateData.updated_at = new Date().toISOString();

        const { error } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", user.id);

        if (error) {
          console.error("Error updating user:", error);
          return;
        }

        setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
      } catch (error) {
        console.error("Error in updateUser:", error);
      }
    },
    [user, userProfile],
  );

  const updateSettings = useCallback(
    async (updates: Partial<UserSettings>) => {
      if (!user || !settings) return;

      try {
        const updateData: any = {};
        if (updates.units) updateData.units = updates.units;
        if (updates.healthKitSyncEnabled !== undefined)
          updateData.health_kit_sync_enabled = updates.healthKitSyncEnabled;
        if (updates.googleFitSyncEnabled !== undefined)
          updateData.google_fit_sync_enabled = updates.googleFitSyncEnabled;

        updateData.updated_at = new Date().toISOString();

        const { error } = await supabase
          .from("user_settings")
          .update(updateData)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error updating settings:", error);
          return;
        }

        setSettings((prev) => (prev ? { ...prev, ...updates } : null));
      } catch (error) {
        console.error("Error in updateSettings:", error);
      }
    },
    [user, settings],
  );

  const getFormattedWeight = useCallback(
    (weightKg: number) => {
      if (!settings) return `${weightKg} kg`;

      if (settings.units === "metric") {
        return `${Math.round(weightKg * 10) / 10} kg`;
      } else {
        return `${Math.round(kgToLbs(weightKg))} lbs`;
      }
    },
    [settings],
  );

  const getFormattedHeight = useCallback(
    (heightCm: number) => {
      if (!settings) return `${heightCm} cm`;

      if (settings.units === "metric") {
        return `${heightCm} cm`;
      } else {
        return cmToFeet(heightCm);
      }
    },
    [settings],
  );

  const getFormattedLeanBodyMass = useCallback(
    (lbmKg: number) => {
      if (!settings) return `${lbmKg} kg`;

      if (settings.units === "metric") {
        return `${Math.round(lbmKg * 10) / 10} kg`;
      } else {
        return `${Math.round(kgToLbs(lbmKg))} lbs`;
      }
    },
    [settings],
  );

  const getUserAge = useCallback(() => {
    if (!userProfile) return 0;

    const today = new Date();
    const birthDate = new Date(userProfile.birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }, [userProfile]);

  return {
    user: userProfile,
    metrics: sortedMetrics,
    currentMetrics,
    selectedDateIndex,
    setSelectedDateIndex,
    addMetric,
    updateUser,
    getUserAge,
    settings,
    updateSettings,
    getFormattedWeight,
    getFormattedHeight,
    getFormattedLeanBodyMass,
    loading,
    utils: {
      lbsToKg,
      kgToLbs,
      cmToFeet,
      cmToInches,
    },
  };
}
