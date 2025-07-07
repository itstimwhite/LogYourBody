'use client'

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from '@/contexts/ClerkAuthContext';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Switch } from "./ui/switch";
import {
  BarChart3,
  Camera,
  Smartphone,
  TrendingUp,
  Shield,
  Clock,
  Check,
  ArrowRight,
  Monitor,
  Tablet,
  Zap,
  Download,
} from "lucide-react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { LandingTimelineDemo } from "./LandingTimelineDemo";
import { StepTrackerSection } from "./StepTrackerModule";
import { LandingPredictionSection } from "./LandingPredictionSection";
import { FeaturesFlyout } from "./FeaturesFlyout";

export function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(true); // Default to annual for savings
  const { user, signOut } = useAuth();

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const pricing = {
    monthly: {
      price: 9.99,
      period: "month",
      yearlyTotal: 119.88,
    },
    annual: {
      price: 69.99,
      period: "year",
      monthlyEquivalent: 5.83,
      savings: 49.89,
      savingsPercent: 42,
    },
  };

  const appFeatures = [
    {
      icon: BarChart3,
      title: "Body Fat % Tracking",
      description:
        "Navy, 3-site, and 7-site methods. Accurate to ±2% when done correctly.",
    },
    {
      icon: TrendingUp,
      title: "FFMI Calculator",
      description:
        "Know your genetic potential. Track lean muscle gains without the guesswork.",
    },
    {
      icon: Camera,
      title: "Progress Photos",
      description:
        "Automated reminders. Consistent angles. See changes you'd miss in the mirror.",
    },
    {
      icon: Smartphone,
      title: "1-Tap Import",
      description:
        "Pulls weight from Apple Health. No manual entry. Always up to date.",
    },
    {
      icon: Shield,
      title: "Your Data, Private",
      description:
        "End-to-end encrypted. Export anytime. Delete anytime. You own it.",
    },
    {
      icon: Clock,
      title: "Takes 30 Seconds",
      description:
        "Log complete body metrics faster than you can tie your shoes.",
    },
  ];


  const currentPlan = isAnnual ? pricing.annual : pricing.monthly;

  const features = [
    "Track body fat % with 3 methods",
    "FFMI & lean mass calculations",
    "Progress photos with reminders",
    "Apple Health & Google Fit sync",
    "Export your data anytime",
    "Weekly progress reports",
    "Trend predictions",
    "No ads, ever",
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleFeatureClick = (featureId: string) => {
    scrollToSection(featureId);
  };

  return (
    <div className="min-h-svh bg-linear-bg font-inter">
      
      {/* Skip Links */}
      <div className="sr-only z-50 focus:not-sr-only focus:absolute focus:left-4 focus:top-4">
        <button
          className="rounded bg-linear-purple px-4 py-2 text-linear-text focus:ring-2 focus:ring-linear-purple/50"
          onClick={() => document.getElementById("main-content")?.focus()}
        >
          Skip to main content
        </button>
      </div>
      <Header onFeatureClick={handleFeatureClick} showFeatures={true} />

      {/* Main Content */}
      <main id="main-content" tabIndex={-1}>
        {/* Hero Section - YC Style */}
        <section
          className="relative pt-20 pb-8 md:pt-24 md:pb-12 overflow-hidden"
          role="banner"
          aria-labelledby="hero-heading"
        >
          {/* Subtle background */}
          <div className="absolute inset-0 bg-gradient-to-b from-linear-purple/5 to-transparent" />
          
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-5xl mx-auto">
              {/* Centered Content - YC Style */}
              <div className="text-center mb-8">
                {/* Clear Value Prop */}
                <h1
                  id="hero-heading"
                  className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-linear-text mb-4"
                >
                  Track body fat percentage,
                  <br />
                  not just weight
                </h1>
                
                {/* One-liner explanation */}
                <p className="text-lg sm:text-xl text-linear-text-secondary max-w-2xl mx-auto mb-8">
                  Professional body composition tracking with FFMI calculations and progress photos. 
                  Syncs with Apple Health.
                </p>
                
                {/* Primary CTA - YC style */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                  <Link href="/signup">
                    <Button
                      className="bg-linear-purple text-white px-8 py-3 text-base font-semibold rounded-lg hover:bg-linear-purple/90 transition-all shadow-md"
                    >
                      Start Free Trial
                    </Button>
                  </Link>
                  <Link href="/demo" className="text-linear-text-secondary hover:text-linear-text transition-colors underline underline-offset-4">
                    Watch 2-min demo
                  </Link>
                </div>
                
                {/* Trust indicators */}
                <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-linear-text-tertiary">
                  <span>No credit card required</span>
                  <span>•</span>
                  <span>10,000+ active users</span>
                  <span>•</span>
                  <span>4.9★ App Store</span>
                </div>
              </div>
              
              {/* Simple Product Visual */}
              <div className="relative max-w-3xl mx-auto">
                <div className="rounded-xl bg-gradient-to-br from-linear-card/50 to-linear-card/30 border border-linear-border/50 backdrop-blur-sm p-4 shadow-xl">
                  <div className="aspect-[16/9] bg-gradient-to-br from-linear-purple/10 to-linear-purple/5 rounded-lg border border-linear-border/30 flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-4 p-8">
                      {/* Mini feature previews */}
                      <div className="text-center">
                        <div className="h-12 w-12 mx-auto mb-2 rounded-lg bg-linear-purple/20 flex items-center justify-center">
                          <BarChart3 className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-xs text-linear-text-secondary">BF% Tracking</p>
                      </div>
                      <div className="text-center">
                        <div className="h-12 w-12 mx-auto mb-2 rounded-lg bg-linear-purple/20 flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-xs text-linear-text-secondary">FFMI Calculator</p>
                      </div>
                      <div className="text-center">
                        <div className="h-12 w-12 mx-auto mb-2 rounded-lg bg-linear-purple/20 flex items-center justify-center">
                          <Camera className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-xs text-linear-text-secondary">Progress Photos</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Unified Data Import Section - Apple/YC Style */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-transparent via-linear-purple/5 to-transparent">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
              {/* Header - Apple style copy */}
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-linear-text mb-4">
                  All your body data.
                  <br />
                  <span className="text-linear-text-secondary">One beautiful timeline.</span>
                </h2>
                <p className="text-lg sm:text-xl text-linear-text-secondary max-w-3xl mx-auto">
                  Import DEXA scans, progress photos, smart scale measurements, and body measurements. 
                  We turn your scattered PDFs and spreadsheets into actionable insights.
                </p>
              </div>

              {/* Visual representation - Linear.app inspired */}
              <div className="relative mx-auto max-w-4xl">
                <div className="absolute inset-0 bg-gradient-to-r from-linear-purple/10 via-transparent to-linear-purple/10 blur-3xl" />
                
                {/* Central hub visualization */}
                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  {/* Left side - Data sources */}
                  <div className="space-y-4">
                    <div className="text-right">
                      <div className="inline-flex items-center gap-3 text-sm text-linear-text-secondary">
                        <span>DEXA Scan PDFs</span>
                        <div className="h-8 w-8 rounded-lg bg-linear-card border border-linear-border/50 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 bg-linear-purple rounded-full animate-pulse" />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-3 text-sm text-linear-text-secondary">
                        <span>Smart Scale Data</span>
                        <div className="h-8 w-8 rounded-lg bg-linear-card border border-linear-border/50 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 bg-linear-purple rounded-full animate-pulse" />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-3 text-sm text-linear-text-secondary">
                        <span>Progress Photos</span>
                        <div className="h-8 w-8 rounded-lg bg-linear-card border border-linear-border/50 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 bg-linear-purple rounded-full animate-pulse" />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-3 text-sm text-linear-text-secondary">
                        <span>Body Measurements</span>
                        <div className="h-8 w-8 rounded-lg bg-linear-card border border-linear-border/50 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 bg-linear-purple rounded-full animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Center - LogYourBody hub */}
                  <div className="relative">
                    <div className="mx-auto h-32 w-32 rounded-3xl bg-gradient-to-br from-linear-purple to-linear-purple/80 shadow-2xl flex items-center justify-center">
                      <BarChart3 className="h-16 w-16 text-white" />
                    </div>
                    <p className="text-center mt-4 font-semibold text-linear-text">LogYourBody</p>
                  </div>

                  {/* Right side - Unified output */}
                  <div className="space-y-4">
                    <div className="text-left">
                      <div className="inline-flex items-center gap-3 text-sm text-linear-text">
                        <div className="h-8 w-8 rounded-lg bg-linear-purple/10 flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                        <span>Unified Timeline</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="inline-flex items-center gap-3 text-sm text-linear-text">
                        <div className="h-8 w-8 rounded-lg bg-linear-purple/10 flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                        <span>Trend Analysis</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="inline-flex items-center gap-3 text-sm text-linear-text">
                        <div className="h-8 w-8 rounded-lg bg-linear-purple/10 flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                        <span>Progress Insights</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="inline-flex items-center gap-3 text-sm text-linear-text">
                        <div className="h-8 w-8 rounded-lg bg-linear-purple/10 flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                        <span>Export Reports</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connection lines */}
                <div className="absolute inset-0 pointer-events-none">
                  <svg className="absolute inset-0 w-full h-full" style={{ transform: 'scale(1.1)' }}>
                    <defs>
                      <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor="rgb(94 106 210 / 0.3)" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                    {/* Animated connection lines would go here */}
                  </svg>
                </div>
              </div>

              {/* Bottom CTA - YC style */}
              <div className="text-center mt-16">
                <p className="text-sm text-linear-text-secondary mb-4">
                  Stop juggling spreadsheets and PDFs. Start seeing the complete picture.
                </p>
                <Link href="/signup">
                  <Button className="bg-linear-purple text-white px-6 py-2.5 text-sm font-medium rounded-lg hover:bg-linear-purple/90 transition-all">
                    Import Your Data
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16 bg-gradient-to-r from-linear-card/20 via-linear-card/10 to-linear-card/20 border-y border-linear-border/50">
          <div className="container mx-auto px-4 sm:px-6">
            {/* Companies/Users trust badge */}
            <div className="mb-12 text-center">
              <p className="text-sm text-linear-text-tertiary mb-6">Trusted by fitness professionals worldwide</p>
              <div className="flex justify-center items-center gap-8 opacity-60">
                <div className="text-lg font-semibold text-linear-text-secondary">10K+ Users</div>
                <div className="h-1 w-1 bg-linear-text-tertiary rounded-full"></div>
                <div className="text-lg font-semibold text-linear-text-secondary">2M+ Logs</div>
                <div className="h-1 w-1 bg-linear-text-tertiary rounded-full"></div>
                <div className="text-lg font-semibold text-linear-text-secondary">4.9★ Rating</div>
              </div>
            </div>
            
            {/* Key metrics with better visual hierarchy */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="group">
                <div className="bg-gradient-to-br from-linear-text via-linear-text to-linear-text-secondary bg-clip-text text-transparent text-4xl md:text-5xl font-bold mb-2">
                  10,000+
                </div>
                <div className="text-sm text-linear-text-secondary">Active users</div>
              </div>
              <div className="group">
                <div className="bg-gradient-to-br from-linear-text via-linear-text to-linear-text-secondary bg-clip-text text-transparent text-4xl md:text-5xl font-bold mb-2">
                  2M+
                </div>
                <div className="text-sm text-linear-text-secondary">Measurements logged</div>
              </div>
              <div className="group">
                <div className="bg-gradient-to-br from-linear-text via-linear-text to-linear-text-secondary bg-clip-text text-transparent text-4xl md:text-5xl font-bold mb-2">
                  4.9/5
                </div>
                <div className="text-sm text-linear-text-secondary">App Store rating</div>
              </div>
              <div className="group">
                <div className="bg-gradient-to-br from-linear-text via-linear-text to-linear-text-secondary bg-clip-text text-transparent text-4xl md:text-5xl font-bold mb-2">
                  30 sec
                </div>
                <div className="text-sm text-linear-text-secondary">Average log time</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features-grid" className="py-24 md:py-32" aria-labelledby="features-heading">
          <div className="container mx-auto px-4 sm:px-6">
            {/* Section header */}
            <div className="mb-20 text-center">
              <Badge className="mb-6 bg-linear-purple/10 text-white border-linear-purple/20">
                Core Features
              </Badge>
              <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-linear-text">
                Everything you need to
                <br />
                <span className="bg-gradient-to-r from-linear-text via-linear-purple to-linear-text bg-clip-text text-transparent">
                  track real progress
                </span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-linear-text-secondary">
                Professional-grade body composition tracking with the simplicity of a modern app.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" role="list">
              <div id="advanced-analytics" className="group relative rounded-2xl border border-linear-border/50 bg-gradient-to-br from-linear-card/50 to-transparent p-8 transition-all duration-300 hover:border-linear-purple/30 hover:bg-linear-card/30" role="listitem">
                <div className="mb-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-linear-purple/10 transition-colors group-hover:bg-linear-purple/20">
                    <BarChart3 className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                </div>
                <h3 className="mb-3 text-lg font-semibold text-linear-text">Advanced Analytics</h3>
                <p className="text-sm text-linear-text-secondary leading-relaxed">
                  See what&apos;s really changing. Track body fat percentage, FFMI, and lean mass with scientific precision.
                </p>
              </div>
              
              <div id="progress-photos-grid" className="group relative rounded-2xl border border-linear-border/50 bg-gradient-to-br from-linear-card/50 to-transparent p-8 transition-all duration-300 hover:border-linear-purple/30 hover:bg-linear-card/30" role="listitem">
                <div className="mb-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-linear-purple/10 transition-colors group-hover:bg-linear-purple/20">
                    <Camera className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                </div>
                <h3 className="mb-3 text-lg font-semibold text-linear-text">Progress Photos</h3>
                <p className="text-sm text-linear-text-secondary leading-relaxed">
                  Automated photo reminders with consistent angles. Side-by-side comparisons that show real progress.
                </p>
              </div>
              
              <div id="health-app-sync" className="group relative rounded-2xl border border-linear-border/50 bg-gradient-to-br from-linear-card/50 to-transparent p-8 transition-all duration-300 hover:border-linear-purple/30 hover:bg-linear-card/30" role="listitem">
                <div className="mb-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-linear-purple/10 transition-colors group-hover:bg-linear-purple/20">
                    <Smartphone className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                </div>
                <h3 className="mb-3 text-lg font-semibold text-linear-text">Health App Sync</h3>
                <p className="text-sm text-linear-text-secondary leading-relaxed">
                  Auto-imports from Apple Health and Google Fit. Zero manual entry, always up to date.
                </p>
              </div>
              
              <div id="progress-insights" className="group relative rounded-2xl border border-linear-border/50 bg-gradient-to-br from-linear-card/50 to-transparent p-8 transition-all duration-300 hover:border-linear-purple/30 hover:bg-linear-card/30" role="listitem">
                <div className="mb-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-linear-purple/10 transition-colors group-hover:bg-linear-purple/20">
                    <TrendingUp className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                </div>
                <h3 className="mb-3 text-lg font-semibold text-linear-text">Progress Insights</h3>
                <p className="text-sm text-linear-text-secondary leading-relaxed">
                  Intelligent trend analysis and predictions. Spot patterns before they become problems.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Features Section */}
        <section id="main-features" className="py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-4 text-center">
              <Badge className="mb-4 bg-linear-purple/10 text-white border-linear-purple/20 inline-block">
                Used by 10,000+ users
              </Badge>
            </div>
            <h2 className="mb-8 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-linear-text text-center">
              Finally see if your
              <br />
              workout plan works
            </h2>
            <p className="mb-12 max-w-2xl mx-auto text-base sm:text-lg text-linear-text-secondary text-center">
              Stop guessing. Start measuring.
              Track the metrics that actually matter for body composition.
            </p>
            
            {/* Feature cards */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {appFeatures.map((feature, index) => (
                <div
                  key={index}
                  id={slugify(feature.title)}
                  className="group rounded-lg border border-linear-border bg-linear-card p-6 transition-colors hover:border-linear-text-tertiary"
                >
                  <feature.icon className="mb-4 h-8 w-8 text-white" />
                  <h3 className="mb-2 text-lg font-semibold text-linear-text">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-linear-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Feature Section */}
        <section id="timeline-feature" className="relative py-20 md:py-32 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              {/* Content */}
              <div className="order-2 lg:order-1">
                <Badge className="mb-4 bg-linear-purple/10 text-white border-linear-purple/20 inline-block">
                  Game-changing feature
                </Badge>
                <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-linear-text">
                  Your body&apos;s time machine
                </h2>
                <p className="mb-8 text-lg sm:text-xl text-linear-text-secondary">
                  Slide through time. See exactly how you looked on any date. 
                  Body fat, weight, FFMI — with photos to prove it.
                </p>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-linear-purple/10">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-lg font-semibold text-linear-text">
                        Instant time travel
                      </h3>
                      <p className="text-linear-text-secondary">
                        Drag the slider. Jump to any date. See your exact stats and photo from that day.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-linear-purple/10">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-lg font-semibold text-linear-text">
                        Visual proof
                      </h3>
                      <p className="text-linear-text-secondary">
                        Every data point paired with your progress photo. No more guessing if you&apos;ve changed.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-linear-purple/10">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-lg font-semibold text-linear-text">
                        Spot patterns instantly
                      </h3>
                      <p className="text-linear-text-secondary">
                        See when you peaked. When you plateaued. What actually worked.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Visual Demo */}
              <div className="order-1 lg:order-2">
                <div className="relative">
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-linear-purple/20 via-transparent to-transparent blur-3xl" />
                  
                  {/* Interactive timeline demo */}
                  <LandingTimelineDemo />
                </div>
              </div>
            </div>
          </div>
        </section>

        <StepTrackerSection />

        <LandingPredictionSection />

        {/* Cross-Platform Section */}
        <section className="py-20 md:py-32 bg-linear-card/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-6xl">
              <div className="mb-16 text-center">
                <Badge className="mb-6 bg-linear-purple/10 text-white border-linear-purple/20 inline-block">
                  Available Everywhere
                </Badge>
                <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-linear-text">
                  Your data follows you
                  <br />
                  <span className="bg-gradient-to-r from-linear-text via-linear-purple to-linear-text bg-clip-text text-transparent">
                    everywhere you go
                  </span>
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-linear-text-secondary">
                  Whether you&apos;re at home, in the gym, or traveling, LogYourBody works seamlessly 
                  across all your devices with real-time sync.
                </p>
              </div>

              <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                {/* Visual Content */}
                <div className="relative">
                  {/* Device mockups */}
                  <div className="relative">
                    {/* Desktop mockup */}
                    <div className="rounded-2xl border border-linear-border/50 bg-linear-card/50 backdrop-blur-sm p-6 shadow-xl">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex gap-2">
                          <div className="h-3 w-3 rounded-full bg-red-500/60"></div>
                          <div className="h-3 w-3 rounded-full bg-yellow-500/60"></div>
                          <div className="h-3 w-3 rounded-full bg-green-500/60"></div>
                        </div>
                        <div className="flex-1 text-center">
                          <div className="h-4 w-48 rounded bg-linear-border/30 mx-auto"></div>
                        </div>
                      </div>
                      <div className="aspect-[16/10] bg-gradient-to-br from-linear-purple/10 to-linear-purple/5 rounded-lg border border-linear-border/30 flex items-center justify-center">
                        <div className="text-center">
                          <Monitor className="h-12 w-12 text-white/50 mx-auto mb-3" />
                          <p className="text-sm text-linear-text-secondary">Web Dashboard</p>
                        </div>
                      </div>
                    </div>

                    {/* Mobile mockup - positioned to overlap */}
                    <div className="absolute -bottom-8 -right-8 w-48 rounded-2xl border border-linear-border/50 bg-linear-card/80 backdrop-blur-sm p-4 shadow-xl">
                      <div className="mb-3 flex justify-center">
                        <div className="h-1 w-12 rounded-full bg-linear-border/50"></div>
                      </div>
                      <div className="aspect-[9/16] bg-gradient-to-br from-linear-purple/10 to-linear-purple/5 rounded-lg border border-linear-border/30 flex items-center justify-center">
                        <div className="text-center">
                          <Smartphone className="h-8 w-8 text-white/50 mx-auto mb-2" />
                          <p className="text-xs text-linear-text-secondary">Mobile App</p>
                        </div>
                      </div>
                    </div>

                    {/* Sync indicator */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="bg-linear-bg/90 backdrop-blur-sm border border-linear-border/50 rounded-full p-3 shadow-lg">
                        <Zap className="h-6 w-6 text-white animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-8">
                  <div>
                    <h3 className="mb-4 text-2xl font-bold text-linear-text">
                      One app, every platform
                    </h3>
                    <p className="text-lg text-linear-text-secondary mb-6">
                      Log your metrics on your phone at the gym, review progress on your laptop at home, 
                      or check trends on your tablet anywhere. Your data syncs instantly across all devices.
                    </p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-linear-purple/10">
                        <Smartphone className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="mb-1 font-semibold text-linear-text">
                          Native Mobile Apps
                        </h4>
                        <p className="text-sm text-linear-text-secondary">
                          Full-featured iOS and Android apps with offline support and HealthKit integration.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-linear-purple/10">
                        <Monitor className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="mb-1 font-semibold text-linear-text">
                          Web Dashboard
                        </h4>
                        <p className="text-sm text-linear-text-secondary">
                          Powerful web interface perfect for detailed analysis and data management.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-linear-purple/10">
                        <Tablet className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="mb-1 font-semibold text-linear-text">
                          Tablet Optimized
                        </h4>
                        <p className="text-sm text-linear-text-secondary">
                          Perfect for coaching sessions and reviewing progress with larger charts and graphs.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-linear-purple/10">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="mb-1 font-semibold text-linear-text">
                          Real-time Sync
                        </h4>
                        <p className="text-sm text-linear-text-secondary">
                          Log on one device, see it instantly on all others. No manual syncing required.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-linear-border/50 bg-linear-bg/50 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Download className="h-5 w-5 text-white" />
                      <h4 className="font-semibold text-linear-text">Get started today</h4>
                    </div>
                    <p className="text-sm text-linear-text-secondary mb-4">
                      Download the app or sign up on the web. Your account works everywhere from day one.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href="/signup">
                        <Button
                          className="bg-linear-text text-linear-bg hover:bg-linear-text-secondary transition-colors"
                        >
                          Start Free Trial
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="border-linear-border text-linear-text-secondary hover:bg-linear-border/30 hover:text-linear-text"
                        onClick={() => window.open("https://apps.apple.com/app/logyourbody", "_blank")}
                      >
                        <Smartphone className="h-4 w-4 mr-2" />
                        Download App
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container mx-auto px-4 sm:px-6 py-20">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-linear-text">
              Less than your protein powder
            </h2>
            <p className="text-lg sm:text-xl text-linear-text-secondary">
              3 days free. Then $5.83/month. Cancel anytime.
            </p>
          </div>

          {/* Billing Toggle */}
          <div
            className="not-prose mb-12 flex items-center justify-center gap-4"
            role="group"
            aria-labelledby="billing-toggle-label"
          >
            <span id="billing-toggle-label" className="sr-only">
              Choose billing frequency
            </span>
            <span
              className={`text-lg font-medium ${!isAnnual ? "text-linear-text" : "text-linear-text-tertiary"}`}
              id="monthly-label"
            >
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="focus:ring-2 focus:ring-linear-purple/50 data-[state=checked]:bg-linear-purple"
              aria-labelledby="monthly-label annual-label"
              aria-describedby="billing-savings"
            />
            <span
              className={`text-lg font-medium ${isAnnual ? "text-linear-text" : "text-linear-text-tertiary"}`}
              id="annual-label"
            >
              Annual
            </span>
            {isAnnual && (
              <Badge
                id="billing-savings"
                className="ml-2 border-green-200 bg-green-100 text-green-800"
                role="status"
              >
                Save {pricing.annual.savingsPercent}%
              </Badge>
            )}
          </div>

          {/* Single Pricing Card */}
          <div className="not-prose mx-auto max-w-md">
            <Card
              className="relative border-linear-border bg-linear-card shadow-xl ring-1 ring-linear-border focus-within:ring-2 focus-within:ring-linear-purple/50"
              role="region"
              aria-labelledby="pricing-title"
              aria-describedby="pricing-description"
            >
              <Badge
                className="absolute -top-3 left-1/2 -translate-x-1/2 transform bg-linear-purple text-white"
                role="status"
              >
                3-Day Free Trial
              </Badge>
              <CardHeader className="text-center">
                <CardTitle id="pricing-title" className="text-2xl text-linear-text">
                  Full Access
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-linear-text transition-all duration-300 ease-in-out">
                    <span className="sr-only">Price: </span>${currentPlan.price}
                  </span>
                  <span className="text-linear-text-secondary transition-all duration-300 ease-in-out">
                    /{currentPlan.period}
                  </span>
                </div>
                {isAnnual && (
                  <div className="mt-2 transition-all duration-300 ease-in-out">
                    <span className="text-sm text-linear-text-tertiary">
                      ${pricing.annual.monthlyEquivalent}/month when billed
                      annually
                    </span>
                    <div className="text-sm font-medium text-green-500">
                      Save ${pricing.annual.savings} vs monthly billing
                    </div>
                  </div>
                )}
                <CardDescription
                  id="pricing-description"
                  className="mt-4 text-base text-linear-text-secondary"
                >
                  Everything you need to track real progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="mb-6 space-y-3">
                  {features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center text-linear-text"
                    >
                      <Check
                        className="mr-3 h-5 w-5 text-white"
                        aria-hidden="true"
                      />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button
                    className="w-full bg-linear-text text-linear-bg hover:bg-linear-text-secondary focus:ring-2 focus:ring-linear-purple/50 transition-colors"
                    aria-describedby="trial-terms"
                  >
                    Start 3-Day Free Trial
                  </Button>
                </Link>
                <p
                  id="trial-terms"
                  className="mt-3 text-center text-xs text-linear-text-tertiary"
                >
                  No credit card required • Cancel anytime
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="py-16 md:py-24" aria-labelledby="integrations-heading">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl text-center">
              {/* Clean Header */}
              <div className="mb-8">
                <h2 id="integrations-heading" className="text-2xl sm:text-3xl font-semibold text-linear-text mb-2">
                  Integrates with everything
                </h2>
                <p className="text-linear-text-secondary">
                  Sync your data seamlessly across all your fitness apps
                </p>
              </div>

              {/* Overlapping Logos Row */}
              <div className="relative mx-auto mb-8 flex items-center justify-center">
                {/* Connection line */}
                <div className="absolute left-1/2 h-px w-64 -translate-x-1/2 bg-gradient-to-r from-transparent via-linear-border to-transparent" />
                
                {/* Apple Health - Center */}
                <div className="relative z-20 mx-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-linear-bg bg-gradient-to-br from-red-500 to-pink-500 shadow-xl">
                    <svg className="h-9 w-9 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1.5-13h-3v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                    </svg>
                  </div>
                  <p className="mt-2 text-sm font-medium text-linear-text">Apple Health</p>
                </div>

                {/* Left side apps */}
                <div className="absolute left-1/2 flex -translate-x-[140px]">
                  <div className="relative -mr-3 transition-transform hover:z-10 hover:-translate-y-1">
                    <div className="h-12 w-12 rounded-full border-3 border-linear-bg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">MFP</span>
                    </div>
                  </div>
                  <div className="relative -mr-3 transition-transform hover:z-10 hover:-translate-y-1">
                    <div className="h-12 w-12 rounded-full border-3 border-linear-bg bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">S</span>
                    </div>
                  </div>
                  <div className="relative transition-transform hover:z-10 hover:-translate-y-1">
                    <div className="h-12 w-12 rounded-full border-3 border-linear-bg bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">G</span>
                    </div>
                  </div>
                </div>

                {/* Right side apps */}
                <div className="absolute left-1/2 flex translate-x-[44px]">
                  <div className="relative -mr-3 transition-transform hover:z-10 hover:-translate-y-1">
                    <div className="h-12 w-12 rounded-full border-3 border-linear-bg bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">F</span>
                    </div>
                  </div>
                  <div className="relative -mr-3 transition-transform hover:z-10 hover:-translate-y-1">
                    <div className="h-12 w-12 rounded-full border-3 border-linear-bg bg-gradient-to-br from-gray-700 to-gray-800 shadow-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">W</span>
                    </div>
                  </div>
                  <div className="relative transition-transform hover:z-10 hover:-translate-y-1">
                    <div className="h-12 w-12 rounded-full border-3 border-linear-bg bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">O</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simple text */}
              <p className="text-sm text-linear-text-tertiary">
                MyFitnessPal • Strava • Garmin • Fitbit • Whoop • Oura • and many more
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-linear-purple/5 via-transparent to-linear-purple/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(94,106,210,0.1),transparent)]" />
          
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-8 bg-linear-purple/10 text-white border-linear-purple/20">
                Ready to get started?
              </Badge>
              <h2 className="mb-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-linear-text">
                Start tracking what 
                <br />
                <span className="bg-gradient-to-r from-linear-text via-linear-purple to-linear-text bg-clip-text text-transparent">
                  really matters
                </span>
              </h2>
              <p className="mx-auto mb-12 max-w-2xl text-lg sm:text-xl text-linear-text-secondary leading-relaxed">
                Join 10,000+ people who&apos;ve discovered the difference accurate body composition tracking makes.
                Stop guessing, start measuring.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <Link href="/signup">
                  <Button
                    className="bg-linear-text text-linear-bg px-8 py-4 text-base font-medium rounded-xl hover:bg-linear-text-secondary transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    Start Tracking Today
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    variant="ghost"
                    className="border border-linear-border/50 text-linear-text-secondary hover:bg-linear-border/30 hover:text-linear-text px-8 py-4 text-base rounded-xl transition-all backdrop-blur-sm"
                  >
                    Learn more
                  </Button>
                </Link>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-linear-text-tertiary">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-white" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-white" />
                  <span>3-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-white" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}