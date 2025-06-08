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
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="text-sm text-muted-foreground">LogYourBody</div>
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="max-w-md mx-auto space-y-8">
            {/* 404 Visual */}
            <div className="relative">
              <div className="text-8xl sm:text-9xl font-black text-primary/20 leading-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </div>
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Page Not Found
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                The page you're looking for doesn't exist or has been moved.
                Let's get you back to tracking your body composition.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 w-full">
              <Button
                onClick={handleGoDashboard}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12 text-base"
              >
                <Activity className="h-5 w-5 mr-2" />
                Go to Dashboard
              </Button>

              <Button
                variant="outline"
                onClick={handleGoHome}
                className="w-full border-border text-foreground hover:bg-muted h-12 text-base"
              >
                <Home className="h-5 w-5 mr-2" />
                Back to Home
              </Button>
            </div>

            {/* Help Section */}
            <div className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">
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
                className="text-primary hover:text-primary/80 text-sm"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center border-t border-border">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <button
              onClick={() => navigate("/terms")}
              className="hover:text-foreground transition-colors"
            >
              Terms
            </button>
            <button
              onClick={() => navigate("/privacy")}
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </button>
            <button
              onClick={() =>
                window.open("mailto:support@logyourbody.com", "_blank")
              }
              className="hover:text-foreground transition-colors"
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
