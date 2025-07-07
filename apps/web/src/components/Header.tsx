'use client'

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FeaturesFlyout } from "./FeaturesFlyout";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onFeatureClick?: (featureId: string) => void;
  showFeatures?: boolean;
}

export function Header({ onFeatureClick, showFeatures = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  const handleFeatureClick = (featureId: string) => {
    if (onFeatureClick) {
      onFeatureClick(featureId);
    } else {
      scrollToSection(featureId);
    }
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[rgba(0,0,0,0.01)] backdrop-blur-xl backdrop-saturate-150">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="text-base font-semibold text-white">LogYourBody</span>
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {showFeatures && (
            <FeaturesFlyout onFeatureClick={handleFeatureClick} />
          )}
          <Link
            href="/blog"
            className={cn(
              "text-sm font-medium transition-colors",
              isActive("/blog") 
                ? "text-white" 
                : "text-gray-400 hover:text-white"
            )}
          >
            Blog
          </Link>
          <Link
            href="/about"
            className={cn(
              "text-sm font-medium transition-colors",
              isActive("/about") 
                ? "text-white" 
                : "text-gray-400 hover:text-white"
            )}
          >
            About
          </Link>
          {showFeatures && (
            <button
              className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
              onClick={() => scrollToSection('pricing')}
            >
              Pricing
            </button>
          )}
        </div>

        {/* Desktop CTA buttons */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-3">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-black transition-all hover:bg-gray-100"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <div className="space-y-1 px-6 pb-3 pt-2">
          {showFeatures && (
            <div className="py-2">
              <span className="block text-sm font-medium text-gray-400">Features</span>
            </div>
          )}
          <Link
            href="/blog"
            className={cn(
              "block px-3 py-2 text-base font-medium transition-colors",
              isActive("/blog")
                ? "text-white"
                : "text-gray-400 hover:text-white"
            )}
            onClick={() => setMobileMenuOpen(false)}
          >
            Blog
          </Link>
          <Link
            href="/about"
            className={cn(
              "block px-3 py-2 text-base font-medium transition-colors",
              isActive("/about")
                ? "text-white"
                : "text-gray-400 hover:text-white"
            )}
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
          {showFeatures && (
            <button
              className="block px-3 py-2 text-base font-medium text-gray-400 transition-colors hover:text-white"
              onClick={() => scrollToSection('pricing')}
            >
              Pricing
            </button>
          )}
          <div className="mt-6 space-y-2">
            <Link
              href="/login"
              className="block px-3 py-2 text-base font-medium text-gray-400 transition-colors hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="block rounded-full bg-white px-3 py-2 text-center text-base font-medium text-black transition-all hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}