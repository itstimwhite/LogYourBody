import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SMSLogin } from "@/components/SMSLogin";
import { Smartphone } from "lucide-react";
import {
  shouldShowEmailAuth,
  logPlatformInfo,
  isNativeiOS,
} from "@/lib/platform";
import { useAppleSignIn } from "@/hooks/use-apple-signin";
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation";
import { VersionDisplay } from "@/components/VersionDisplay";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    user,
    loading: authLoading,
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    startTrial,
  } = useAuth();

  // Check URL params for signup mode
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSMSLogin, setShowSMSLogin] = useState(false);

  // Add swipe navigation to go back to home/index
  useSwipeNavigation({
    onSwipeRight: () => navigate("/"),
    threshold: 100,
  });
  const showEmailAuth = shouldShowEmailAuth();

  // Native Apple Sign In hook for iOS
  const { signInWithApple: nativeAppleSignIn, loading: appleLoading } =
    useAppleSignIn();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (!authLoading && user) {
      console.log(
        "Authenticated user detected on login page, redirecting to dashboard",
      );
      navigate("/dashboard", { replace: true });
    }

    // Log platform info for debugging
    logPlatformInfo();
  }, [user, authLoading, navigate]);

  // Add error handler for browser extension issues
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.filename && event.filename.includes("injected.js")) {
        console.warn(
          "Browser extension error detected - this is harmless and does not affect app functionality",
        );
        event.preventDefault();
      }
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, don't render anything (will redirect)
  if (user) {
    return null;
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("Starting email auth flow...");

    try {
      let result;
      if (isLogin) {
        console.log("Attempting sign in...");
        result = await signInWithEmail(email, password);
        console.log("Sign in result:", result);
      } else {
        console.log("Attempting sign up...");
        result = await signUpWithEmail(email, password, name);
        console.log("Sign up result:", result);
      }

      if (result.error) {
        console.error("Auth error:", result.error);

        // Handle specific error cases
        if (result.error.name === "UserExistsError" && !isLogin) {
          // User tried to sign up with existing email, switch to login mode
          setError("An account with this email already exists.");
          setIsLogin(true);
          setTimeout(() => {
            setError("Please sign in with your existing account.");
          }, 2000);
        } else if (result.error.name === "EmailConfirmationRequired") {
          // Show confirmation message but don't treat as error
          setError(
            "Account created! Please check your email and click the confirmation link to complete your registration.",
          );
        } else {
          setError(result.error.message);
        }
      } else {
        console.log("Auth successful, proceeding...");
        // Start trial for new users (signup flow will handle this automatically)
        if (!isLogin) {
          console.log("Starting trial...");
          await startTrial();
        }
        console.log(
          "Auth successful - navigation will be handled by auth state change",
        );
        // Don't manually navigate - let the useEffect handle it when auth state updates
      }
    } catch (err) {
      console.error("Unexpected error in auth flow:", err);
      // More specific error handling for different error types
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred during authentication");
      }
    } finally {
      console.log("Auth flow completed, setting loading to false");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
      }
      // Navigation will be handled by the redirect
    } catch (err) {
      setError("Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("Starting Google Sign In");
      const { error } = await signInWithGoogle();
      if (error) {
        console.error("Google Sign In error:", error);
        setError(error.message || "Google Sign In failed");
      }
      // Navigation will be handled by auth state change
    } catch (err) {
      console.error("Google Sign In error:", err);
      setError("Google Sign In failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      if (isNativeiOS()) {
        // Use native Apple Sign In on iOS
        console.log("Using native Apple Sign In on iOS");
        const result = await nativeAppleSignIn();
        if (!result.success) {
          setError(result.error || "Apple Sign In failed");
        }
        // Navigation will be handled by auth state change
      } else {
        // Use web Apple Sign In on other platforms
        console.log("Using web Apple Sign In");
        const { error } = await signInWithApple();
        if (error) {
          setError(error.message);
        }
        // Navigation will be handled by the redirect
      }
    } catch (err) {
      console.error("Apple Sign In error:", err);
      setError("Failed to sign in with Apple");
    } finally {
      setLoading(false);
    }
  };

  // Show SMS login interface
  if (showSMSLogin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
        <SMSLogin
          onBack={() => setShowSMSLogin(false)}
          onSuccess={() => {
            console.log("SMS login successful, navigating to dashboard");
            navigate("/dashboard");
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header with Back Navigation */}
      <div className="flex items-center justify-between p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-foreground"
        >
          ← Back
        </Button>
      </div>

      {/* Logo Section */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="mb-12 text-center">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="font-inter text-4xl font-bold tracking-tight">
              LogYourBody
            </h1>
            <p className="mt-3 text-lg font-medium text-muted-foreground">
              Track your body composition with precision
            </p>
          </div>

          {/* Auth Form */}
          <div className="mx-auto w-full max-w-sm space-y-4">
            {error && (
              <div
                className={`rounded-md p-3 text-center text-sm ${
                  error.includes("Account created!") ||
                  error.includes("Please sign in with your existing account")
                    ? "border border-blue-200 bg-blue-50 text-blue-700"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {error}
              </div>
            )}

            {/* Only show email auth on web and Android */}
            {showEmailAuth && (
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {!isLogin && (
                  <div>
                    <Label htmlFor="name" className="sr-only">
                      Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-12 border-border bg-secondary text-base text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="email" className="sr-only">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 border-border bg-secondary text-base text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="sr-only">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 border-border bg-secondary text-base text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="font-inter h-12 w-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {loading
                    ? "Please wait..."
                    : isLogin
                      ? "Sign In"
                      : "Create Account"}
                </Button>
              </form>
            )}

            {/* Only show divider if email auth is visible */}
            {showEmailAuth && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
            )}

            {/* Social Login Buttons */}
            <div className="space-y-3">
              {/* SMS Login Button - temporarily hidden */}
              {false && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSMSLogin(true)}
                  disabled={loading}
                  className="h-12 w-full border-border bg-secondary font-medium text-foreground hover:bg-muted"
                >
                  <Smartphone className="mr-3 h-5 w-5" />
                  Continue with SMS
                </Button>
              )}

              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="h-12 w-full border-border bg-secondary font-medium text-foreground hover:bg-muted"
              >
                <svg
                  className="mr-3 h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {loading ? "Signing in..." : "Continue with Google"}
              </Button>

              {/* Apple Sign In - uses native on iOS, web on other platforms */}
              <Button
                type="button"
                variant="outline"
                onClick={handleAppleSignIn}
                disabled={loading || appleLoading}
                className="h-12 w-full border-border bg-secondary font-medium text-foreground hover:bg-muted"
              >
                <svg
                  className="mr-3 h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                </svg>
                {loading || appleLoading
                  ? "Signing in..."
                  : "Continue with Apple"}
              </Button>
            </div>

            {/* Toggle between login/signup - only show if email auth is available */}
            {showEmailAuth && (
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          By continuing, you agree to our{" "}
          <button
            onClick={() => navigate("/terms")}
            className="text-primary hover:underline"
          >
            Terms of Service
          </button>{" "}
          and{" "}
          <button
            onClick={() => navigate("/privacy")}
            className="text-primary hover:underline"
          >
            Privacy Policy
          </button>
        </p>
        <div className="mt-4 flex justify-center gap-4">
          <button
            onClick={() => navigate("/changelog")}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Changelog
          </button>
        </div>
        <div className="mt-4 flex justify-center">
          <VersionDisplay />
        </div>
      </div>
    </div>
  );
};

export default Login;
