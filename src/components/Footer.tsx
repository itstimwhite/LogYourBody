import React from "react";
import Link from "next/link";
import { Github, Twitter, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VersionDisplay } from "@/components/VersionDisplay";

type FooterLink = {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  external?: boolean;
  disabled?: boolean;
};

type FooterSection = {
  title: string;
  links: FooterLink[];
};

export function Footer() {
  const footerSections: FooterSection[] = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features", disabled: true },
        { label: "Pricing", href: "/login" },
        { label: "Changelog", href: "/changelog" },
        { label: "Download", href: "#", disabled: true },
        { label: "API", href: "#", disabled: true },
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Security", href: "/security" },
        { label: "Contact", href: "mailto:support@logyourbody.com", external: true },
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Blog", href: "/blog" },
        { label: "Community", href: "#", disabled: true },
        { label: "Support", href: "mailto:support@logyourbody.com", external: true },
        { label: "Documentation", href: "#", disabled: true },
        { label: "Status", href: "https://status.logyourbody.com", external: true },
      ]
    },
    {
      title: "Developers",
      links: [
        { label: "GitHub", href: "https://github.com/itstimwhite/LogYourBody", icon: Github, external: true },
        { label: "API Docs", href: "#", disabled: true },
        { label: "SDKs", href: "#", disabled: true },
        { label: "Webhooks", href: "#", disabled: true },
        { label: "Open Source", href: "https://github.com/itstimwhite/LogYourBody", external: true },
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
                <a
                  href="https://github.com/itstimwhite/LogYourBody"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-linear-text-tertiary hover:text-linear-text transition-colors p-1"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com/logyourbody"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-linear-text-tertiary hover:text-linear-text transition-colors p-1"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="mailto:support@logyourbody.com"
                  className="text-linear-text-tertiary hover:text-linear-text transition-colors p-1"
                  aria-label="Email"
                >
                  <Mail className="h-5 w-5" />
                </a>
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
                  <div key={link.label}>
                    {link.disabled ? (
                      <span className="text-left text-sm text-linear-text-tertiary cursor-not-allowed opacity-50">
                        {link.label}
                      </span>
                    ) : link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-left text-sm text-linear-text-secondary hover:text-linear-text transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        {link.icon && <link.icon className="h-3 w-3" />}
                        {link.label}
                        {(link.label === "GitHub" || link.label === "Open Source") && (
                          <ExternalLink className="h-3 w-3" />
                        )}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-left text-sm text-linear-text-secondary hover:text-linear-text transition-colors cursor-pointer"
                      >
                        {link.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-linear-border mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-sm text-linear-text-tertiary">
              © {new Date().getFullYear()} LogYourBody
            </p>
            <VersionDisplay />
          </div>
          
          {/* CTA */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-linear-text-secondary hidden sm:block">
              Track what really matters
            </span>
            <Link href="/login">
              <Button className="bg-linear-text text-linear-bg px-6 py-2 text-sm font-medium rounded-lg hover:bg-linear-text/90 transition-colors">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;