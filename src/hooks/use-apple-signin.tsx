import { useState } from "react";
import { SignInWithApple } from "@capacitor-community/apple-sign-in";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isNativeiOS } from "@/lib/platform";

export interface AppleSignInResult {
  success: boolean;
  error?: string;
}

export function useAppleSignIn() {
  const [loading, setLoading] = useState(false);

  const checkAppleSignInAvailability = async (): Promise<boolean> => {
    if (!isNativeiOS()) {
      return false;
    }

    try {
      // Check if Apple Sign In is available
      const isAvailable = await SignInWithApple.isAvailable();
      console.log("Apple Sign In availability:", isAvailable);
      return isAvailable.isAvailable;
    } catch (error) {
      console.warn("Could not check Apple Sign In availability:", error);
      return false;
    }
  };

  const signInWithApple = async (): Promise<AppleSignInResult> => {
    if (!isNativeiOS()) {
      return {
        success: false,
        error: "Apple Sign In is only available on iOS devices",
      };
    }

    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: "Authentication service not available",
      };
    }

    setLoading(true);

    try {
      console.log("Starting native Apple Sign In...");

      // Request Apple Sign In directly without availability check
      const response = await SignInWithApple.authorize({
        requestedScopes: ["email", "fullName"],
      });

      console.log("Apple Sign In response:", response);

      if (!response.response.identityToken) {
        throw new Error("No identity token received from Apple");
      }

      // Extract user name from Apple response
      const fullName = response.response.fullName;
      let displayName = "";

      if (fullName) {
        // Combine first and last name if available
        const firstName = fullName.givenName || "";
        const lastName = fullName.familyName || "";
        displayName = `${firstName} ${lastName}`.trim();
        console.log("Extracted name from Apple Sign In:", displayName);
      }

      // Sign in to Supabase with the Apple ID token and user metadata
      console.log("Signing in to Supabase with Apple ID token...");

      // Add timeout and retry logic for network issues
      let supabaseResult;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        attempts++;
        console.log(`Supabase sign-in attempt ${attempts}/${maxAttempts}`);

        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timeout")), 15000),
          );

          // First attempt with minimal metadata to avoid 500 errors
          let signInOptions: any = {
            skipBrowserRedirect: true,
          };

          // Only add user metadata on first attempt, skip it on retries to avoid 500 errors
          if (attempts === 1 && displayName) {
            signInOptions.data = {
              name: displayName,
              given_name: fullName?.givenName,
              family_name: fullName?.familyName,
            };
          }

          const signInPromise = supabase.auth.signInWithIdToken({
            provider: "apple",
            token: response.response.identityToken,
            nonce: response.response.nonce,
            options: signInOptions,
          });

          supabaseResult = await Promise.race([signInPromise, timeoutPromise]);
          break; // Success, exit retry loop
        } catch (retryError: any) {
          console.log(`Attempt ${attempts} failed:`, retryError);

          // If we get a 500 error (unexpected_failure), this is likely a Supabase Apple Sign In bug
          // Try without metadata on next attempt
          if (retryError.status === 500 && retryError.code === "unexpected_failure") {
            console.log("Got 500 unexpected_failure error - this is a known Supabase Apple Sign In issue");
            console.log("Retrying without user metadata...");
          }

          if (attempts === maxAttempts) {
            throw retryError;
          }

          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
        }
      }

      if (supabaseResult?.error) {
        console.error("Supabase Apple Sign In error:", supabaseResult.error);
        
        // Handle specific 500 unexpected_failure error
        if (supabaseResult.error.status === 500 && supabaseResult.error.code === "unexpected_failure") {
          return {
            success: false,
            error: "There's a temporary issue with Apple Sign In. Please try email sign in instead, or contact support if this persists.",
          };
        }
        
        return {
          success: false,
          error: `Authentication failed: ${supabaseResult.error.message}`,
        };
      }

      console.log("Apple Sign In successful:", supabaseResult.data);
      return {
        success: true,
      };
    } catch (error: any) {
      console.error("Native Apple Sign In failed:", error);

      // Handle specific error cases
      if (error.message?.includes("canceled") || error.code === 1001) {
        return {
          success: false,
          error: "Sign in was canceled",
        };
      }

      // Error 1000 - Configuration issue
      if (error.code === 1000) {
        return {
          success: false,
          error:
            'Apple Sign In not configured. Please enable "Sign In with Apple" capability in Xcode and ensure your Apple Developer account has this feature enabled.',
        };
      }

      // Error 1004 - Not supported
      if (error.code === 1004) {
        return {
          success: false,
          error: "Apple Sign In is not supported on this device or iOS version",
        };
      }

      // Handle AuthRetryableFetchError and network issues
      if (
        error.name === "AuthRetryableFetchError" ||
        error.message?.includes("AuthRetryableFetchError") ||
        error.status === 0
      ) {
        return {
          success: false,
          error:
            "Network connection issue. Please check your internet connection and try again.",
        };
      }

      // Handle timeout errors
      if (
        error.message?.includes("timeout") ||
        error.message?.includes("Request timeout")
      ) {
        return {
          success: false,
          error: "Sign in timed out. Please try again.",
        };
      }

      // Handle 500 unexpected_failure error (known Supabase Apple Sign In issue)
      if (error.status === 500 && error.code === "unexpected_failure") {
        return {
          success: false,
          error: "There's a temporary issue with Apple Sign In. Please try email sign in instead, or contact support if this persists.",
        };
      }

      return {
        success: false,
        error:
          error.message ||
          `Apple Sign In failed (Error ${error.code || "Unknown"})`,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithApple,
    checkAppleSignInAvailability,
    loading,
  };
}
