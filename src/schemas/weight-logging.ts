import { z } from "zod";

// Weight validation schema
export const weightSchema = z.object({
  value: z
    .number()
    .min(30, "Weight must be at least 30 lbs (13.6 kg)")
    .max(700, "Weight must be less than 700 lbs (317.5 kg)")
    .refine((val) => {
      // Check if value has more than 1 decimal place
      const str = val.toString();
      const decimalIndex = str.indexOf(".");
      if (decimalIndex === -1) return true; // No decimal
      return str.length - decimalIndex - 1 <= 1; // Max 1 decimal place
    }, "Weight can have at most 1 decimal place"),
  unit: z.enum(["lbs", "kg"]),
});

// Body fat percentage validation schema
export const bodyFatSchema = z.object({
  value: z
    .number()
    .min(4, "Body fat below 4% is dangerously low. Please verify your measurement or seek medical supervision.")
    .max(50, "Body fat percentage must be less than 50%")
    .refine((val) => {
      // Snap to 0.5% increments
      return (val * 2) % 1 === 0;
    }, "Body fat percentage must be in 0.5% increments"),
});

// Measurement method validation schema
export const methodSchema = z.object({
  value: z.enum([
    "scale",
    "dexa",
    "calipers",
    "visual",
    "bioimpedance",
    "other",
  ]),
  label: z.string().min(1, "Method label is required"),
});

// Complete weight log entry schema
export const weightLogEntrySchema = z.object({
  weight: weightSchema,
  bodyFat: bodyFatSchema,
  method: methodSchema,
  date: z.date(),
  notes: z.string().optional(),
});

// Types derived from schemas
export type WeightData = z.infer<typeof weightSchema>;
export type BodyFatData = z.infer<typeof bodyFatSchema>;
export type MethodData = z.infer<typeof methodSchema>;
export type WeightLogEntry = z.infer<typeof weightLogEntrySchema>;

// Utility functions for weight conversion
export const weightUtils = {
  lbsToKg: (lbs: number): number => Number((lbs / 2.20462).toFixed(1)),
  kgToLbs: (kg: number): number => Number((kg * 2.20462).toFixed(1)),

  clampPrecision: (value: number, decimals: number = 1): number => {
    return Number(value.toFixed(decimals));
  },

  snapToIncrement: (value: number, increment: number): number => {
    return Math.round(value / increment) * increment;
  },

  convertWeight: (weight: WeightData, targetUnit: "lbs" | "kg"): WeightData => {
    if (weight.unit === targetUnit) return weight;

    const convertedValue =
      targetUnit === "kg"
        ? weightUtils.lbsToKg(weight.value)
        : weightUtils.kgToLbs(weight.value);

    return {
      value: weightUtils.clampPrecision(convertedValue, 1),
      unit: targetUnit,
    };
  },

  getWeightPresets: (unit: "lbs" | "kg"): number[] => {
    return unit === "lbs" ? [140, 160, 180, 200, 220] : [60, 70, 80, 90, 100];
  },

  getWeightHelper: (weight: WeightData): string => {
    const converted = weightUtils.convertWeight(
      weight,
      weight.unit === "lbs" ? "kg" : "lbs",
    );
    return `≈ ${converted.value} ${converted.unit}`;
  },
};

// Body fat utility functions
export const bodyFatUtils = {
  snapToHalf: (value: number): number => {
    return Math.round(value * 2) / 2;
  },

  getPresets: (): Array<{
    label: string;
    value: number;
    description: string;
  }> => [
    { label: "Essential", value: 8, description: "Athlete" },
    { label: "Athletic", value: 15, description: "Fit" },
    { label: "Fitness", value: 22, description: "Average" },
    { label: "Acceptable", value: 30, description: "High" },
  ],

  getCategoryForValue: (value: number): string => {
    if (value < 4) return "⚠️ Dangerously Low";
    if (value <= 6) return "Essential Fat Only";
    if (value <= 10) return "Athletic";
    if (value <= 18) return "Fitness";
    if (value <= 25) return "Acceptable";
    return "Above Average";
  },

  isHealthyRange: (value: number): boolean => {
    // Men: 6-24% is healthy, Women: 14-31% is healthy
    // We'll use the more conservative range
    return value >= 6 && value <= 31;
  },

  getHealthWarning: (value: number): string | null => {
    if (value < 4) {
      return "Body fat below 4% is extremely dangerous and can cause organ failure. Please seek immediate medical supervision.";
    }
    if (value < 6) {
      return "Body fat below 6% is at essential levels only. This may impact hormone production and immune function.";
    }
    return null;
  },
};
