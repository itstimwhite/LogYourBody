// Weight logging analytics events
export interface WeightAnalyticsEvents {
  log_weight_started: {
    source: 'dashboard_plus_button' | 'quick_action' | 'widget';
    has_previous_data: boolean;
    user_units: 'imperial' | 'metric';
  };
  
  step_completed: {
    step_number: 1 | 2 | 3 | 4;
    step_name: 'weight' | 'body_fat' | 'method' | 'review';
    time_spent_seconds: number;
    interaction_type: 'tap' | 'keyboard' | 'preset' | 'slider' | 'healthkit';
    value?: string | number;
  };
  
  weight_input_method: {
    method: 'manual_typing' | 'preset_chip' | 'healthkit_import';
    unit_toggle_used: boolean;
    precision_decimals: number;
  };
  
  body_fat_input_method: {
    method: 'slider_drag' | 'preset_chip' | 'tap_labels';
    final_value: number;
    snapped_to_increment: boolean;
  };
  
  measurement_saved: {
    weight_lbs: number;
    weight_kg: number;
    body_fat_percentage: number;
    method: string;
    total_flow_time_seconds: number;
    steps_back_navigated: number;
    used_healthkit: boolean;
    used_presets: boolean;
  };
  
  validation_error: {
    step_name: string;
    field: string;
    error_message: string;
    user_input: string | number;
  };
  
  accessibility_interaction: {
    feature: 'voiceover' | 'reduced_motion' | 'high_contrast';
    step_name: string;
    success: boolean;
  };
}

export type AnalyticsEventName = keyof WeightAnalyticsEvents;

class WeightAnalytics {
  private startTime: number | null = null;
  private stepStartTimes: Record<number, number> = {};
  private backNavigationCount = 0;
  private usedHealthKit = false;
  private usedPresets = false;

  // Initialize tracking
  startFlow(params: WeightAnalyticsEvents['log_weight_started']) {
    this.startTime = Date.now();
    this.stepStartTimes = {};
    this.backNavigationCount = 0;
    this.usedHealthKit = false;
    this.usedPresets = false;
    
    this.track('log_weight_started', params);
  }

  // Track step completion
  completeStep(params: Omit<WeightAnalyticsEvents['step_completed'], 'time_spent_seconds'>) {
    const stepStartTime = this.stepStartTimes[params.step_number];
    const timeSpent = stepStartTime ? (Date.now() - stepStartTime) / 1000 : 0;
    
    this.track('step_completed', {
      ...params,
      time_spent_seconds: Math.round(timeSpent * 10) / 10, // Round to 1 decimal
    });
    
    // Track preset usage
    if (params.interaction_type === 'preset') {
      this.usedPresets = true;
    }
    
    // Track HealthKit usage
    if (params.interaction_type === 'healthkit') {
      this.usedHealthKit = true;
    }
  }

  // Track step start (for timing)
  startStep(stepNumber: number) {
    this.stepStartTimes[stepNumber] = Date.now();
  }

  // Track back navigation
  navigateBack() {
    this.backNavigationCount++;
  }

  // Track input methods
  trackWeightInput(params: WeightAnalyticsEvents['weight_input_method']) {
    this.track('weight_input_method', params);
  }

  trackBodyFatInput(params: WeightAnalyticsEvents['body_fat_input_method']) {
    this.track('body_fat_input_method', params);
  }

  // Track final save
  trackSave(params: Omit<WeightAnalyticsEvents['measurement_saved'], 'total_flow_time_seconds' | 'steps_back_navigated' | 'used_healthkit' | 'used_presets'>) {
    const totalTime = this.startTime ? (Date.now() - this.startTime) / 1000 : 0;
    
    this.track('measurement_saved', {
      ...params,
      total_flow_time_seconds: Math.round(totalTime * 10) / 10,
      steps_back_navigated: this.backNavigationCount,
      used_healthkit: this.usedHealthKit,
      used_presets: this.usedPresets,
    });
  }

  // Track validation errors
  trackValidationError(params: WeightAnalyticsEvents['validation_error']) {
    this.track('validation_error', params);
  }

  // Track accessibility interactions
  trackAccessibility(params: WeightAnalyticsEvents['accessibility_interaction']) {
    this.track('accessibility_interaction', params);
  }

  // Generic track method - replace with your analytics provider
  private track<T extends AnalyticsEventName>(
    eventName: T,
    params: WeightAnalyticsEvents[T]
  ) {
    // For now, just console.log - replace with Amplitude, Mixpanel, etc.
    console.log(`[Analytics] ${eventName}:`, params);
    
    // Example integration with Amplitude:
    // if (typeof amplitude !== 'undefined') {
    //   amplitude.track(eventName, params);
    // }
    
    // Example integration with gtag:
    // if (typeof gtag !== 'undefined') {
    //   gtag('event', eventName, params);
    // }
  }
}

// Export singleton instance
export const weightAnalytics = new WeightAnalytics();

// Utility functions for common analytics patterns
export const analyticsUtils = {
  // Detect interaction type based on event
  getInteractionType: (event: React.MouseEvent | React.KeyboardEvent | React.TouchEvent): 'tap' | 'keyboard' => {
    if (event.type === 'keydown' || event.type === 'keyup') {
      return 'keyboard';
    }
    return 'tap';
  },
  
  // Get precision from number
  getPrecision: (value: number): number => {
    const str = value.toString();
    const decimalIndex = str.indexOf('.');
    return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
  },
  
  // Check if value was snapped
  wasSnappedToIncrement: (original: number, final: number, increment: number): boolean => {
    const expectedSnapped = Math.round(original / increment) * increment;
    return Math.abs(final - expectedSnapped) < 0.001; // Account for floating point precision
  },
};