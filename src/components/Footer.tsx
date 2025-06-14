import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { VersionDisplay } from "@/components/VersionDisplay";
import { prefetchRoute } from "@/lib/prefetch";

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-linear-border py-12 font-inter" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 text-center">
        <div className="mb-10">
          <h3 className="mb-4 text-3xl font-bold text-linear-text">LogYourBody</h3>
          <p className="mx-auto max-w-xl text-linear-text-secondary">
            Professional body composition tracking for fitness enthusiasts and health professionals.
          </p>
        </div>

        <div className="mb-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            className="bg-linear-purple text-linear-bg px-8 py-4 text-base font-medium rounded-lg hover:bg-linear-purple/90 transition-colors"
            onMouseEnter={() => prefetchRoute("/login")}
            onFocus={() => prefetchRoute("/login")}
            onClick={() => navigate("/login")}
          >
            Start Free Trial
          </Button>
          <p className="text-sm text-linear-text-tertiary">No credit card required</p>
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-8">
          <Button
            variant="ghost"
            onMouseEnter={() => prefetchRoute("/privacy")}
            onFocus={() => prefetchRoute("/privacy")}
            onClick={() => navigate("/privacy")}
            className="text-linear-text-secondary hover:text-linear-text text-sm"
          >
            Privacy Policy
          </Button>
          <Button
            variant="ghost"
            onMouseEnter={() => prefetchRoute("/terms")}
            onFocus={() => prefetchRoute("/terms")}
            onClick={() => navigate("/terms")}
            className="text-linear-text-secondary hover:text-linear-text text-sm"
          >
            Terms of Service
          </Button>
          <Button
            variant="ghost"
            onMouseEnter={() => prefetchRoute("/changelog")}
            onFocus={() => prefetchRoute("/changelog")}
            onClick={() => navigate("/changelog")}
            className="text-linear-text-secondary hover:text-linear-text text-sm"
          >
            Changelog
          </Button>
          <Button
            variant="ghost"
            onClick={() => window.open("mailto:support@logyourbody.com")}
            className="text-linear-text-secondary hover:text-linear-text text-sm"
          >
            Contact Support
          </Button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <VersionDisplay />
          <p className="text-sm text-linear-text-tertiary">
            © {import.meta.env.VITE_BUILD_YEAR} LogYourBody. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
