'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
  Scale,
  Percent,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { LandingTimelineDemo } from "@/components/LandingTimelineDemo";
import { StepTrackerSection } from "@/components/StepTrackerModule";
import { LandingPredictionSection } from "@/components/LandingPredictionSection";
import { FeaturesFlyout } from "@/components/FeaturesFlyout";
import { SupabaseStatusBanner } from "@/components/SupabaseStatusBanner";

export default function HomePage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

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
      title: "Body Composition Analytics",
      description:
        "Professional-grade tracking. See what's actually changing beyond the scale.",
    },
    {
      icon: TrendingUp,
      title: "Aesthetic Intelligence",
      description:
        "FFMI calculations and predictive modeling. Know your peak potential.",
    },
    {
      icon: Camera,
      title: "Visual Progress System",
      description:
        "Consistent angles. Side-by-side comparisons. The truth in pixels.",
    },
    {
      icon: Smartphone,
      title: "Unified Data Pipeline",
      description:
        "Import DEXA scans, smart scales, Apple Health. One source of truth.",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description:
        "Your transformation is personal. Encrypted, exportable, deletable.",
    },
    {
      icon: Clock,
      title: "Efficiency Engineered",
      description:
        "Log complete metrics in 30 seconds. Spend your time in the gym, not the app.",
    },
  ];

  const currentPlan = isAnnual ? pricing.annual : pricing.monthly;

  const features = [
    "Professional body composition tracking",
    "FFMI & aesthetic potential analysis",
    "Automated progress photo system",
    "Multi-source data import",
    "Predictive trend modeling",
    "Weekly transformation reports",
    "Export everything, anytime",
    "Zero ads, ever",
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
    <div className="min-h-screen bg-[#08090a] font-inter">
      <SupabaseStatusBanner />
      
      {/* Header */}
      <header className="border-b border-[#1a1b1e]" role="banner">
        <div className="max-w-[1280px] mx-auto px-6 py-4">
          <nav
            className="flex items-center justify-between"
            role="navigation"
            aria-label="Main navigation"
          >
            <div className="flex items-center space-x-8">
              <div className="text-lg font-semibold text-white">
                LogYourBody
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <FeaturesFlyout onFeatureClick={handleFeatureClick} />
                <button
                  className="text-sm text-white/70 hover:text-white transition-colors"
                  onClick={() => scrollToSection('pricing')}
                >
                  Pricing
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/about">
                <Button
                  variant="ghost"
                  aria-label="Learn more"
                  className="text-sm text-white/70 hover:text-white hidden sm:block"
                >
                  About
                </Button>
              </Link>
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      className="text-sm text-white/70 hover:text-white"
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    onClick={signOut}
                    className="bg-white text-[#08090a] text-sm font-medium px-5 py-2 rounded-md hover:bg-white/90 transition-colors"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="text-sm text-white/70 hover:text-white"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button
                      className="bg-white text-[#08090a] text-sm font-medium px-5 py-2 rounded-md hover:bg-white/90 transition-colors"
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" tabIndex={-1}>
        {/* Hero Section - F-Layout Pattern */}
        <section
          className="relative py-20 md:py-32"
          role="banner"
          aria-labelledby="hero-heading"
        >
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Column - Content (F-pattern primary scan area) */}
              <div className="text-left">
                <h1
                  id="hero-heading"
                  className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
                >
                  Look better naked
                </h1>
                
                <p className="text-xl text-white/70 mb-10 max-w-lg leading-relaxed">
                  Professional body composition tracking for people who care about aesthetics. 
                  Track what matters, predict your peak, achieve your ideal physique.
                </p>
                
                {/* CTAs - Horizontal for F-pattern */}
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                  <Link href="/signup">
                    <Button
                      className="bg-[#5E6AD2] text-white px-6 py-3 text-base font-medium rounded-md hover:bg-[#5E6AD2]/90 transition-all"
                    >
                      Start Free Trial
                    </Button>
                  </Link>
                  <Link href="#timeline-feature">
                    <Button
                      variant="outline"
                      className="border-[#1a1b1e] text-white/70 hover:bg-[#1a1b1e]/30 hover:text-white px-6 py-3 text-base rounded-md"
                    >
                      See it in action
                    </Button>
                  </Link>
                </div>
                
                {/* Trust indicators - Supporting F-pattern scan */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-white/50">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    <span>10,000+ transformations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    <span>4.9★ App Store</span>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Visual (F-pattern secondary area) */}
              <div className="relative">
                <div className="rounded-md bg-[#0f1011] border border-[#1a1b1e] p-6">
                  <div className="aspect-[4/3] bg-[#08090a] rounded-md border border-[#1a1b1e] relative overflow-hidden">
                    {/* Mock dashboard preview */}
                    <div className="absolute inset-0 p-6">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="h-2 w-24 bg-[#1a1b1e] rounded"></div>
                        <div className="flex gap-2">
                          <div className="h-6 w-6 bg-[#1a1b1e] rounded"></div>
                          <div className="h-6 w-6 bg-[#1a1b1e] rounded"></div>
                        </div>
                      </div>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-[#0f1011] rounded-md p-3 border border-[#1a1b1e]">
                          <div className="flex items-center gap-2 mb-2">
                            <Scale className="h-3 w-3 text-white/50" />
                            <div className="h-1.5 w-12 bg-[#1a1b1e] rounded"></div>
                          </div>
                          <div className="h-6 w-16 bg-[#1a1b1e] rounded"></div>
                        </div>
                        <div className="bg-[#0f1011] rounded-md p-3 border border-[#1a1b1e]">
                          <div className="flex items-center gap-2 mb-2">
                            <Percent className="h-3 w-3 text-white/50" />
                            <div className="h-1.5 w-12 bg-[#1a1b1e] rounded"></div>
                          </div>
                          <div className="h-6 w-16 bg-[#1a1b1e] rounded"></div>
                        </div>
                      </div>
                      
                      {/* Chart Area */}
                      <div className="bg-[#0f1011] rounded-md p-3 border border-[#1a1b1e]">
                        <div className="flex items-end justify-between h-20 gap-1">
                          {[40, 60, 45, 70, 65, 80, 75].map((height, i) => (
                            <div key={i} className="flex-1 bg-[#5E6AD2]/20 rounded-t" style={{ height: `${height}%` }}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating badges */}
                    <div className="absolute top-4 right-4 bg-green-500/90 text-white text-xs px-2 py-1 rounded-md">
                      Live data
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem/Solution Section - Apple style storytelling */}
        <section className="py-20 md:py-32">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4 leading-[1.2]">
                  Your transformation data.
                  <br />
                  <span className="text-white/70">Finally unified.</span>
                </h2>
                <p className="text-lg text-white/70 max-w-3xl mx-auto leading-relaxed">
                  Stop juggling PDFs, spreadsheets, and scattered apps. 
                  See your complete body composition story in one intelligent timeline.
                </p>
              </div>

              {/* Visual representation */}
              <div className="relative mx-auto max-w-4xl">
                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  {/* Before - Fragmented */}
                  <div className="space-y-4">
                    <div className="text-right">
                      <div className="inline-flex items-center gap-3 text-sm text-white/70">
                        <span>DEXA scan PDFs</span>
                        <div className="h-8 w-8 rounded-md bg-[#0f1011] border border-[#1a1b1e] flex items-center justify-center">
                          <div className="h-1.5 w-1.5 bg-[#5E6AD2] rounded-full animate-pulse" />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-3 text-sm text-white/70">
                        <span>Scale measurements</span>
                        <div className="h-8 w-8 rounded-md bg-[#0f1011] border border-[#1a1b1e] flex items-center justify-center">
                          <div className="h-1.5 w-1.5 bg-[#5E6AD2] rounded-full animate-pulse" />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-3 text-sm text-white/70">
                        <span>Progress photos</span>
                        <div className="h-8 w-8 rounded-md bg-[#0f1011] border border-[#1a1b1e] flex items-center justify-center">
                          <div className="h-1.5 w-1.5 bg-[#5E6AD2] rounded-full animate-pulse" />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-3 text-sm text-white/70">
                        <span>Gym measurements</span>
                        <div className="h-8 w-8 rounded-md bg-[#0f1011] border border-[#1a1b1e] flex items-center justify-center">
                          <div className="h-1.5 w-1.5 bg-[#5E6AD2] rounded-full animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LogYourBody hub */}
                  <div className="relative">
                    <div className="mx-auto h-32 w-32 rounded-2xl bg-[#5E6AD2] flex items-center justify-center">
                      <BarChart3 className="h-16 w-16 text-white" />
                    </div>
                    <p className="text-center mt-4 font-semibold text-white">LogYourBody</p>
                  </div>

                  {/* After - Unified insights */}
                  <div className="space-y-4">
                    <div className="text-left">
                      <div className="inline-flex items-center gap-3 text-sm text-white">
                        <div className="h-8 w-8 rounded-md bg-[#5E6AD2]/10 flex items-center justify-center">
                          <Check className="h-4 w-4 text-[#5E6AD2]" />
                        </div>
                        <span>Complete timeline</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="inline-flex items-center gap-3 text-sm text-white">
                        <div className="h-8 w-8 rounded-md bg-[#5E6AD2]/10 flex items-center justify-center">
                          <Check className="h-4 w-4 text-[#5E6AD2]" />
                        </div>
                        <span>Aesthetic analytics</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="inline-flex items-center gap-3 text-sm text-white">
                        <div className="h-8 w-8 rounded-md bg-[#5E6AD2]/10 flex items-center justify-center">
                          <Check className="h-4 w-4 text-[#5E6AD2]" />
                        </div>
                        <span>Peak predictions</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="inline-flex items-center gap-3 text-sm text-white">
                        <div className="h-8 w-8 rounded-md bg-[#5E6AD2]/10 flex items-center justify-center">
                          <Check className="h-4 w-4 text-[#5E6AD2]" />
                        </div>
                        <span>Photo-ready alerts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-16">
                <p className="text-sm text-white/70 mb-4">
                  The only app that shows you exactly how you'll look tomorrow.
                </p>
                <Link href="/signup">
                  <Button className="bg-[#5E6AD2] text-white px-6 py-2.5 text-sm font-medium rounded-md hover:bg-[#5E6AD2]/90 transition-all">
                    Start Tracking
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof - Refined */}
        <section className="py-16 border-y border-[#1a1b1e]">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="mb-12 text-center">
              <p className="text-sm text-white/50 mb-6">Trusted by fitness professionals and aesthetic athletes worldwide</p>
              <div className="flex justify-center items-center gap-8">
                <div className="text-lg font-semibold text-white/70">10K+ Users</div>
                <div className="h-1 w-1 bg-white/50 rounded-full"></div>
                <div className="text-lg font-semibold text-white/70">2M+ Logs</div>
                <div className="h-1 w-1 bg-white/50 rounded-full"></div>
                <div className="text-lg font-semibold text-white/70">4.9★ Rating</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="group">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-white">
                  10,000+
                </div>
                <div className="text-sm text-white/70">Active transformations</div>
              </div>
              <div className="group">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-white">
                  93%
                </div>
                <div className="text-sm text-white/70">Hit their goals</div>
              </div>
              <div className="group">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-white">
                  4.9/5
                </div>
                <div className="text-sm text-white/70">App Store rating</div>
              </div>
              <div className="group">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-white">
                  30 sec
                </div>
                <div className="text-sm text-white/70">Average log time</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid - Refined messaging */}
        <section id="features-grid" className="py-24 md:py-32" aria-labelledby="features-heading">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="mb-20 text-center">
              <Badge className="mb-6 bg-[#5E6AD2]/10 text-white border-[#5E6AD2]/20">
                Built for aesthetics
              </Badge>
              <h2 className="mb-6 text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[1.2]">
                Everything you need to
                <br />
                <span className="text-white/70">
                  achieve your ideal physique
                </span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-white/70">
                Professional tools. Consumer simplicity. Aesthetic results.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" role="list">
              {appFeatures.map((feature, index) => (
                <div
                  key={index}
                  id={slugify(feature.title)}
                  className="group relative rounded-md border border-[#1a1b1e] bg-[#0f1011] p-8 transition-all duration-300 hover:border-[#5E6AD2]/30"
                  role="listitem"
                >
                  <div className="mb-6">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[#5E6AD2]/10 transition-colors group-hover:bg-[#5E6AD2]/20">
                      <feature.icon className="h-6 w-6 text-[#5E6AD2]" aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Feature Section */}
        <section id="timeline-feature" className="relative py-20 md:py-32">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div className="order-2 lg:order-1">
                <Badge className="mb-4 bg-[#5E6AD2]/10 text-white border-[#5E6AD2]/20 inline-block">
                  Revolutionary visualization
                </Badge>
                <h2 className="mb-6 text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[1.2]">
                  Your transformation, visualized
                </h2>
                <p className="mb-8 text-lg sm:text-xl text-white/70">
                  Slide through time to see your exact physique on any date. 
                  Compare progress photos with precision metrics. Know exactly when you peaked.
                </p>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-[#5E6AD2]/10">
                      <Clock className="h-6 w-6 text-[#5E6AD2]" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-lg font-semibold text-white">
                        Time-travel your physique
                      </h3>
                      <p className="text-white/70">
                        See exactly how you looked on any date. Photos paired with precise metrics.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-[#5E6AD2]/10">
                      <Camera className="h-6 w-6 text-[#5E6AD2]" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-lg font-semibold text-white">
                        Photo-ready confidence
                      </h3>
                      <p className="text-white/70">
                        Know your best angles and peak condition. Never be surprised by how you look.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-[#5E6AD2]/10">
                      <TrendingUp className="h-6 w-6 text-[#5E6AD2]" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-lg font-semibold text-white">
                        Predict your peak
                      </h3>
                      <p className="text-white/70">
                        AI-powered predictions show exactly when you'll hit your aesthetic goals.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                <div className="relative">
                  <LandingTimelineDemo />
                </div>
              </div>
            </div>
          </div>
        </section>

        <StepTrackerSection />

        <LandingPredictionSection />

        {/* Pricing Section - Refined */}
        <section id="pricing" className="py-20">
          <div className="max-w-[1280px] mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[1.2]">
              Invest in your transformation
            </h2>
            <p className="text-lg text-white/70">
              Less than a protein shake. More valuable than a personal trainer.
            </p>
          </div>

          <div
            className="not-prose mb-12 flex items-center justify-center gap-4"
            role="group"
            aria-labelledby="billing-toggle-label"
          >
            <span id="billing-toggle-label" className="sr-only">
              Choose billing frequency
            </span>
            <span
              className={`text-lg font-medium ${!isAnnual ? "text-white" : "text-white/50"}`}
              id="monthly-label"
            >
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="focus:ring-2 focus:ring-[#5E6AD2]/50 data-[state=checked]:bg-[#5E6AD2]"
              aria-labelledby="monthly-label annual-label"
              aria-describedby="billing-savings"
            />
            <span
              className={`text-lg font-medium ${isAnnual ? "text-white" : "text-white/50"}`}
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

          <div className="not-prose mx-auto max-w-md">
            <Card
              className="relative border-[#1a1b1e] bg-[#0f1011] ring-1 ring-[#1a1b1e] focus-within:ring-2 focus-within:ring-[#5E6AD2]/50"
              role="region"
              aria-labelledby="pricing-title"
              aria-describedby="pricing-description"
            >
              <Badge
                className="absolute -top-3 left-1/2 -translate-x-1/2 transform bg-[#5E6AD2] text-white"
                role="status"
              >
                3-Day Free Trial
              </Badge>
              <CardHeader className="text-center">
                <CardTitle id="pricing-title" className="text-2xl text-white">
                  Full Access
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white transition-all duration-300 ease-in-out">
                    <span className="sr-only">Price: </span>${currentPlan.price}
                  </span>
                  <span className="text-white/70 transition-all duration-300 ease-in-out">
                    /{currentPlan.period}
                  </span>
                </div>
                {isAnnual && (
                  <div className="mt-2 transition-all duration-300 ease-in-out">
                    <span className="text-sm text-white/50">
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
                  className="mt-4 text-base text-white/70"
                >
                  Everything you need to achieve your ideal physique
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="mb-6 space-y-3">
                  {features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center text-white"
                    >
                      <Check
                        className="mr-3 h-5 w-5 text-[#5E6AD2]"
                        aria-hidden="true"
                      />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button
                    className="w-full bg-white text-[#08090a] hover:bg-white/90 focus:ring-2 focus:ring-[#5E6AD2]/50 transition-colors"
                    aria-describedby="trial-terms"
                  >
                    Start Your Transformation
                  </Button>
                </Link>
                <p
                  id="trial-terms"
                  className="mt-3 text-center text-xs text-white/50"
                >
                  No credit card required • Cancel anytime
                </p>
              </CardContent>
            </Card>
          </div>
          </div>
        </section>

        {/* CTA Section - Refined */}
        <section className="relative py-24 md:py-32">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-8 bg-[#5E6AD2]/10 text-white border-[#5E6AD2]/20">
                Ready to transform?
              </Badge>
              <h2 className="mb-6 text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[1.2]">
                Start tracking what 
                <br />
                <span className="text-white/70">
                  actually matters
                </span>
              </h2>
              <p className="mx-auto mb-12 max-w-2xl text-lg sm:text-xl text-white/70 leading-relaxed">
                Join thousands who've discovered the power of professional body composition tracking.
                Your best physique is waiting.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <Link href="/signup">
                  <Button
                    className="bg-white text-[#08090a] px-6 py-3 text-base font-medium rounded-md hover:bg-white/90 transition-all"
                  >
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    variant="ghost"
                    className="border border-[#1a1b1e] text-white/70 hover:bg-[#1a1b1e]/30 hover:text-white px-6 py-3 text-base rounded-md transition-all"
                  >
                    Learn more
                  </Button>
                </Link>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/50">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#5E6AD2]" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#5E6AD2]" />
                  <span>3-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#5E6AD2]" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}