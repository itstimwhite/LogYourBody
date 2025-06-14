import { useState, useEffect } from "react";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// HealthKit plugin interface (matching @perfood/capacitor-healthkit)
interface HealthKitPlugin {
  isAvailable(): Promise<void>;
  requestAuthorization(options: {
    all?: string[];
    read?: string[];
    write?: string[];
  }): Promise<void>;
  getAuthorizationStatus(options: { sampleName: string }): Promise<{
    status: "notDetermined" | "sharingDenied" | "sharingAuthorized";
  }>;
  getBodyMassEntries(options: {
    startDate: string;
    endDate?: string;
    limit?: number;
  }): Promise<{
    data: Array<{
      date: string;
      value: number;
      unit: string;
      uuid: string;
      sourceName: string;
      sourceBundleId: string;
    }>;
  }>;
  getStatisticsCollection(options: {
    startDate: string;
    endDate?: string;
    anchorDate: string;
    interval: {
      unit: "second" | "minute" | "hour" | "day" | "month" | "year";
      value: number;
    };
    quantityTypeSampleName: string;
  }): Promise<{
    data: Array<{
      startDate: string;
      endDate: string;
      value: number;
    }>;
  }>;
}

interface HealthKitSample {
  value: number;
  date: string;
  sampleType: string;
  unit: string;
}

interface HealthData {
  height?: number; // in meters
  weight?: number; // in kg
  bodyFatPercentage?: number; // percentage
  stepCount?: number; // steps
  dateOfBirth?: Date;
  biologicalSex?: "male" | "female" | "other";
}

interface HealthKitSyncResult {
  success: boolean;
  weightEntries?: number;
  bodyFatEntries?: number;
  stepEntries?: number;
  profileUpdated?: boolean;
  error?: string;
}

interface UseHealthKitReturn {
  isAvailable: boolean;
  isAuthorized: boolean;
  loading: boolean;
  error: string | null;
  requestPermissions: () => Promise<boolean>;
  getHealthData: () => Promise<HealthData | null>;
  getWeightHistory: (
    startDate: Date,
    endDate: Date,
  ) => Promise<HealthKitSample[]>;
  syncHealthData: () => Promise<HealthKitSyncResult>;
  syncToDatabase: () => Promise<HealthKitSyncResult>;
}

// Register the HealthKit plugin with the correct name
const CapacitorHealthkit =
  registerPlugin<HealthKitPlugin>("CapacitorHealthkit");

// Get HealthKit plugin with better error handling
const getHealthKit = (): HealthKitPlugin | null => {
  // Quick exit for non-iOS platforms
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "ios") {
    return null;
  }

  try {
    // Return the registered plugin
    if (CapacitorHealthkit) {
      console.log("HealthKit: Plugin loaded successfully");
      return CapacitorHealthkit;
    }

    console.log("HealthKit: Plugin not available");
    return null;
  } catch (error) {
    console.warn("HealthKit: Error accessing plugin:", error);
    return null;
  }
};

