import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Scale, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeightPromptProps {
  onComplete: (data: {
    weight: number;
    bodyFatPercentage: number;
    method: string;
    date: Date;
  }) => void;
  units: "imperial" | "metric";
  className?: string;
}

export const WeightPrompt = React.memo(function WeightPrompt({
  onComplete,
  units,
  className,
}: WeightPromptProps) {
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [method, setMethod] = useState("scale");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ weight?: string; bodyFat?: string }>(
    {},
  );

  const validateInputs = () => {
    const newErrors: { weight?: string; bodyFat?: string } = {};

    const weightNum = parseFloat(weight);
    const bodyFatNum = parseFloat(bodyFat);

    // Weight validation
    if (!weight || isNaN(weightNum) || weightNum <= 0) {
      newErrors.weight = "Please enter a valid weight";
    } else if (units === "imperial" && (weightNum < 50 || weightNum > 1000)) {
      newErrors.weight = "Weight must be between 50-1000 lbs";
    } else if (units === "metric" && (weightNum < 20 || weightNum > 500)) {
      newErrors.weight = "Weight must be between 20-500 kg";
    }

    // Body fat validation
    if (!bodyFat || isNaN(bodyFatNum) || bodyFatNum < 1 || bodyFatNum > 60) {
      newErrors.bodyFat = "Body fat must be between 1-60%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      onComplete({
        weight: parseFloat(weight),
        bodyFatPercentage: parseFloat(bodyFat),
        method,
        date: new Date(),
      });
    } catch (error) {
      console.error("Error saving initial weight:", error);
    } finally {
      setLoading(false);
    }
  };

  const weightUnit = units === "imperial" ? "lbs" : "kg";
  const weightPlaceholder = units === "imperial" ? "e.g., 150" : "e.g., 70";

  return (
    <div className={cn("mx-auto w-full max-w-2xl", className)}>
      <Card className="border-border bg-background">
        <CardHeader className="pb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Scale className="h-8 w-8 text-primary" />
          </div>

          <CardTitle className="text-2xl font-bold text-foreground">
            Let's get started!
          </CardTitle>

          <CardDescription className="mx-auto max-w-md text-base text-muted-foreground">
            To begin tracking your body composition journey, we need your
            current measurements
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Weight Input */}
            <div className="space-y-2">
              <Label
                htmlFor="weight"
                className="flex items-center gap-2 text-base font-medium"
              >
                <Scale className="h-4 w-4 text-primary" />
                Current Weight ({weightUnit})
              </Label>
              <Input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={weightPlaceholder}
                className={cn(
                  "h-12 text-lg",
                  errors.weight &&
                    "border-destructive focus:border-destructive",
                )}
                min={units === "imperial" ? "50" : "20"}
                max={units === "imperial" ? "1000" : "500"}
                step="0.1"
                autoFocus
              />
              {errors.weight && (
                <p className="text-sm text-destructive">{errors.weight}</p>
              )}
            </div>

            {/* Body Fat Percentage */}
            <div className="space-y-2">
              <Label
                htmlFor="bodyFat"
                className="flex items-center gap-2 text-base font-medium"
              >
                <Target className="h-4 w-4 text-primary" />
                Body Fat Percentage
              </Label>
              <div className="relative">
                <Input
                  id="bodyFat"
                  type="number"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  placeholder="e.g., 15"
                  className={cn(
                    "h-12 pr-12 text-lg",
                    errors.bodyFat &&
                      "border-destructive focus:border-destructive",
                  )}
                  min="1"
                  max="60"
                  step="0.1"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground">
                  %
                </span>
              </div>
              {errors.bodyFat && (
                <p className="text-sm text-destructive">{errors.bodyFat}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Don't know your body fat? Start with an estimate - you can
                update it later
              </p>
            </div>

            {/* Measurement Method */}
            <div className="space-y-2">
              <Label
                htmlFor="method"
                className="flex items-center gap-2 text-base font-medium"
              >
                <TrendingUp className="h-4 w-4 text-primary" />
                Measurement Method
              </Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scale">Smart Scale</SelectItem>
                  <SelectItem value="dexa">DEXA Scan</SelectItem>
                  <SelectItem value="bodpod">Bod Pod</SelectItem>
                  <SelectItem value="calipers">Body Fat Calipers</SelectItem>
                  <SelectItem value="visual">Visual Estimate</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="h-12 w-full text-base font-semibold"
              disabled={loading || !weight || !bodyFat}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                  Setting up your profile...
                </div>
              ) : (
                "Start Tracking"
              )}
            </Button>
          </form>

          {/* Help Text */}
          <div className="mt-6 rounded-lg bg-muted/30 p-4">
            <p className="text-center text-sm text-muted-foreground">
              <strong>Tip:</strong> Your measurements will be used to calculate
              FFMI and track progress over time. Don't worry about being precise
              - consistency is more important than accuracy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
