import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SMSLogin } from "@/components/SMSLogin";
import { Smartphone } from "lucide-react";
import { shouldShowEmailAuth, logPlatformInfo } from "@/lib/platform";

const Login = () => {
  const navigate = useNavigate();
  const {
    user,
    loading: authLoading,
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    startTrial,
  } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSMSLogin, setShowSMSLogin] = useState(false);
  const showEmailAuth = shouldShowEmailAuth();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (!authLoading && user) {
      console.log("Authenticated user detected on login page, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
    
    // Log platform info for debugging
    logPlatformInfo();
  }, [user, authLoading, navigate]);

  // Add error handler for browser extension issues
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.filename && event.filename.includes('injected.js')) {
        console.warn('Browser extension error detected - this is harmless and does not affect app functionality');
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
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
        setError(result.error.message);
      } else {
        console.log("Auth successful, proceeding...");
        // Start trial for new users (signup flow will handle this automatically)
        if (!isLogin) {
          console.log("Starting trial...");
          await startTrial();
        }
        console.log("Navigating to dashboard...");
        // Add a small delay to ensure state updates are processed
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 100);
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

  const handleAppleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const { error } = await signInWithApple();
      if (error) {
        setError(error.message);
      }
      // Navigation will be handled by the redirect
    } catch (err) {
      setError("Failed to sign in with Apple");
    } finally {
      setLoading(false);
    }
  };


  // Show SMS login interface
  if (showSMSLogin) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
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
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center mb-12">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold font-inter tracking-tight">
              LogYourBody
            </h1>
            <p className="text-muted-foreground mt-3 text-lg font-medium">
              Track your body composition with precision
            </p>
          </div>

          {/* Auth Form */}
          <div className="w-full max-w-sm mx-auto space-y-4">
            {error && (
              <div className="text-destructive text-sm text-center p-3 bg-destructive/10 rounded-md">
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
                      className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12 text-base"
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
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12 text-base"
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
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-12 text-base"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base font-inter"
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
              {/* SMS Login Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSMSLogin(true)}
                disabled={loading}
                className="w-full h-12 bg-secondary border-border text-foreground hover:bg-muted font-medium"
              >
                <Smartphone className="w-5 h-5 mr-3" />
                Continue with SMS
              </Button>
              
              {/* Google auth temporarily disabled */}

              <Button
                type="button"
                variant="outline"
                onClick={handleAppleSignIn}
                disabled={loading}
                className="w-full h-12 bg-secondary border-border text-foreground hover:bg-muted font-medium"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                </svg>
                Continue with Apple
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
        <p className="text-muted-foreground text-sm font-medium">
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
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Changelog
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
