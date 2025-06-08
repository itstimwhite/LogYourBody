export interface UserProfile {
  id: string;
  name: string;
  email: string;
  gender: "male" | "female";
  birthday: Date;
  height: number; // in cm
  profileImage?: string;
}

export interface BodyMetrics {
  id: string;
  userId: string;
  date: Date;
  weight: number; // in kg
  bodyFatPercentage: number;
  method: MeasurementMethod;
  leanBodyMass?: number; // calculated
  ffmi?: number; // calculated
}

export type MeasurementMethod = "dexa" | "scale" | "calipers" | "visual";

export interface UserSettings {
  userId: string;
  units: "imperial" | "metric";
  healthKitSyncEnabled: boolean;
  googleFitSyncEnabled: boolean;
}

export interface DashboardMetrics {
  bodyFatPercentage: number;
  weight: number;
  ffmi: number;
  leanBodyMass: number;
  date: Date;
}

export const MEASUREMENT_METHODS: Record<MeasurementMethod, string> = {
  dexa: "DEXA Scan",
  scale: "Smart Scale",
  calipers: "Calipers",
  visual: "Visual Estimate",
};
