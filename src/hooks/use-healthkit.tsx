import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

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
  dateOfBirth?: Date;
  biologicalSex?: 'male' | 'female' | 'other';
}

interface UseHealthKitReturn {
  isAvailable: boolean;
  isAuthorized: boolean;
  loading: boolean;
  error: string | null;
  requestPermissions: () => Promise<boolean>;
  getHealthData: () => Promise<HealthData | null>;
  getWeightHistory: (startDate: Date, endDate: Date) => Promise<HealthKitSample[]>;
  syncHealthData: () => Promise<void>;
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

  const healthKit = getHealthKit();

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    if (!healthKit) {
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
          'HKCharacteristicTypeIdentifierDateOfBirth',
          'HKCharacteristicTypeIdentifierBiologicalSex',
        ],
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 1, // Get most recent for height and characteristics
      });

      const healthData: HealthData = {};

      if (result.resultData) {
        for (const sample of result.resultData) {
          switch (sample.sampleType) {
            case 'HKQuantityTypeIdentifierHeight':
              // Convert from meters to centimeters for easier handling
              healthData.height = sample.value * 100;
              break;
            case 'HKQuantityTypeIdentifierBodyMass':
              healthData.weight = sample.value;
              break;
            case 'HKCharacteristicTypeIdentifierDateOfBirth':
              healthData.dateOfBirth = new Date(sample.date);
              break;
            case 'HKCharacteristicTypeIdentifierBiologicalSex':
              // Map HealthKit biological sex values
              switch (sample.value) {
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
        }
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

  const syncHealthData = async (): Promise<void> => {
    // This function will be implemented to sync data back to HealthKit
    // For now, it's a placeholder for future write operations
    console.log('HealthKit sync not yet implemented');
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
  };
}