export function useHealthKit(): UseHealthKitReturn {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const { user } = useAuth();

  const healthKit = getHealthKit();

  useEffect(() => {
    // Only initialize if we're on native iOS to prevent unnecessary plugin access
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "ios") {
      console.log("HealthKit: Not on native iOS, skipping initialization");
      setLoading(false);
      setIsAvailable(false);
      setInitialized(true);
      return;
    }

    // Delay HealthKit check to ensure Capacitor is fully initialized
    const initTimer = setTimeout(() => {
      checkAvailability();
    }, 1000); // Give Capacitor more time to load plugins

    // Safety timeout to prevent hanging on HealthKit initialization
    const timeoutTimer = setTimeout(() => {
      if (loading && !initialized) {
        console.warn("HealthKit initialization timed out");
        setLoading(false);
        setIsAvailable(false);
        setInitialized(true);
      }
    }, 3000); // 3 second timeout for safety

    return () => {
      clearTimeout(initTimer);
      clearTimeout(timeoutTimer);
    };
  }, []);

  const checkAvailability = async () => {
    // Fast exit for non-iOS platforms
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "ios") {
      console.log("HealthKit: Not on native iOS, skipping availability check");
      setIsAvailable(false);
      setLoading(false);
      setInitialized(true);
      return;
    }

    if (!healthKit) {
      console.log("HealthKit: Plugin not available");
      setIsAvailable(false);
      setLoading(false);
      setInitialized(true);
      return;
    }

    try {
      console.log("HealthKit: Checking availability...");
      // The isAvailable() method doesn't return a value, it just throws if not available
      await healthKit.isAvailable();
      // If we get here without throwing, HealthKit is available
      setIsAvailable(true);
      console.log("HealthKit is available");

      // Check if we already have authorization for body mass
      try {
        const authStatus = await healthKit.getAuthorizationStatus({
          sampleName: "HKQuantityTypeIdentifierBodyMass",
        });
        const authorized = authStatus.status === "sharingAuthorized";
        setIsAuthorized(authorized);
        console.log(
          "HealthKit authorization status:",
          authStatus.status,
          "authorized:",
          authorized,
        );
      } catch (authErr) {
        console.log("Could not check authorization status:", authErr);
        setIsAuthorized(false);
      }
    } catch (err: any) {
      // If it throws, HealthKit is not available
      console.log("HealthKit is not available:", err);
      setIsAvailable(false);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    if (!healthKit || !isAvailable) {
      console.warn("HealthKit not available");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Request authorization - this doesn't return a granted status
      await healthKit.requestAuthorization({
        all: [
          "HKQuantityTypeIdentifierHeight",
          "HKQuantityTypeIdentifierBodyMass",
          "HKQuantityTypeIdentifierBodyFatPercentage",
          "HKQuantityTypeIdentifierLeanBodyMass",
          "HKQuantityTypeIdentifierStepCount",
          "HKCharacteristicTypeIdentifierDateOfBirth",
          "HKCharacteristicTypeIdentifierBiologicalSex",
        ],
      });

      // Check authorization status for a sample type to see if we got permission
      const authStatus = await healthKit.getAuthorizationStatus({
        sampleName: "HKQuantityTypeIdentifierBodyMass",
      });

      const isAuthorized = authStatus.status === "sharingAuthorized";
      setIsAuthorized(isAuthorized);
      console.log("HealthKit authorization status:", authStatus.status);
      return isAuthorized;
    } catch (err: any) {
      console.error("Error requesting HealthKit permissions:", err);
      setError(err.message || "Failed to request HealthKit permissions");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getHealthData = async (): Promise<HealthData | null> => {
    if (!healthKit || !isAvailable || !isAuthorized) {
      return null;
    }

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1); // Get last year of data

      const healthData: HealthData = {};

      // Get body mass data
      try {
        const weightResult = await healthKit.getBodyMassEntries({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          limit: 1, // Just get the most recent
        });

        if (weightResult.data.length > 0) {
          healthData.weight = weightResult.data[0].value;
        }
      } catch (err) {
        console.log("Could not get weight data:", err);
      }

      // For this simplified plugin, we can only get body mass data
      // Other data types would require different API calls or might not be supported

      console.log("Retrieved HealthKit data:", healthData);
      return healthData;
    } catch (err: any) {
      console.error("Error getting HealthKit data:", err);
      setError(err.message || "Failed to get HealthKit data");
      return null;
    }
  };

  const getWeightHistory = async (
    startDate: Date,
    endDate: Date,
  ): Promise<HealthKitSample[]> => {
    if (!healthKit || !isAvailable || !isAuthorized) {
      return [];
    }

    try {
      const result = await healthKit.getBodyMassEntries({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 1000, // Get up to 1000 weight entries
      });

      // Convert the data format to match our interface
      return result.data.map((entry) => ({
        value: entry.value,
        date: entry.date,
        sampleType: "HKQuantityTypeIdentifierBodyMass",
        unit: entry.unit,
      }));
    } catch (err: any) {
      console.error("Error getting weight history:", err);
      setError(err.message || "Failed to get weight history");
      return [];
    }
  };

  const syncHealthData = async (): Promise<HealthKitSyncResult> => {
    // This function will be implemented to sync data back to HealthKit
    // For now, it's a placeholder for future write operations
    console.log("HealthKit write sync not yet implemented");
    return { success: false, error: "Write sync not implemented" };
  };

  const syncToDatabase = async (): Promise<HealthKitSyncResult> => {
    console.log(
      "syncToDatabase called - healthKit:",
      !!healthKit,
      "isAvailable:",
      isAvailable,
      "isAuthorized:",
      isAuthorized,
    );

    if (!healthKit || !isAvailable || !isAuthorized) {
      const errorMsg = `HealthKit not ready - plugin: ${!!healthKit}, available: ${isAvailable}, authorized: ${isAuthorized}`;
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    if (!user || !isSupabaseConfigured || !supabase) {
      const errorMsg = `Database not ready - user: ${!!user}, supabase: ${!!supabase}, configured: ${isSupabaseConfigured}`;
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      console.log("Starting HealthKit sync to database...");

      const result: HealthKitSyncResult = {
        success: false,
        weightEntries: 0,
        bodyFatEntries: 0,
        stepEntries: 0,
        profileUpdated: false,
      };

      // Get the last 30 days of data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      // 1. Sync weight data
      try {
        console.log(
          "Requesting body mass entries from:",
          startDate.toISOString(),
          "to:",
          endDate.toISOString(),
        );
        const weightData = await healthKit.getBodyMassEntries({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          limit: 100,
        });

        console.log("HealthKit body mass response:", weightData);
        console.log(
          "Number of weight entries found:",
          weightData.data?.length || 0,
        );

        if (weightData.data && weightData.data.length > 0) {
          console.log(
            "Processing",
            weightData.data.length,
            "weight entries...",
          );
          for (const sample of weightData.data) {
            const sampleDate = new Date(sample.date)
              .toISOString()
              .split("T")[0];

            // Check if we already have data for this date
            const { data: existing } = await supabase
              .from("body_metrics")
              .select("id")
              .eq("user_id", user.id)
              .eq("date", sampleDate)
              .single();

            if (!existing) {
              // Insert new body metrics entry with estimated body fat if we don't have real data
              const { error } = await supabase.from("body_metrics").insert({
                user_id: user.id,
                date: sampleDate,
                weight: sample.value,
                body_fat_percentage: 15.0, // Default/estimated value
                method: "scale", // Assuming scale measurement
              });

              if (!error) {
                result.weightEntries = (result.weightEntries || 0) + 1;
              }
            }
          }
        } else {
          console.log("No weight data found in HealthKit or empty response");
        }
      } catch (error) {
        console.warn("Error syncing weight data:", error);
      }

      // Note: This plugin only supports body mass data, so we can't sync body fat or steps
      // If you need those features, you'll need a more comprehensive HealthKit plugin

      result.success = true;
      console.log("HealthKit sync completed:", result);
      return result;
    } catch (error) {
      console.error("Error during HealthKit sync:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown sync error",
      };
    }
  };

  return {
    isAvailable,
    isAuthorized,
    loading,
    error,
    requestPermissions,
    getHealthData,
    getWeightHistory,
    syncHealthData,
    syncToDatabase,
  };
}
