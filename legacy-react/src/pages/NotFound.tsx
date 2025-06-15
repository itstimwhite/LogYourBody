import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    window.history.length > 2 ? navigate(-1) : navigate("/");
  };

  const handleGoDashboard = () => {
    navigate("/dashboard");
  };

  // Set HTTP status code for SEO
  useEffect(() => {
    // In a real server-side setup, this would return a 404 status
    document.title = "404 - Page Not Found | LogYourBody";
  }, []);

  return (
    <>
      <SEOHead
        title="404 - Page Not Found | LogYourBody"
        description="The page you're looking for could not be found. Return to LogYourBody to continue tracking your body composition with precision."
        keywords="404, page not found, error, LogYourBody"
      />
      <div className="flex min-h-svh flex-col bg-background text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <div className="text-sm text-muted-foreground">LogYourBody</div>
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="mx-auto max-w-md space-y-8">
            {/* 404 Visual */}
            <div className="relative">
              <div className="text-8xl font-black leading-none text-primary/20 sm:text-9xl">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 sm:h-20 sm:w-20">
                  <Search className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
                </div>
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Page Not Found
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground">
                The page you're looking for doesn't exist or has been moved.
                Let's get you back to tracking your body composition.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-4">
              <Button
                onClick={handleGoDashboard}
                className="h-12 w-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Activity className="mr-2 h-5 w-5" />
                Go to Dashboard
              </Button>

              <Button
                variant="outline"
                onClick={handleGoHome}
                className="h-12 w-full border-border text-base text-foreground hover:bg-muted"
              >
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
            </div>

            {/* Help Section */}
            <div className="border-t border-border pt-8">
              <p className="mb-4 text-sm text-muted-foreground">
                Need help? We're here for you.
              </p>
              <Button
                variant="ghost"
                onClick={() =>
                  window.open(
                    "mailto:support@logyourbody.com?subject=Navigation Help - 404 Error",
                    "_blank",
                  )
                }
                className="text-sm text-primary hover:text-primary/80"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6 text-center">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <button
              onClick={() => navigate("/terms")}
              className="transition-colors hover:text-foreground"
            >
              Terms
            </button>
            <button
              onClick={() => navigate("/privacy")}
              className="transition-colors hover:text-foreground"
            >
              Privacy
            </button>
            <button
              onClick={() =>
                window.open("mailto:support@logyourbody.com", "_blank")
              }
              className="transition-colors hover:text-foreground"
            >
              Support
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
