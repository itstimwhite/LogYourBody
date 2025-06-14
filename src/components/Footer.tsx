import React from "react";
import { useNavigate } from "react-router-dom";
import { VersionDisplay } from "@/components/VersionDisplay";
import { prefetchRoute } from "@/lib/prefetch";
import { Github, Twitter, Mail, ExternalLink } from "lucide-react";

export function Footer() {
  const navigate = useNavigate();

  const handleLinkClick = (path: string) => {
    navigate(path);
  };

  const handleExternalLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Features", action: () => {}, disabled: true },
        { label: "Pricing", action: () => handleLinkClick("/login") },
        { label: "Changelog", action: () => handleLinkClick("/changelog") },
        { label: "Download", action: () => {}, disabled: true },
        { label: "API", action: () => {}, disabled: true },
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About", action: () => handleLinkClick("/about") },
        { label: "Careers", action: () => handleLinkClick("/careers") },
        { label: "Privacy Policy", action: () => handleLinkClick("/privacy") },
        { label: "Terms of Service", action: () => handleLinkClick("/terms") },
        { label: "Security", action: () => handleLinkClick("/security") },
        { label: "Contact", action: () => handleExternalLink("mailto:support@logyourbody.com") },
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Blog", action: () => {}, disabled: true },
        { label: "Community", action: () => {}, disabled: true },
        { label: "Support", action: () => handleExternalLink("mailto:support@logyourbody.com") },
        { label: "Documentation", action: () => {}, disabled: true },
        { label: "Status", action: () => {}, disabled: true },
      ]
    },
    {
      title: "Developers",
      links: [
        { label: "GitHub", action: () => handleExternalLink("https://github.com/itstimwhite/LogYourBody") },
        { label: "API Docs", action: () => {}, disabled: true },
        { label: "SDKs", action: () => {}, disabled: true },
        { label: "Webhooks", action: () => {}, disabled: true },
        { label: "Open Source", action: () => handleExternalLink("https://github.com/itstimwhite/LogYourBody") },
      ]
    }
  ];

  return (
    <footer className="border-t border-linear-border bg-linear-bg font-inter" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-linear-text mb-3">LogYourBody</h3>
              <p className="text-sm text-linear-text-secondary leading-relaxed mb-6">
                Track real progress. Not just weight.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleExternalLink("https://github.com/itstimwhite/LogYourBody")}
                  className="text-linear-text-tertiary hover:text-linear-text transition-colors p-1"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleExternalLink("https://twitter.com/logyourbody")}
                  className="text-linear-text-tertiary hover:text-linear-text transition-colors p-1"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleExternalLink("mailto:support@logyourbody.com")}
                  className="text-linear-text-tertiary hover:text-linear-text transition-colors p-1"
                  aria-label="Email"
                >
                  <Mail className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="flex flex-col">
              <h4 className="text-sm font-medium text-linear-text mb-4 tracking-wide">
                {section.title}
              </h4>
              <div className="flex flex-col gap-3">
                {section.links.map((link) => (
                  <button
                    key={link.label}
                    onClick={link.action}
                    disabled={link.disabled}
                    className={`text-left text-sm transition-colors ${
                      link.disabled 
                        ? "text-linear-text-tertiary cursor-not-allowed opacity-50" 
                        : "text-linear-text-secondary hover:text-linear-text cursor-pointer"
                    }`}
                  >
                    {link.label}
                    {link.label === "GitHub" || link.label === "Open Source" ? (
                      <ExternalLink className="inline ml-1 h-3 w-3" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-linear-border mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-sm text-linear-text-tertiary">
              © {import.meta.env.VITE_BUILD_YEAR} LogYourBody. All rights reserved.
            </p>
            <VersionDisplay />
          </div>
          
          {/* CTA */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-linear-text-secondary hidden sm:block">
              Track what really matters
            </span>
            <button
              onClick={() => handleLinkClick("/login")}
              onMouseEnter={() => prefetchRoute("/login")}
              onFocus={() => prefetchRoute("/login")}
              className="bg-linear-text text-linear-bg px-6 py-2 text-sm font-medium rounded-lg hover:bg-linear-text/90 transition-colors"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
