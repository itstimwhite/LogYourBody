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

export function LogEntryModal({ open, onOpenChange, onSave, units }: LogEntryModalProps) {
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
      <DialogContent className="bg-background border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground tracking-tight">
            Log New Measurement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Weight Input */}
          <div className="space-y-3">
            <Label htmlFor="weight" className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Weight ({units === 'metric' ? 'kg' : 'lbs'})
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
                {Object.entries(MEASUREMENT_METHODS).map(([key, label]) => (
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