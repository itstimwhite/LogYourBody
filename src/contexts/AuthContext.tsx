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
    console.log(
      "AuthContext initialization - isSupabaseConfigured:",
      isSupabaseConfigured,
    );
    console.log("AuthContext initialization - supabase client:", !!supabase);
    console.log(
      "AuthContext initialization - current URL:",
      window.location.href,
    );

    if (!isSupabaseConfigured || !supabase) {
      console.warn("Supabase not configured - authentication disabled");
      setLoading(false);
      return;
    }

    // Check database status on initialization with timeout
    Promise.race([
      checkDatabaseStatus(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database check timeout")), 5000),
      ),
    ])
      .then(logDatabaseStatus)
      .catch((err) => {
        console.warn("Database status check failed or timed out:", err);
        logDatabaseStatus({
          connected: false,
          profilesTableExists: false,
          userSettingsTableExists: false,
          emailSubscriptionsTableExists: false,
          error: "Timeout or connection failed",
        });
      });

    // Get initial session with better error handling
    console.log("Getting initial session...");
    const initializeAuth = async () => {
      try {
        // Add timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Session initialization timeout")),
            3000,
          ),
        );

        const {
          data: { session },
          error,
        } = (await Promise.race([sessionPromise, timeoutPromise])) as any;

        if (error) {
          console.error("Error getting initial session:", error);
          // Clear any stale session data
          await supabase.auth.signOut();
        } else {
          console.log(
            "Initial session retrieved:",
            !!session,
            session?.user?.email,
          );
        }

        setSession(session || null);
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("Failed to get initial session:", err);
        // Clear state on error
        setSession(null);
        setUser(null);
      } finally {
        // Always set loading to false
        console.log("AuthContext: Setting loading to false");
        setLoading(false);
      }
    };

    initializeAuth();

    // Emergency fallback timeout to ensure loading is never stuck
    const emergencyTimeout = setTimeout(() => {
      console.warn(
        "AuthContext: Emergency timeout triggered - forcing loading to false",
      );
      setLoading(false);
    }, 3000); // 3 seconds to match splash timing

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log("Auth state change:", event, session?.user?.email);
        console.log("Current window location:", window.location.href);
        console.log("Session details:", session ? "exists" : "null");
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === "SIGNED_IN" && session?.user) {
          console.log("User signed in, creating profile...");
          try {
            await createUserProfile(session.user);
            await syncEmailSubscriptions(session.user);
            console.log("Profile creation and email sync completed");
          } catch (error) {
            console.error("Profile creation failed:", error);
            // Don't block login if profile creation fails
          }
        }

        // Handle sign-in errors by clearing state
        if (
          event === "SIGNED_OUT" ||
          (event === "TOKEN_REFRESHED" && !session)
        ) {
          console.log("User signed out or token refresh failed");
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error in auth state change handler:", error);
        // Ensure loading is always cleared
        setLoading(false);
        setSession(null);
        setUser(null);
      }
    });

    return () => {
      clearTimeout(emergencyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const syncEmailSubscriptions = async (user: User) => {
    // Email subscription sync removed - not needed for this app
    // The 'subscriptions' table handles trial/payment subscriptions
    return;
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

      if (selectError && selectError.code !== "PGRST116") {
        console.error("Error checking profile:", selectError);
        return;
      }

      if (!existingProfile) {
        console.log("Creating new profile...");

        // Extract name from Apple Sign In metadata or fallback to other sources
        let userName = null; // Set to null initially to trigger ProfileSetup
        if (user.user_metadata?.name) {
          userName = user.user_metadata.name;
        } else if (
          user.user_metadata?.given_name ||
          user.user_metadata?.family_name
        ) {
          // Construct name from Apple Sign In given/family names
          const firstName = user.user_metadata.given_name || "";
          const lastName = user.user_metadata.family_name || "";
          userName = `${firstName} ${lastName}`.trim() || null;
        }

        console.log("Creating profile with name:", userName);

        // Create minimal profile that will trigger ProfileSetup
        const { error: profileError } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email ?? null,
          name: userName,
          // Don't set gender, birthday, height - let ProfileGuard show ProfileSetup
        });

        if (profileError) {
          console.error("Error creating profile:", profileError);
          // Check if it's a missing table error (migrations not applied)
          if (
            profileError.message.includes('relation "profiles" does not exist')
          ) {
            console.error(
              "MIGRATION ERROR: profiles table does not exist. Please run database migrations.",
            );
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
          status: 500,
        } as any,
      };
    }

    console.log("Attempting Supabase sign in with email:", email);

    // Check network connectivity first
    if (!navigator.onLine) {
      return {
        error: {
          message:
            "No internet connection. Please check your network and try again.",
          name: "NetworkError",
          status: 0,
        } as any,
      };
    }

    try {
      console.log("Starting Supabase auth request...");

      // Add timeout to prevent hanging
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Authentication timeout")), 10000),
      );

      const { data, error } = (await Promise.race([
        authPromise,
        timeoutPromise,
      ])) as any;

      console.log("Auth request completed:", { data: !!data, error: !!error });

      if (error) {
        console.error("Supabase sign in error:", error);

        // Provide more specific error messages
        if (error.message.includes("Invalid login credentials")) {
          return {
            error: {
              message:
                "Invalid email or password. Please check your credentials and try again.",
              name: "InvalidCredentials",
              status: 401,
            } as any,
          };
        }

        if (error.message.includes("Email not confirmed")) {
          return {
            error: {
              message:
                "Please check your email and click the confirmation link before signing in.",
              name: "EmailNotConfirmed",
              status: 401,
            } as any,
          };
        }
      } else {
        console.log("Supabase sign in successful:", data);
      }

      return { error };
    } catch (networkError: any) {
      console.error("Network or other error during sign in:", networkError);

      // Check for authentication timeout
      if (networkError.message === "Authentication timeout") {
        return {
          error: {
            message:
              "Sign in is taking too long. Please check your connection and try again.",
            name: "TimeoutError",
            status: 408,
          } as any,
        };
      }

      // Check if it's a network-related error
      if (
        networkError.name === "TypeError" &&
        networkError.message.includes("fetch")
      ) {
        return {
          error: {
            message:
              "Network error. Please check your connection and try again.",
            name: "NetworkError",
            status: 0,
          } as any,
        };
      }

      return {
        error: {
          message: "An unexpected error occurred. Please try again.",
          name: "UnknownError",
          status: 500,
        } as any,
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
          status: 500,
        } as any,
      };
    }

    console.log("Attempting Supabase sign up with email:", email);

    try {
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

        // Handle specific error cases with user-friendly messages
        if (error.message.includes("User already registered")) {
          return {
            error: {
              message:
                "An account with this email already exists. Please sign in instead or use a different email address.",
              name: "UserExistsError",
              status: 409,
            } as any,
          };
        }

        if (error.message.includes("Password should be at least") || error.name === "AuthWeakPasswordError") {
          // Extract the actual password requirements from the error message
          let passwordMessage = "Password must be at least 10 characters long and contain both uppercase and lowercase letters and numbers.";
          
          // Try to use the actual error message if it's clear enough
          if (error.message.includes("Password should")) {
            // Clean up the technical error message for users
            passwordMessage = error.message
              .replace("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", "uppercase and lowercase letters")
              .replace("0123456789", "numbers");
          }
          
          return {
            error: {
              message: passwordMessage,
              name: "WeakPasswordError",
              status: 400,
            } as any,
          };
        }

        if (error.message.includes("Invalid email")) {
          return {
            error: {
              message: "Please enter a valid email address.",
              name: "InvalidEmailError",
              status: 400,
            } as any,
          };
        }

        if (error.message.includes("email rate limit")) {
          return {
            error: {
              message:
                "Too many sign up attempts. Please wait a few minutes before trying again.",
              name: "RateLimitError",
              status: 429,
            } as any,
          };
        }

        // Generic error fallback
        return {
          error: {
            message:
              error.message || "Failed to create account. Please try again.",
            name: "SignUpError",
            status: 400,
          } as any,
        };
      }

      // Check if user was created but needs email confirmation
      if (data.user && !data.session) {
        console.log("Sign up successful, but email confirmation required");

        // For web users, automatically sign them in and let them use the app
        // They'll see a banner to confirm their email later
        console.log("Web signup - attempting auto-signin for unconfirmed user");

        try {
          const { data: signInData, error: signInError } =
            await supabase.auth.signInWithPassword({
              email,
              password,
            });

          if (signInError) {
            console.warn(
              "Auto-signin failed for unconfirmed user:",
              signInError,
            );
            return {
              error: {
                message:
                  "Account created! Please check your email and click the confirmation link before signing in.",
                name: "EmailConfirmationRequired",
                status: 200,
              } as any,
            };
          }

          console.log("Auto-signin successful for unconfirmed user");
          // Set a flag to show email confirmation banner
          localStorage.setItem("pending_email_confirmation", "true");
          return { error: null };
        } catch (autoSignInError) {
          console.error("Auto-signin error:", autoSignInError);
          return {
            error: {
              message:
                "Account created! Please check your email and click the confirmation link before signing in.",
              name: "EmailConfirmationRequired",
              status: 200,
            } as any,
          };
        }
      }

      console.log("Supabase sign up successful:", data);
      return { error: null };
    } catch (networkError: any) {
      console.error("Network error during sign up:", networkError);
      return {
        error: {
          message: "Network error. Please check your connection and try again.",
          name: "NetworkError",
          status: 0,
        } as any,
      };
    }
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        error: {
          message: "Authentication service not available",
          name: "AuthError",
          status: 500,
        } as any,
      };
    }

    // Check platform and set appropriate redirect URL
    const isNative = window.location.protocol === "capacitor:";
    let redirectUrl;

    if (isNative) {
      // Native app should redirect to production domain
      redirectUrl = "https://logyourbody.com/dashboard";
    } else {
      // Web app: check if running on localhost vs production
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      if (isLocalhost) {
        // Local development - redirect to local dashboard
        redirectUrl = `${window.location.origin}/dashboard`;
      } else {
        // Production web - use absolute production URL to avoid redirect issues
        redirectUrl = "https://logyourbody.com/dashboard";
      }
    }

    console.log(
      "Google OAuth redirect URL:",
      redirectUrl,
      "isNative:",
      isNative,
    );

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
          status: 500,
        } as any,
      };
    }

    // Check platform and set appropriate redirect URL
    const isNative = window.location.protocol === "capacitor:";
    let redirectUrl;

    if (isNative) {
      // Native app should redirect to production domain
      redirectUrl = "https://logyourbody.com/dashboard";
    } else {
      // Web app: check if running on localhost vs production
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      if (isLocalhost) {
        // Local development - redirect to local dashboard
        redirectUrl = `${window.location.origin}/dashboard`;
      } else {
        // Production web - use absolute production URL to avoid redirect issues
        redirectUrl = "https://logyourbody.com/dashboard";
      }
    }

    console.log(
      "Apple OAuth redirect URL:",
      redirectUrl,
      "isNative:",
      isNative,
    );

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
          status: 500,
        } as any,
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
