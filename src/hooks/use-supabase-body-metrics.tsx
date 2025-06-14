import { useState, useCallback, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useSafeQuery } from "./use-safe-query";
import { useQueryClient } from "@tanstack/react-query";
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
  // Validate inputs
  if (!weight || weight <= 0 || isNaN(weight)) return 0;
  if (!bodyFatPercentage || bodyFatPercentage < 0 || bodyFatPercentage > 100 || isNaN(bodyFatPercentage)) return weight;
  
  return weight * (1 - bodyFatPercentage / 100);
}

function calculateFFMI(leanBodyMass: number, heightCm: number): number {
  // Validate inputs to prevent NaN
  if (!leanBodyMass || leanBodyMass <= 0 || isNaN(leanBodyMass)) return 0;
  if (!heightCm || heightCm <= 0 || isNaN(heightCm)) return 0;
  
  const heightM = heightCm / 100;
  const ffmi = leanBodyMass / (heightM * heightM);
  
  // Validate result
  if (isNaN(ffmi) || !isFinite(ffmi)) return 0;
  
  return ffmi;
}

export function useSupabaseBodyMetrics() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);

  // Individual query functions for cached data fetching
  const fetchUserProfile = async (): Promise<UserProfile | null> => {
    if (!user?.id) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    // Convert birthday string to Date object if it exists
    if (data && data.birthday) {
      data.birthday = new Date(data.birthday);
    }

    return data;
  };

  const fetchUserSettings = async (): Promise<UserSettings | null> => {
    if (!user?.id) return null;

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Return default settings if none exist
        return {
          userId: user.id,
          units: "imperial",
          healthKitSyncEnabled: false,
          googleFitSyncEnabled: false,
        };
      }

      throw new Error(`Failed to fetch settings: ${error.message}`);
    }

    return data;
  };

  const fetchBodyMetrics = async (): Promise<BodyMetrics[]> => {
    if (!user?.id) return [];

    const { data, error } = await supabase
      .from("body_metrics")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch metrics: ${error.message}`);
    }

    // Convert date strings to Date objects
    const processedData = (data || []).map((item) => ({
      ...item,
      date: new Date(item.date),
    }));

    return processedData;
  };

  // Use safe queries with caching
  const profileQuery = useSafeQuery({
    queryKey: ["profile", user?.id],
    queryFn: fetchUserProfile,
    enabled: !!user?.id,
  });

  const settingsQuery = useSafeQuery({
    queryKey: ["settings", user?.id],
    queryFn: fetchUserSettings,
    enabled: !!user?.id,
  });

  const metricsQuery = useSafeQuery({
    queryKey: ["metrics", user?.id],
    queryFn: fetchBodyMetrics,
    enabled: !!user?.id,
  });

  // Extract data from queries
  const userProfile = profileQuery.data || null;
  const settings = settingsQuery.data || null;
  const metrics = metricsQuery.data || [];

  // Combined loading state
  const loading =
    profileQuery.isLoading || settingsQuery.isLoading || metricsQuery.isLoading;

  // Set initial selected date index when metrics load
  useEffect(() => {
    if (metrics.length > 0 && selectedDateIndex === 0) {
      setSelectedDateIndex(Math.max(0, metrics.length - 1));
    }
  }, [metrics.length, selectedDateIndex]);

  const sortedMetrics = useMemo(() => {
    return [...metrics].sort((a, b) => {
      try {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);

        // Check if dates are valid
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          console.warn("Invalid date in metrics:", { a: a.date, b: b.date });
          return 0;
        }

        return dateA.getTime() - dateB.getTime();
      } catch (error) {
        console.error("Error sorting metrics by date:", error);
        return 0;
      }
    });
  }, [metrics]);

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
          // Invalidate metrics query to refetch and update cache
          queryClient.invalidateQueries({ queryKey: ["metrics", user.id] });

          // Select the newest entry after data is updated
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

        // Invalidate profile query to refetch and update cache
        queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
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

        // Invalidate settings query to refetch and update cache
        queryClient.invalidateQueries({ queryKey: ["settings", user.id] });
      } catch (error) {
        console.error("Error in updateSettings:", error);
      }
    },
    [user, settings],
  );

  const getFormattedWeight = useCallback(
    (weightKg: number) => {
      if (!settings) return "0 kg";
      if (!weightKg || weightKg <= 0 || isNaN(weightKg)) return settings.units === "metric" ? "0 kg" : "0 lbs";

      if (settings.units === "metric") {
        return `${Math.round(weightKg * 10) / 10} kg`;
      } else {
        const lbs = kgToLbs(weightKg);
        return `${Math.round(lbs * 10) / 10} lbs`;
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
      if (!settings) return "0 kg";
      if (!lbmKg || lbmKg <= 0 || isNaN(lbmKg)) return settings.units === "metric" ? "0 kg" : "0 lbs";

      if (settings.units === "metric") {
        return `${Math.round(lbmKg * 10) / 10} kg`;
      } else {
        const lbs = kgToLbs(lbmKg);
        return `${Math.round(lbs * 10) / 10} lbs`;
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
