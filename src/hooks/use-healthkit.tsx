import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// HealthKit plugin interface
interface HealthKitPlugin {
  isAvailable(): Promise<{ available: boolean }>;
  requestPermissions(options: {
    read: string[];
    write: string[];
  }): Promise<{ granted: boolean }>;
  queryHKitSampleType(options: {
    sampleName: string;
    startDate: string;
    endDate: string;
    limit?: number;
  }): Promise<{ resultData: HealthKitSample[] }>;
  multipleQueryHKitSampleType(options: {
    sampleNames: string[];
    startDate: string;
    endDate: string;
    limit?: number;
  }): Promise<{ resultData: HealthKitSample[] }>;
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
  biologicalSex?: 'male' | 'female' | 'other';
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
  getWeightHistory: (startDate: Date, endDate: Date) => Promise<HealthKitSample[]>;
  syncHealthData: () => Promise<HealthKitSyncResult>;
  syncToDatabase: () => Promise<HealthKitSyncResult>;
}

// Get HealthKit plugin
const getHealthKit = (): HealthKitPlugin | null => {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    return null;
  }
  
  try {
    const { HealthKit } = Capacitor.Plugins as any;
    return HealthKit;
  } catch (error) {
    console.warn('HealthKit plugin not available:', error);
    return null;
  }
};

