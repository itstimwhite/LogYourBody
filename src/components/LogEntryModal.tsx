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
          console.warn('HealthKit permissions not granted');
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
        
        console.log('HealthKit data imported:', displayWeight, units === "imperial" ? "lbs" : "kg");
      } else {
        console.warn('No weight data found in HealthKit');
      }
    } catch (error) {
      console.error('Error importing HealthKit data:', error);
    } finally {
      setSyncingHealthKit(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-background border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground tracking-tight">
            Log New Measurement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* HealthKit Import Section - only show on iOS with HealthKit */}
          {isNativeiOS() && healthKit.isAvailable && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Import from HealthKit
              </Label>
              <Button
                type="button"
                variant="outline"
                onClick={handleHealthKitImport}
                disabled={syncingHealthKit}
                className="w-full bg-secondary border-border text-foreground hover:bg-muted h-12"
              >
                {syncingHealthKit ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing from HealthKit...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 mr-2" />
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
              className="text-sm font-medium text-muted-foreground uppercase tracking-wide"
            >
              Weight ({units === "metric" ? "kg" : "lbs"})
            </Label>
            <Input
              id="weight"
              type="number"
              placeholder="Enter weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12 text-base"
            />
          </div>

          {/* Body Fat Percentage Slider */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
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
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>3%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Measurement Method */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Method
            </Label>
            <Select
              value={method}
              onValueChange={(value: MeasurementMethod) => setMethod(value)}
            >
              <SelectTrigger className="bg-secondary border-border text-foreground h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
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
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12 text-base"
            disabled={!weight || parseFloat(weight) <= 0}
          >
            Save Measurement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
