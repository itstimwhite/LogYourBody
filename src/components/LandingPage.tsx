import React, { useState } from "react";
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
  Star,
  Check,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { VersionDisplay } from "@/components/VersionDisplay";

export function LandingPage() {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(true); // Default to annual for savings

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

  const testimonials = [
    {
      name: "Sarah C.",
      role: "Lost 15% body fat",
      content:
        "Finally saw I was gaining muscle while losing fat. The scale alone would've discouraged me.",
      rating: 5,
    },
    {
      name: "Mike R.",
      role: "Personal Trainer",
      content:
        "I use this with all my clients. They actually stick to logging because it's so fast.",
      rating: 5,
    },
    {
      name: "Dr. Emily W.",
      role: "Sports Medicine",
      content:
        "The FFMI tracking alone makes this worth it. My athletes can see their genetic potential.",
      rating: 5,
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

  return (
    <div className="min-h-screen bg-linear-bg font-inter">
      {/* Skip Links */}
      <div className="sr-only z-50 focus:not-sr-only focus:absolute focus:left-4 focus:top-4">
        <button
          className="rounded bg-linear-purple px-4 py-2 text-linear-text focus:ring-2 focus:ring-linear-purple/50"
          onClick={() => document.getElementById("main-content")?.focus()}
        >
          Skip to main content
        </button>
      </div>
      {/* Header */}
      <header className="border-b border-linear-border" role="banner">
        <div className="container mx-auto px-6 py-4">
          <nav
            className="flex items-center justify-between"
            role="navigation"
            aria-label="Main navigation"
          >
            <div className="flex items-center space-x-8">
              <div className="text-xl font-semibold text-linear-text">
                LogYourBody
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <button className="text-sm text-linear-text-secondary hover:text-linear-text transition-colors">Product</button>
                <button className="text-sm text-linear-text-secondary hover:text-linear-text transition-colors">Resources</button>
                <button className="text-sm text-linear-text-secondary hover:text-linear-text transition-colors">Pricing</button>
                <button className="text-sm text-linear-text-secondary hover:text-linear-text transition-colors">Contact</button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/login")}
                aria-label="Sign in to your account"
                className="text-sm text-linear-text-secondary hover:text-linear-text"
              >
                Log in
              </Button>
              <Button
                onClick={() => navigate("/login")}
                aria-label="Start your 3-day free trial"
                className="bg-linear-text text-linear-bg text-sm font-medium px-5 py-2 rounded-lg hover:bg-linear-text/90 transition-colors"
              >
                Sign up
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" tabIndex="-1">
        {/* Hero Section */}
        <section
          className="relative py-32"
          role="banner"
          aria-labelledby="hero-heading"
        >
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-4xl text-center">
              <h1
                id="hero-heading"
                className="mb-6 text-6xl font-bold tracking-tight text-linear-text md:text-7xl"
              >
                Illuminate your gains
              </h1>
              <p className="mx-auto mb-12 max-w-2xl text-lg text-linear-text-secondary">
                Track body fat, muscle mass, and FFMI. Not just weight.
                Used by 10,000+ fitness professionals.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button
                  className="bg-linear-text text-linear-bg px-6 py-3 text-sm font-medium rounded-lg hover:bg-linear-text/90 transition-colors"
                  onClick={() => navigate("/login")}
                >
                  Try free for 3 days
                </Button>
                <button
                  className="flex items-center gap-2 text-sm text-linear-text-secondary hover:text-linear-text transition-colors"
                  aria-label="View live demo"
                >
                  See it in action
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-12 border-y border-linear-border">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-linear-text">10,000+</div>
                <div className="text-sm text-linear-text-secondary">Active users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-linear-text">2M+</div>
                <div className="text-sm text-linear-text-secondary">Measurements logged</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-linear-text">4.9/5</div>
                <div className="text-sm text-linear-text-secondary">App Store rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-linear-text">30 sec</div>
                <div className="text-sm text-linear-text-secondary">Average log time</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20" aria-labelledby="features-heading">
          <div className="container mx-auto px-6">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4" role="list">
              <div className="space-y-3" role="listitem">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-linear-purple" aria-hidden="true" />
                  <h3 className="text-base font-medium text-linear-text">Advanced Analytics</h3>
                </div>
                <p className="text-sm text-linear-text-secondary leading-relaxed">
                  See what's really changing. Not just weight.
                </p>
              </div>
              <div className="space-y-3" role="listitem">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-linear-purple" aria-hidden="true" />
                  <h3 className="text-base font-medium text-linear-text">Progress Photos</h3>
                </div>
                <p className="text-sm text-linear-text-secondary leading-relaxed">
                  Side-by-side comparisons that show real progress.
                </p>
              </div>
              <div className="space-y-3" role="listitem">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-linear-purple" aria-hidden="true" />
                  <h3 className="text-base font-medium text-linear-text">Health App Sync</h3>
                </div>
                <p className="text-sm text-linear-text-secondary leading-relaxed">
                  Auto-imports from your health apps. Zero manual entry.
                </p>
              </div>
              <div className="space-y-3" role="listitem">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-linear-purple" aria-hidden="true" />
                  <h3 className="text-base font-medium text-linear-text">Progress Insights</h3>
                </div>
                <p className="text-sm text-linear-text-secondary leading-relaxed">
                  Spot trends before they become problems.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Features Section */}
        <section className="py-32">
          <div className="container mx-auto px-6">
            <div className="mb-4">
              <Badge className="mb-4 bg-linear-purple/10 text-linear-purple border-linear-purple/20">
                Used by 10,000+ users
              </Badge>
            </div>
            <h2 className="mb-8 text-6xl font-bold tracking-tight text-linear-text">
              Finally see if your
              <br />
              workout plan works
            </h2>
            <p className="mb-12 max-w-2xl text-lg text-linear-text-secondary">
              Stop guessing. Start measuring.
              Track the metrics that actually matter for body composition.
            </p>
            
            {/* Feature cards */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {appFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="group rounded-lg border border-linear-border bg-linear-card p-6 transition-colors hover:border-linear-text-tertiary"
                >
                  <feature.icon className="mb-4 h-8 w-8 text-linear-purple" />
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

        {/* Pricing Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-5xl font-bold tracking-tight text-linear-text">
              Less than your protein powder
            </h2>
            <p className="text-xl text-linear-text-secondary">
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
                <ul className="mb-6 space-y-3" role="list">
                  {features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center text-linear-text"
                      role="listitem"
                    >
                      <Check
                        className="mr-3 h-5 w-5 text-linear-purple"
                        aria-hidden="true"
                      />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-linear-text text-linear-bg hover:bg-linear-text/90 focus:ring-2 focus:ring-linear-text/20"
                  onClick={() => navigate("/login")}
                  aria-describedby="trial-terms"
                >
                  Start Free Trial
                </Button>
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

        {/* CTA Section */}
        <section className="py-32 text-center">
          <div className="container mx-auto px-6">
            <h2 className="mb-4 text-5xl font-bold tracking-tight text-linear-text">
              Start tracking what matters.
              <br />
              Stop guessing.
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-linear-text-secondary">
              Join 10,000+ people finally seeing real progress.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                className="bg-linear-text text-linear-bg px-8 py-4 text-base font-medium rounded-lg hover:bg-linear-text/90 transition-colors"
                onClick={() => navigate("/login")}
              >
                Try free for 3 days
              </Button>
              <Button
                variant="ghost"
                className="text-linear-text-secondary hover:text-linear-text px-8 py-4 text-base"
                onClick={() => navigate("/login")}
              >
                View demo
              </Button>
            </div>
            <p className="mt-4 text-sm text-linear-text-tertiary">
              No credit card • 3-day trial • Cancel anytime
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-linear-border py-12 font-inter" role="contentinfo">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-8">
            <h3 className="mb-4 text-2xl font-bold text-linear-text">
              LogYourBody
            </h3>
            <p className="mx-auto max-w-md text-linear-text-secondary">
              Professional body composition tracking for fitness enthusiasts and
              health professionals.
            </p>
          </div>
          <div className="mb-8 flex justify-center space-x-8">
            <Button variant="ghost" onClick={() => navigate("/privacy")} className="text-linear-text-secondary hover:text-linear-text">
              Privacy Policy
            </Button>
            <Button variant="ghost" onClick={() => navigate("/terms")} className="text-linear-text-secondary hover:text-linear-text">
              Terms of Service
            </Button>
            <Button variant="ghost" onClick={() => navigate("/changelog")} className="text-linear-text-secondary hover:text-linear-text">
              Changelog
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.open("mailto:support@logyourbody.com")}
              className="text-linear-text-secondary hover:text-linear-text"
            >
              Contact Support
            </Button>
          </div>
          <div className="flex flex-col items-center gap-4">
            <VersionDisplay />
            <p className="text-sm text-linear-text-tertiary">
              © 2024 LogYourBody. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
