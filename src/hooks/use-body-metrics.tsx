import { useState, useCallback, useMemo } from "react";
import {
  BodyMetrics,
  UserProfile,
  DashboardMetrics,
  MeasurementMethod,
} from "@/types/bodymetrics";

// Mock data for demonstration
const mockUser: UserProfile = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  gender: "male",
  birthday: new Date("1990-01-15"),
  height: 180, // cm
};

const mockMetrics: BodyMetrics[] = [
  {
    id: "1",
    userId: "1",
    date: new Date("2024-01-01"),
    weight: 80,
    bodyFatPercentage: 15,
    method: "dexa",
  },
  {
    id: "2",
    userId: "1",
    date: new Date("2024-01-15"),
    weight: 79.5,
    bodyFatPercentage: 14.5,
    method: "scale",
  },
  {
    id: "3",
    userId: "1",
    date: new Date("2024-02-01"),
    weight: 79,
    bodyFatPercentage: 14,
    method: "calipers",
  },
  {
    id: "4",
    userId: "1",
    date: new Date("2024-02-15"),
    weight: 78.5,
    bodyFatPercentage: 13.5,
    method: "scale",
  },
];

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

const mockSettings: UserSettings = {
  userId: '1',
  units: 'imperial',
  healthKitSyncEnabled: false,
  googleFitSyncEnabled: false,
};

export function useBodyMetrics() {
  const [user] = useState<UserProfile>(mockUser);
  const [metrics, setMetrics] = useState<BodyMetrics[]>(mockMetrics);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(metrics.length - 1);
  const [settings, setSettings] = useState<UserSettings>(mockSettings);
    metrics.length - 1,
  );

  const sortedMetrics = useMemo(
    () => [...metrics].sort((a, b) => a.date.getTime() - b.date.getTime()),
    [metrics],
  );

  const currentMetrics = useMemo((): DashboardMetrics => {
    const metric = sortedMetrics[selectedDateIndex];
    if (!metric) {
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
    const ffmi = calculateFFMI(leanBodyMass, user.height);

    return {
      bodyFatPercentage: metric.bodyFatPercentage,
      weight: metric.weight,
      ffmi: Math.round(ffmi * 10) / 10,
      leanBodyMass: Math.round(leanBodyMass * 10) / 10,
      date: metric.date,
    };
  }, [sortedMetrics, selectedDateIndex, user.height]);

  const addMetric = useCallback(
    (newMetric: Omit<BodyMetrics, "id" | "userId">) => {
      const metric: BodyMetrics = {
        ...newMetric,
        id: Date.now().toString(),
        userId: user.id,
      };

      setMetrics((prev) => [...prev, metric]);
      // Select the newest entry
      setSelectedDateIndex(sortedMetrics.length);
    },
    [user.id, sortedMetrics.length],
  );

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    // In real app, this would update the user in the backend
    console.log('User updates:', updates);
  }, []);

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const getFormattedWeight = useCallback((weightKg: number) => {
    if (settings.units === 'metric') {
      return `${Math.round(weightKg * 10) / 10} kg`;
    } else {
      return `${Math.round(kgToLbs(weightKg))} lbs`;
    }
  }, [settings.units]);

  const getFormattedHeight = useCallback((heightCm: number) => {
    if (settings.units === 'metric') {
      return `${heightCm} cm`;
    } else {
      return cmToFeet(heightCm);
    }
  }, [settings.units]);

  const getUserAge = useCallback(() => {
    const today = new Date();
    const birthDate = new Date(user.birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }, [user.birthday]);

  return {
    user,
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
    utils: {
      lbsToKg,
      kgToLbs,
      cmToFeet,
      cmToInches,
    },
  };
}