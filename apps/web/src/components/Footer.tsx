import React from "react";
import Link from "next/link";
import { Github, Twitter, Mail, ExternalLink, Download } from "lucide-react";
import { Button } from "./ui/button";
import { VersionDisplay } from "./VersionDisplay";
import { APP_CONFIG, getContactEmail, getSocialUrl } from "@/constants/app";

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
        { label: "Features", href: "/#features-grid" },
        { label: "Pricing", href: "/#pricing" },
        { label: "iOS App", href: "/download/ios" },
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
        { label: "Contact", href: `mailto:${getContactEmail('support')}`, external: true },
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Blog", href: "/blog" },
        { label: "Support", href: `mailto:${getContactEmail('support')}`, external: true },
      ]
    },
    {
      title: "Developers",
      links: [
        { label: "GitHub", href: getSocialUrl('github'), icon: Github, external: true },
      ]
    }
  ];

  return (
    <footer className="border-t border-[#1a1b1e] bg-[#08090a] font-inter" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-3">{APP_CONFIG.appName}</h3>
              <p className="text-sm text-white/70 leading-relaxed mb-6">
                Track real progress. Not just weight.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-4">
                <a
                  href={getSocialUrl('github')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/50 hover:text-white transition-colors p-1"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href={getSocialUrl('twitter')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/50 hover:text-white transition-colors p-1"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href={`mailto:${getContactEmail('support')}`}
                  className="text-white/50 hover:text-white transition-colors p-1"
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
              <h4 className="text-sm font-medium text-white mb-4 tracking-wide">
                {section.title}
              </h4>
              <div className="flex flex-col gap-3">
                {section.links.map((link) => (
                  <div key={link.label}>
                    {link.disabled ? (
                      <span className="text-left text-sm text-white/50 cursor-not-allowed opacity-50">
                        {link.label}
                      </span>
                    ) : link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-left text-sm text-white/70 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1"
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
                        className="text-left text-sm text-white/70 hover:text-white transition-colors cursor-pointer"
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
        <div className="border-t border-[#1a1b1e] mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-sm text-white/50">
              © {new Date().getFullYear()} {APP_CONFIG.appName}
            </p>
            <VersionDisplay />
          </div>
          
          {/* CTA */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/70 hidden sm:block">
              Track what really matters
            </span>
            <Link href="/download/ios">
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download iOS App
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;