import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://przjeunffnkjzxpykvjn.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByempldW5mZm5ranp4cHlrdmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTI1NDYsImV4cCI6MjA2NDk4ODU0Nn0.jZyohfzoydZKaSH_q0Tu4VqEbyFDdf-8i0kSm-YzB8w";

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create client only if configured, otherwise create a mock client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          gender: "male" | "female";
          birthday: string;
          height: number;
          profile_image_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          gender: "male" | "female";
          birthday: string;
          height: number;
          profile_image_url?: string;
        };
        Update: {
          email?: string;
          name?: string;
          gender?: "male" | "female";
          birthday?: string;
          height?: number;
          profile_image_url?: string;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          user_id: string;
          units: "imperial" | "metric";
          health_kit_sync_enabled: boolean;
          google_fit_sync_enabled: boolean;
          notifications_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          units?: "imperial" | "metric";
          health_kit_sync_enabled?: boolean;
          google_fit_sync_enabled?: boolean;
          notifications_enabled?: boolean;
        };
        Update: {
          units?: "imperial" | "metric";
          health_kit_sync_enabled?: boolean;
          google_fit_sync_enabled?: boolean;
          notifications_enabled?: boolean;
          updated_at?: string;
        };
      };
      body_metrics: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          weight: number;
          body_fat_percentage: number;
          method: "dexa" | "scale" | "calipers" | "visual";
          created_at: string;
        };
        Insert: {
          user_id: string;
          date: string;
          weight: number;
          body_fat_percentage: number;
          method: "dexa" | "scale" | "calipers" | "visual";
        };
        Update: {
          date?: string;
          weight?: number;
          body_fat_percentage?: number;
          method?: "dexa" | "scale" | "calipers" | "visual";
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          status: "trial" | "active" | "expired" | "cancelled";
          trial_start_date?: string;
          trial_end_date?: string;
          subscription_start_date?: string;
          subscription_end_date?: string;
          product_id?: string;
          revenue_cat_user_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          status?: "trial" | "active" | "expired" | "cancelled";
          trial_start_date?: string;
          trial_end_date?: string;
          subscription_start_date?: string;
          subscription_end_date?: string;
          product_id?: string;
          revenue_cat_user_id?: string;
        };
        Update: {
          status?: "trial" | "active" | "expired" | "cancelled";
          trial_start_date?: string;
          trial_end_date?: string;
          subscription_start_date?: string;
          subscription_end_date?: string;
          product_id?: string;
          revenue_cat_user_id?: string;
          updated_at?: string;
        };
      };
    };
  };
}
