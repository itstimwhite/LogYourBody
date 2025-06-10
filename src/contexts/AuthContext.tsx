import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { checkDatabaseStatus, logDatabaseStatus } from "@/lib/database-check";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signInWithApple: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  startTrial: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthContext initialization - isSupabaseConfigured:", isSupabaseConfigured);
    console.log("AuthContext initialization - supabase client:", !!supabase);
    
    if (!isSupabaseConfigured || !supabase) {
      console.warn("Supabase not configured - authentication disabled");
      setLoading(false);
      return;
    }

    // Check database status on initialization
    checkDatabaseStatus().then(logDatabaseStatus);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log("Auth state change:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === "SIGNED_IN" && session?.user) {
          console.log("User signed in, creating profile...");
          // Create or update user profile
          try {
            await createUserProfile(session.user);
            console.log("Profile creation completed");
            
            // Sync email subscriptions
            await syncEmailSubscriptions(session.user);
          } catch (error) {
            console.error("Profile creation failed:", error);
          }
        }
      } catch (error) {
        console.error("Error in auth state change handler:", error);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncEmailSubscriptions = async (user: User) => {
    if (!isSupabaseConfigured || !supabase || !user.email) {
      console.log("Skipping email subscription sync");
      return;
    }

    try {
      console.log("Syncing email subscriptions for:", user.email);
      
      const { error } = await supabase
        .from('email_subscriptions')
        .update({ 
          user_id: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('email', user.email.toLowerCase())
        .is('user_id', null);

      if (error) {
        console.error("Error syncing email subscriptions:", error);
      } else {
        console.log("Email subscriptions synced successfully");
      }
    } catch (err) {
      console.error("Failed to sync email subscriptions:", err);
    }
  };

  const createUserProfile = async (user: User) => {
    if (!isSupabaseConfigured || !supabase) {
      console.log("Supabase not configured, skipping profile creation");
      return;
    }

    console.log("Creating profile for user:", user.id, user.email);

    try {
      // Check if profile exists
      console.log("Checking for existing profile...");
      const { data: existingProfile, error: selectError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error("Error checking profile:", selectError);
        return;
      }

      if (!existingProfile) {
        console.log("Creating new profile...");
        // Create minimal profile that will trigger ProfileSetup
        const { error: profileError } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name || user.email?.split("@")[0] || "",
          // Don't set default values - let ProfileGuard handle the setup
        });

        if (profileError) {
          console.error("Error creating profile:", profileError);
          // Check if it's a missing table error (migrations not applied)
          if (profileError.message.includes('relation "profiles" does not exist')) {
            console.error("MIGRATION ERROR: profiles table does not exist. Please run database migrations.");
          }
        } else {
          console.log("Profile created successfully");
        }

        // Create default settings
        const { error: settingsError } = await supabase
          .from("user_settings")
          .insert({
            user_id: user.id,
            units: "imperial",
            health_kit_sync_enabled: false,
            google_fit_sync_enabled: false,
            notifications_enabled: false,
          });

        if (settingsError) {
          console.error("Error creating settings:", settingsError);
        }
      }
    } catch (error) {
      console.error("Error in createUserProfile:", error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        error: { 
          message: "Authentication service not available",
          name: "AuthError",
          status: 500 
        } as any 
      };
    }

    console.log("Attempting Supabase sign in with email:", email);
    
    // Check network connectivity first
    if (!navigator.onLine) {
      return {
        error: {
          message: "No internet connection. Please check your network and try again.",
          name: "NetworkError",
          status: 0
        } as any
      };
    }
    
    try {
      console.log("Starting Supabase auth request...");
      
      // Try the auth request without timeout first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log("Auth request completed:", { data: !!data, error: !!error });
      
      if (error) {
        console.error("Supabase sign in error:", error);
        
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          return {
            error: {
              message: "Invalid email or password. Please check your credentials and try again.",
              name: "InvalidCredentials",
              status: 401
            } as any
          };
        }
        
        if (error.message.includes('Email not confirmed')) {
          return {
            error: {
              message: "Please check your email and click the confirmation link before signing in.",
              name: "EmailNotConfirmed",
              status: 401
            } as any
          };
        }
      } else {
        console.log("Supabase sign in successful:", data);
      }
      
      return { error };
    } catch (networkError: any) {
      console.error("Network or other error during sign in:", networkError);
      
      // Check if it's a network-related error
      if (networkError.name === 'TypeError' && networkError.message.includes('fetch')) {
        return {
          error: {
            message: "Network error. Please check your connection and try again.",
            name: "NetworkError",
            status: 0
          } as any
        };
      }
      
      return {
        error: {
          message: "An unexpected error occurred. Please try again.",
          name: "UnknownError",
          status: 500
        } as any
      };
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string,
  ) => {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        error: { 
          message: "Authentication service not available",
          name: "AuthError",
          status: 500 
        } as any 
      };
    }

    console.log("Attempting Supabase sign up with email:", email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    
    if (error) {
      console.error("Supabase sign up error:", error);
    } else {
      console.log("Supabase sign up successful:", data);
    }
    
    return { error };
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        error: { 
          message: "Authentication service not available",
          name: "AuthError",
          status: 500 
        } as any 
      };
    }

    const redirectUrl = `${window.location.origin}/dashboard`;
    console.log("Google OAuth redirect URL:", redirectUrl);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
    return { error };
  };

  const signInWithApple = async () => {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        error: { 
          message: "Authentication service not available",
          name: "AuthError",
          status: 500 
        } as any 
      };
    }

    // Check if running in native iOS app
    const isNative = window.location.protocol === 'capacitor:';
    const redirectUrl = isNative 
      ? 'logyourbody://auth/callback'  // Native app custom scheme
      : `${window.location.origin}/`; // Web app - redirect to home to avoid loop
    
    console.log("Apple OAuth redirect URL:", redirectUrl, "isNative:", isNative);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: redirectUrl,
      },
    });
    return { error };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        error: { 
          message: "Authentication service not available",
          name: "AuthError",
          status: 500 
        } as any 
      };
    }

    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const startTrial = async () => {
    if (!user) return;

    if (!isSupabaseConfigured || !supabase) {
      console.warn("Cannot start trial - authentication service not available");
      return;
    }

    try {
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

      const { error } = await supabase.from("subscriptions").upsert({
        user_id: user.id,
        status: "trial",
        trial_start_date: now.toISOString(),
        trial_end_date: trialEnd.toISOString(),
      });

      if (error) {
        console.error("Error starting trial:", error);
      }
    } catch (error) {
      console.error("Error in startTrial:", error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    signOut,
    startTrial,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
