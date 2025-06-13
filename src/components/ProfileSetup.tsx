import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User, Ruler, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileSetupProps {
  onComplete: () => void;
  healthKitData?: {
    height?: number;
    dateOfBirth?: Date;
    biologicalSex?: 'male' | 'female' | 'other';
  };
}

interface FormData {
  name: string;
  email: string;
  gender: string;
  birthMonth: string;
  birthDay: string;
  birthYear: string;
  heightFeet: string;
  heightInches: string;
  heightCm: string;
  units: "imperial" | "metric";
}

export function ProfileSetup({ onComplete, healthKitData }: ProfileSetupProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Initialize form data with HealthKit data if available
  const [formData, setFormData] = useState<FormData>(() => {
    const defaultHeight = healthKitData?.height || 170; // cm
    const defaultBirthDate = healthKitData?.dateOfBirth || new Date();
    
    return {
      name: user?.user_metadata?.name || user?.email?.split("@")[0] || "",
      email: user?.email || "",
      gender: healthKitData?.biologicalSex || "",
      birthMonth: (defaultBirthDate.getMonth() + 1).toString().padStart(2, '0'),
      birthDay: defaultBirthDate.getDate().toString().padStart(2, '0'),
      birthYear: defaultBirthDate.getFullYear().toString(),
      heightFeet: Math.floor(defaultHeight / 30.48).toString(),
      heightInches: Math.round((defaultHeight / 2.54) % 12).toString(),
      heightCm: Math.round(defaultHeight).toString(),
      units: "imperial" as "imperial" | "metric",
    };
  });

  // Steps configuration - only show steps for data we need
  const steps = [
    // Always show name step unless we have it from auth
    ...((!user?.user_metadata?.name && !formData.name.trim()) ? [{
      id: 'name',
      title: 'What\'s your name?',
      description: 'This helps us personalize your experience',
      icon: User,
    }] : []),
    
    // Only show gender if we don't have it from HealthKit
    ...(!healthKitData?.biologicalSex ? [{
      id: 'gender',
      title: 'What\'s your gender?',
      description: 'This helps us calculate accurate body composition metrics',
      icon: User,
    }] : []),
    
    // Only show birthday if we don't have it from HealthKit
    ...(!healthKitData?.dateOfBirth ? [{
      id: 'birthday',
      title: 'When were you born?',
      description: 'We use this to calculate age-adjusted metrics',
      icon: Calendar,
    }] : []),
    
    // Always show units preference
    {
      id: 'units',
      title: 'Measurement preference',
      description: 'Choose your preferred units for tracking',
      icon: Ruler,
    },
    
    // Only show height if we don't have it from HealthKit
    ...(!healthKitData?.height ? [{
      id: 'height',
      title: 'How tall are you?',
      description: 'This is essential for accurate body composition calculations',
      icon: Ruler,
    }] : []),
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      // Calculate height in cm
      let heightInCm: number;
      if (formData.units === "imperial") {
        const feet = parseInt(formData.heightFeet) || 0;
        const inches = parseInt(formData.heightInches) || 0;
        heightInCm = (feet * 12 + inches) * 2.54;
      } else {
        heightInCm = parseInt(formData.heightCm) || 0;
      }

      // Construct birthday from individual fields or use HealthKit data
      let birthday: string;
      if (healthKitData?.dateOfBirth) {
        birthday = healthKitData.dateOfBirth.toISOString().split('T')[0];
      } else {
        birthday = `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`;
      }

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: formData.email || user.email || "",
          name: formData.name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User",
          gender: (healthKitData?.biologicalSex || formData.gender) as "male" | "female",
          birthday,
          height: Math.round(heightInCm),
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // Create/update user settings
      const { error: settingsError } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          units: formData.units,
          health_kit_sync_enabled: !!healthKitData,
          google_fit_sync_enabled: false,
          notifications_enabled: true,
          updated_at: new Date().toISOString(),
        });

      if (settingsError) throw settingsError;

      onComplete();
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  // Skip setup if we have all required data
  useEffect(() => {
    if (steps.length === 0) {
      handleSubmit();
    }
  }, []);

  if (steps.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 100;
  const maxYear = currentYear - 13; // Minimum age 13

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'name':
        return (
          <div className="space-y-4">
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              className="text-center text-xl h-14 border-2 rounded-2xl bg-secondary/20"
              autoFocus
            />
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com (optional)"
              className="text-center text-lg h-12"
              autoFocus
            />
            <p className="text-sm text-muted-foreground text-center">
              This is optional. You can add it later in Settings.
            </p>
          </div>
        );

      case 'gender':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={formData.gender === 'male' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, gender: 'male' })}
                className="h-16 text-lg rounded-2xl border-2"
              >
                Male
              </Button>
              <Button
                type="button"
                variant={formData.gender === 'female' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, gender: 'female' })}
                className="h-16 text-lg rounded-2xl border-2"
              >
                Female
              </Button>
            </div>
          </div>
        );

      case 'birthday':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Month</Label>
                <Select 
                  value={formData.birthMonth} 
                  onValueChange={(value) => setFormData({ ...formData, birthMonth: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                        {new Date(2000, i).toLocaleDateString('en', { month: 'short' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Day</Label>
                <Select 
                  value={formData.birthDay} 
                  onValueChange={(value) => setFormData({ ...formData, birthDay: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Year</Label>
                <Select 
                  value={formData.birthYear} 
                  onValueChange={(value) => setFormData({ ...formData, birthYear: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
                      const year = maxYear - i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'units':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={formData.units === 'imperial' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, units: 'imperial' })}
                className="h-20 flex flex-col gap-1 rounded-2xl border-2"
              >
                <span className="font-semibold">Imperial</span>
                <span className="text-sm opacity-80">lbs, ft/in</span>
              </Button>
              <Button
                type="button"
                variant={formData.units === 'metric' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, units: 'metric' })}
                className="h-20 flex flex-col gap-1 rounded-2xl border-2"
              >
                <span className="font-semibold">Metric</span>
                <span className="text-sm opacity-80">kg, cm</span>
              </Button>
            </div>
          </div>
        );

      case 'height':
        return (
          <div className="space-y-4">
            {formData.units === 'imperial' ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Feet</Label>
                  <Select 
                    value={formData.heightFeet} 
                    onValueChange={(value) => setFormData({ ...formData, heightFeet: value })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 6 }, (_, i) => (
                        <SelectItem key={i + 3} value={(i + 3).toString()}>
                          {i + 3} ft
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Inches</Label>
                  <Select 
                    value={formData.heightInches} 
                    onValueChange={(value) => setFormData({ ...formData, heightInches: value })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i} in
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  type="number"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                  placeholder="Height in cm"
                  className="text-center text-xl h-14 border-2 rounded-2xl bg-secondary/20"
                  min="90"
                  max="250"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground text-center">
                  Enter your height in centimeters
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStepData.id) {
      case 'name':
        return formData.name.trim().length > 0;
      case 'email':
        return true; // Email is optional for SMS users
      case 'gender':
        return formData.gender !== '';
      case 'birthday':
        return formData.birthMonth && formData.birthDay && formData.birthYear;
      case 'units':
        return true; // Always has a default value
      case 'height':
        if (formData.units === 'imperial') {
          return formData.heightFeet && formData.heightInches !== '';
        } else {
          return formData.heightCm && parseInt(formData.heightCm) > 0;
        }
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 safe-area-inset">
      <div className="flex-1 flex flex-col justify-center">
        <div className="w-full bg-background">
        <div className="text-center space-y-6 mb-8">
          {/* Progress Indicator */}
          <div className="flex justify-center space-x-3">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index < currentStep 
                    ? 'bg-primary scale-110' 
                    : index === currentStep 
                      ? 'bg-primary' 
                      : 'bg-muted/40'
                }`}
              />
            ))}
          </div>

          {/* Step Icon */}
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center">
            <currentStepData.icon className="w-10 h-10 text-primary" />
          </div>

          {/* Step Title */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {currentStepData.title}
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">
              {currentStepData.description}
            </p>
          </div>
        </div>

        <div className="space-y-8 mb-8">
          {error && (
            <div className="text-destructive text-sm text-center p-4 bg-destructive/10 rounded-2xl">
              {error}
            </div>
          )}

          {renderStepContent()}
        </div>
        
        </div>
      </div>

      {/* Fixed Navigation at Bottom */}
      <div className="space-y-4 pb-safe">
        {/* HealthKit Data Notice */}
        {healthKitData && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Some info pre-filled from Apple Health
            </p>
          </div>
        )}
        
        <div className="flex gap-4">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-14 border-2 rounded-2xl"
              disabled={loading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className="flex-1 h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                Saving...
              </div>
            ) : isLastStep ? (
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Complete
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Continue
                <ChevronRight className="w-4 h-4" />
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}