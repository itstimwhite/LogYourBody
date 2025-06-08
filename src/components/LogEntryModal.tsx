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

interface LogEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    weight: number;
    bodyFatPercentage: number;
    method: MeasurementMethod;
    date: Date;
  }) => void;
}

export function LogEntryModal({
  open,
  onOpenChange,
  onSave,
}: LogEntryModalProps) {
  const [weight, setWeight] = useState<string>("");
  const [bodyFatPercentage, setBodyFatPercentage] = useState<number[]>([15]);
  const [method, setMethod] = useState<MeasurementMethod>("scale");

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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-black border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Log New Measurement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Weight Input */}
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-white/80">
              Weight (lbs)
            </Label>
            <Input
              id="weight"
              type="number"
              placeholder="Enter weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          {/* Body Fat Percentage Slider */}
          <div className="space-y-3">
            <Label className="text-white/80">
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
            <div className="flex justify-between text-xs text-white/40">
              <span>3%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Measurement Method */}
          <div className="space-y-2">
            <Label className="text-white/80">Method</Label>
            <Select
              value={method}
              onValueChange={(value: MeasurementMethod) => setMethod(value)}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/20">
                {Object.entries(MEASUREMENT_METHODS).map(([key, label]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className="text-white hover:bg-white/10"
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
            className="w-full bg-white text-black hover:bg-white/90 font-semibold"
            disabled={!weight || parseFloat(weight) <= 0}
          >
            Save Measurement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