export function useHealthKit(): UseHealthKitReturn {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const healthKit = getHealthKit();

  useEffect(() => {
    checkAvailability();
    
    // Safety timeout to prevent hanging on HealthKit initialization
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('HealthKit initialization timed out');
        setLoading(false);
        setIsAvailable(false);
      }
    }, 1000); // 1 second timeout (reduced since we have fast exit)
    
    return () => clearTimeout(timeout);
  }, []);

  const checkAvailability = async () => {
    // Fast exit for non-iOS platforms
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
      console.log('HealthKit: Not on native iOS, skipping availability check');
      setIsAvailable(false);
      setLoading(false);
      return;
    }

    if (!healthKit) {
      console.log('HealthKit: Plugin not available');
      setIsAvailable(false);
      setLoading(false);
      return;
    }

    try {
      const result = await healthKit.isAvailable();
      setIsAvailable(result.available);
      console.log('HealthKit availability:', result.available);
    } catch (err: any) {
      console.error('Error checking HealthKit availability:', err);
      setError(err.message || 'Failed to check HealthKit availability');
      setIsAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    if (!healthKit || !isAvailable) {
      console.warn('HealthKit not available');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await healthKit.requestPermissions({
        read: [
          'HKQuantityTypeIdentifierHeight',
          'HKQuantityTypeIdentifierBodyMass',
          'HKQuantityTypeIdentifierBodyFatPercentage',
          'HKQuantityTypeIdentifierLeanBodyMass',
          'HKQuantityTypeIdentifierStepCount',
          'HKCharacteristicTypeIdentifierDateOfBirth',
          'HKCharacteristicTypeIdentifierBiologicalSex',
        ],
        write: [
          'HKQuantityTypeIdentifierBodyMass',
          'HKQuantityTypeIdentifierBodyFatPercentage',
        ],
      });

      setIsAuthorized(result.granted);
      console.log('HealthKit permissions granted:', result.granted);
      return result.granted;
    } catch (err: any) {
      console.error('Error requesting HealthKit permissions:', err);
      setError(err.message || 'Failed to request HealthKit permissions');
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

      // Query multiple sample types
      const result = await healthKit.multipleQueryHKitSampleType({
        sampleNames: [
          'HKQuantityTypeIdentifierHeight',
          'HKQuantityTypeIdentifierBodyMass',
          'HKQuantityTypeIdentifierBodyFatPercentage',
          'HKQuantityTypeIdentifierStepCount',
          'HKCharacteristicTypeIdentifierDateOfBirth',
          'HKCharacteristicTypeIdentifierBiologicalSex',
        ],
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 100, // Get more recent entries
      });

      const healthData: HealthData = {};

      if (result.resultData) {
        // Group samples by type and get the most recent for each
        const samplesByType: { [key: string]: HealthKitSample[] } = {};
        result.resultData.forEach(sample => {
          if (!samplesByType[sample.sampleType]) {
            samplesByType[sample.sampleType] = [];
          }
          samplesByType[sample.sampleType].push(sample);
        });

        // Get most recent values for each type
        Object.entries(samplesByType).forEach(([sampleType, samples]) => {
          // Sort by date descending to get most recent
          const sortedSamples = samples.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          const mostRecent = sortedSamples[0];

          switch (sampleType) {
            case 'HKQuantityTypeIdentifierHeight':
              // Convert from meters to centimeters for easier handling
              healthData.height = mostRecent.value * 100;
              break;
            case 'HKQuantityTypeIdentifierBodyMass':
              healthData.weight = mostRecent.value;
              break;
            case 'HKQuantityTypeIdentifierBodyFatPercentage':
              healthData.bodyFatPercentage = mostRecent.value;
              break;
            case 'HKQuantityTypeIdentifierStepCount':
              // For step count, we might want today's total
              const today = new Date();
              const todaysSamples = samples.filter(sample => {
                const sampleDate = new Date(sample.date);
                return sampleDate.toDateString() === today.toDateString();
              });
              healthData.stepCount = todaysSamples.reduce((total, sample) => total + sample.value, 0);
              break;
            case 'HKCharacteristicTypeIdentifierDateOfBirth':
              healthData.dateOfBirth = new Date(mostRecent.date);
              break;
            case 'HKCharacteristicTypeIdentifierBiologicalSex':
              // Map HealthKit biological sex values
              switch (mostRecent.value) {
                case 1:
                  healthData.biologicalSex = 'female';
                  break;
                case 2:
                  healthData.biologicalSex = 'male';
                  break;
                default:
                  healthData.biologicalSex = 'other';
              }
              break;
          }
        });
      }

      console.log('Retrieved HealthKit data:', healthData);
      return healthData;
    } catch (err: any) {
      console.error('Error getting HealthKit data:', err);
      setError(err.message || 'Failed to get HealthKit data');
      return null;
    }
  };

  const getWeightHistory = async (startDate: Date, endDate: Date): Promise<HealthKitSample[]> => {
    if (!healthKit || !isAvailable || !isAuthorized) {
      return [];
    }

    try {
      const result = await healthKit.queryHKitSampleType({
        sampleName: 'HKQuantityTypeIdentifierBodyMass',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 1000, // Get up to 1000 weight entries
      });

      return result.resultData || [];
    } catch (err: any) {
      console.error('Error getting weight history:', err);
      setError(err.message || 'Failed to get weight history');
      return [];
    }
  };

  const syncHealthData = async (): Promise<HealthKitSyncResult> => {
    // This function will be implemented to sync data back to HealthKit
    // For now, it's a placeholder for future write operations
    console.log('HealthKit write sync not yet implemented');
    return { success: false, error: 'Write sync not implemented' };
  };

  const syncToDatabase = async (): Promise<HealthKitSyncResult> => {
    if (!healthKit || !isAvailable || !isAuthorized) {
      return { success: false, error: 'HealthKit not available or not authorized' };
    }

    if (!user || !isSupabaseConfigured || !supabase) {
      return { success: false, error: 'User not authenticated or database not configured' };
    }

    try {
      console.log('Starting HealthKit sync to database...');
      
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
        const weightData = await healthKit.queryHKitSampleType({
          sampleName: 'HKQuantityTypeIdentifierBodyMass',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          limit: 100,
        });

        if (weightData.resultData && weightData.resultData.length > 0) {
          for (const sample of weightData.resultData) {
            const sampleDate = new Date(sample.date).toISOString().split('T')[0];
            
            // Check if we already have data for this date
            const { data: existing } = await supabase
              .from('body_metrics')
              .select('id')
              .eq('user_id', user.id)
              .eq('date', sampleDate)
              .single();

            if (!existing) {
              // Insert new body metrics entry with estimated body fat if we don't have real data
              const { error } = await supabase
                .from('body_metrics')
                .insert({
                  user_id: user.id,
                  date: sampleDate,
                  weight: sample.value,
                  body_fat_percentage: 15.0, // Default/estimated value
                  method: 'scale', // Assuming scale measurement
                });

              if (!error) {
                result.weightEntries = (result.weightEntries || 0) + 1;
              }
            }
          }
        }
      } catch (error) {
        console.warn('Error syncing weight data:', error);
      }

      // 2. Sync body fat data
      try {
        const bodyFatData = await healthKit.queryHKitSampleType({
          sampleName: 'HKQuantityTypeIdentifierBodyFatPercentage',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          limit: 100,
        });

        if (bodyFatData.resultData && bodyFatData.resultData.length > 0) {
          for (const sample of bodyFatData.resultData) {
            const sampleDate = new Date(sample.date).toISOString().split('T')[0];
            
            // Update existing entry or create new one
            const { data: existing } = await supabase
              .from('body_metrics')
              .select('id, weight')
              .eq('user_id', user.id)
              .eq('date', sampleDate)
              .single();

            if (existing) {
              // Update existing entry with body fat data
              const { error } = await supabase
                .from('body_metrics')
                .update({
                  body_fat_percentage: sample.value * 100, // Convert from decimal to percentage
                  method: 'dexa', // Assume more accurate measurement if body fat is available
                })
                .eq('id', existing.id);

              if (!error) {
                result.bodyFatEntries = (result.bodyFatEntries || 0) + 1;
              }
            } else {
              // Create new entry with body fat (need weight too, use a default)
              const { error } = await supabase
                .from('body_metrics')
                .insert({
                  user_id: user.id,
                  date: sampleDate,
                  weight: 70.0, // Default weight if no weight data
                  body_fat_percentage: sample.value * 100,
                  method: 'dexa',
                });

              if (!error) {
                result.bodyFatEntries = (result.bodyFatEntries || 0) + 1;
              }
            }
          }
        }
      } catch (error) {
        console.warn('Error syncing body fat data:', error);
      }

      // 3. Update profile with latest height and other characteristics
      try {
        const profileData = await getHealthData();
        if (profileData) {
          const updates: any = {};
          
          if (profileData.height) {
            updates.height = Math.round(profileData.height);
          }
          
          if (profileData.biologicalSex && profileData.biologicalSex !== 'other') {
            updates.gender = profileData.biologicalSex;
          }
          
          if (profileData.dateOfBirth) {
            updates.birthday = profileData.dateOfBirth;
          }

          if (Object.keys(updates).length > 0) {
            const { error } = await supabase
              .from('profiles')
              .update(updates)
              .eq('id', user.id);

            if (!error) {
              result.profileUpdated = true;
            }
          }
        }
      } catch (error) {
        console.warn('Error updating profile:', error);
      }

      // 4. Sync step count to daily_metrics table
      try {
        const stepData = await healthKit.queryHKitSampleType({
          sampleName: 'HKQuantityTypeIdentifierStepCount',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          limit: 100,
        });

        if (stepData.resultData && stepData.resultData.length > 0) {
          // Group step data by date and sum steps for each day
          const stepsByDate: { [date: string]: number } = {};
          
          stepData.resultData.forEach(sample => {
            const sampleDate = new Date(sample.date).toISOString().split('T')[0];
            stepsByDate[sampleDate] = (stepsByDate[sampleDate] || 0) + sample.value;
          });

          for (const [sampleDate, totalSteps] of Object.entries(stepsByDate)) {
            // Upsert daily metrics
            const { error } = await supabase
              .from('daily_metrics')
              .upsert({
                user_id: user.id,
                date: sampleDate,
                step_count: Math.round(totalSteps),
              }, {
                onConflict: 'user_id,date'
              });

            if (!error) {
              result.stepEntries = (result.stepEntries || 0) + 1;
            }
          }
        }
      } catch (error) {
        console.warn('Error syncing step count data:', error);
      }

      result.success = true;
      console.log('HealthKit sync completed:', result);
      return result;

    } catch (error) {
      console.error('Error during HealthKit sync:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown sync error',
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