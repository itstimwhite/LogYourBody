'use client'

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FeaturesFlyout } from "@/components/FeaturesFlyout";

interface HeaderProps {
  onFeatureClick?: (featureId: string) => void;
  showFeatures?: boolean;
}

export function Header({ onFeatureClick, showFeatures = false }: HeaderProps) {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleFeatureClick = (featureId: string) => {
    if (onFeatureClick) {
      onFeatureClick(featureId);
    } else {
      scrollToSection(featureId);
    }
  };

  return (
    <header className="border-b border-linear-border bg-linear-bg" role="banner">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <nav
          className="flex items-center justify-between"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="flex items-center space-x-6 sm:space-x-8">
            <Link href="/" className="text-lg sm:text-xl font-semibold text-linear-text hover:text-linear-text-secondary transition-colors">
              LogYourBody
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              {showFeatures && (
                <FeaturesFlyout onFeatureClick={handleFeatureClick} />
              )}
              <Link href="/blog" className="text-sm text-linear-text-secondary hover:text-linear-text transition-colors">
                Blog
              </Link>
              <Link href="/about" className="text-sm text-linear-text-secondary hover:text-linear-text transition-colors">
                About
              </Link>
              {showFeatures && (
                <button
                  className="text-sm text-linear-text-secondary hover:text-linear-text transition-colors"
                  onClick={() => scrollToSection('pricing')}
                >
                  Pricing
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/login">
              <Button
                variant="ghost"
                aria-label="Sign in to your account"
                className="text-sm text-linear-text-secondary hover:text-linear-text hidden sm:block"
              >
                Log in
              </Button>
            </Link>
            <Link href="/login">
              <Button
                aria-label="Start your 3-day free trial"
                className="bg-linear-text text-linear-bg text-sm font-medium px-4 sm:px-5 py-2 rounded-lg hover:bg-linear-text-secondary transition-colors"
              >
                Sign up
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}