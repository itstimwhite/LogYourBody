import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN" && session?.user) {
        // Create or update user profile
        await createUserProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const createUserProfile = async (user: User) => {
    if (!isSupabaseConfigured || !supabase) {
      console.log("Supabase not configured, skipping profile creation");
      return;
    }

    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!existingProfile) {
        // Create minimal profile that will trigger ProfileSetup
        const { error: profileError } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name || user.email?.split("@")[0] || "",
          // Don't set default values - let ProfileGuard handle the setup
        });

        if (profileError) {
          console.error("Error creating profile:", profileError);
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Supabase sign in error:", error);
    } else {
      console.log("Supabase sign in successful:", data);
    }
    
    return { error };
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

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
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

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
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
