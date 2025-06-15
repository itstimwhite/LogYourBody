import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { MeasurementMethod, MEASUREMENT_METHODS } from "@/types/bodymetrics";
import { useHealthKit } from "@/hooks/use-healthkit";
import { isNativeiOS } from "@/lib/platform";
import { Activity, Loader2 } from "lucide-react";

interface LogEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    weight: number;
    bodyFatPercentage: number;
    method: MeasurementMethod;
    date: Date;
  }) => void;
  units: "imperial" | "metric";
}

export function LogEntryModal({
  open,
  onOpenChange,
  onSave,
  units,
}: LogEntryModalProps) {
  const [weight, setWeight] = useState<string>("");
  const [bodyFatPercentage, setBodyFatPercentage] = useState<number[]>([15]);
  const [method, setMethod] = useState<MeasurementMethod>("scale");
  const [syncingHealthKit, setSyncingHealthKit] = useState(false);

  const healthKit = useHealthKit();

  const handleSave = () => {
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      return; // Add proper validation in real app
    }

    onSave({
      weight: weightNum,
      bodyFatPercentage: bodyFatPercentage[0],
      method,
      date: new Date(),
    });

    // Reset form
    setWeight("");
    setBodyFatPercentage([15]);
    setMethod("scale");
    onOpenChange(false);
  };

  const handleClose = () => {
    // Reset form on close
    setWeight("");
    setBodyFatPercentage([15]);
    setMethod("scale");
    onOpenChange(false);
  };

  const handleHealthKitImport = async () => {
    if (!isNativeiOS() || !healthKit.isAvailable) {
      return;
    }

    setSyncingHealthKit(true);
    try {
      // Request permissions if not already authorized
      if (!healthKit.isAuthorized) {
        const granted = await healthKit.requestPermissions();
        if (!granted) {
          console.warn("HealthKit permissions not granted");
          return;
        }
      }

      // Get the latest weight data from HealthKit
      const healthData = await healthKit.getHealthData();
      if (healthData && healthData.weight) {
        // Convert weight to the appropriate units for display
        let displayWeight = healthData.weight;
        if (units === "imperial") {
          displayWeight = Math.round(healthData.weight * 2.20462 * 10) / 10; // kg to lbs
        }

        // Import data and immediately save with HealthKit method
        onSave({
          weight: healthData.weight, // Always save as kg internally
          bodyFatPercentage: bodyFatPercentage[0],
          method: "healthkit", // Automatically set method
          date: new Date(),
        });

        // Reset form and close modal
        setWeight("");
        setBodyFatPercentage([15]);
        setMethod("scale");
        onOpenChange(false);

        console.log(
          "HealthKit data imported:",
          displayWeight,
          units === "imperial" ? "lbs" : "kg",
        );
      } else {
        console.warn("No weight data found in HealthKit");
      }
    } catch (error) {
      console.error("Error importing HealthKit data:", error);
    } finally {
      setSyncingHealthKit(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md border-border bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
            Log New Measurement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* HealthKit Import Section - only show on iOS with HealthKit */}
          {isNativeiOS() && healthKit.isAvailable && (
            <div className="space-y-3">
              <Label className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Import from HealthKit
              </Label>
              <Button
                type="button"
                variant="outline"
                onClick={handleHealthKitImport}
                disabled={syncingHealthKit}
                className="h-12 w-full border-border bg-secondary text-foreground hover:bg-muted"
              >
                {syncingHealthKit ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing from HealthKit...
                  </>
                ) : (
                  <>
                    <Activity className="mr-2 h-4 w-4" />
                    Import from HealthKit
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or enter manually
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Manual Weight Input */}
          <div className="space-y-3">
            <Label
              htmlFor="weight"
              className="text-sm font-medium uppercase tracking-wide text-muted-foreground"
            >
              Weight ({units === "metric" ? "kg" : "lbs"})
            </Label>
            <Input
              id="weight"
              type="number"
              placeholder="Enter weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-12 border-border bg-secondary text-base text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Body Fat Percentage Slider */}
          <div className="space-y-4">
            <Label className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Body Fat: {bodyFatPercentage[0].toFixed(1)}%
            </Label>
            <Slider
              value={bodyFatPercentage}
              onValueChange={setBodyFatPercentage}
              max={50}
              min={3}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>3%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Measurement Method */}
          <div className="space-y-3">
            <Label className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Method
            </Label>
            <Select
              value={method}
              onValueChange={(value: MeasurementMethod) => setMethod(value)}
            >
              <SelectTrigger className="h-12 border-border bg-secondary text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-background">
                {Object.entries(MEASUREMENT_METHODS)
                  .filter(([key]) => key !== "healthkit") // Exclude HealthKit from user selection
                  .map(([key, label]) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="text-foreground hover:bg-muted"
                    >
                      {label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button
            onClick={handleSave}
            className="h-12 w-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
            disabled={!weight || parseFloat(weight) <= 0}
          >
            Save Measurement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
