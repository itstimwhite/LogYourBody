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
      title: "Advanced Analytics",
      description:
        "Track body fat percentage, weight, FFMI, and lean body mass with precision analytics and trends.",
    },
    {
      icon: TrendingUp,
      title: "Progress Insights",
      description:
        "Visualize your body composition changes over time with detailed charts and progress tracking.",
    },
    {
      icon: Camera,
      title: "Photo Progress",
      description:
        "Document your transformation with progress photos and visual comparison tools.",
    },
    {
      icon: Smartphone,
      title: "Health App Sync",
      description:
        "Seamlessly sync with Apple Health and Google Fit for comprehensive health tracking.",
    },
    {
      icon: Shield,
      title: "Data Privacy",
      description:
        "Your health data is encrypted and secure. We never share your personal information.",
    },
    {
      icon: Clock,
      title: "3-Day Free Trial",
      description:
        "Try all premium features free for 3 days. No credit card required to start.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Fitness Enthusiast",
      content:
        "Finally, a body composition tracker that actually makes sense. The FFMI calculations help me understand my progress beyond just weight.",
      rating: 5,
    },
    {
      name: "Mike Rodriguez",
      role: "Personal Trainer",
      content:
        "I recommend LogYourBody to all my clients. The detailed analytics help them stay motivated and track real progress.",
      rating: 5,
    },
    {
      name: "Dr. Emily Watson",
      role: "Sports Nutritionist",
      content:
        "The precision and scientific approach to body composition tracking is exactly what my patients need.",
      rating: 5,
    },
  ];

  const currentPlan = isAnnual ? pricing.annual : pricing.monthly;

  const features = [
    "Unlimited body measurements",
    "Advanced analytics & trends",
    "Progress photo tracking",
    "Health app synchronization",
    "Data export capabilities",
    "Priority customer support",
    "Detailed progress insights",
    "FFMI calculations",
  ];

  return (
    <div className="min-h-screen font-inter">
      {/* Skip Links */}
      <div className="sr-only z-50 focus:not-sr-only focus:absolute focus:left-4 focus:top-4">
        <button
          className="rounded bg-magic-blue px-4 py-2 text-mercury-white focus:ring-4 focus:ring-magic-blue/50"
          onClick={() => document.getElementById("main-content")?.focus()}
        >
          Skip to main content
        </button>
      </div>
      {/* Header */}
      <header className="theme-dark border-b border-mercury-white/10" role="banner">
        <div className="container mx-auto px-6 py-4">
          <nav
            className="flex items-center justify-between"
            role="navigation"
            aria-label="Main navigation"
          >
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold uppercase">
                <span className="sr-only">LogYourBody - </span>LOGYOURBODY
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/login")}
                aria-label="Sign in to your account"
                className="text-mercury-white hover:bg-mercury-white/10 focus:ring-4 focus:ring-magic-blue/50"
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate("/login")}
                aria-label="Start your 3-day free trial"
                className="bg-magic-blue text-mercury-white hover:bg-magic-blue/90 focus:ring-4 focus:ring-magic-blue/50"
              >
                Start Free Trial
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" tabIndex="-1">
        {/* Hero Section */}
        <section
          className="theme-dark prose relative flex min-h-[80vh] items-center justify-center overflow-hidden"
          role="banner"
          aria-labelledby="hero-heading"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')",
              filter: "grayscale(100%) contrast(1.2) brightness(0.3)",
            }}
            role="img"
            aria-label="Fitness professional using body composition tracking equipment"
          />

          {/* Enhanced overlay for better contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-nordic-gray/90 to-nordic-gray/70" />

          {/* Content */}
          <div className="container relative z-10 mx-auto px-6 py-20 text-center">
            <Badge
              className="mb-6 border-2 border-magic-blue/30 bg-magic-blue text-mercury-white shadow-lg"
              role="status"
              aria-label="Special offer: 3-day free trial available"
            >
              3-Day Free Trial Available
            </Badge>
            <h1
              id="hero-heading"
              className="not-prose mb-6 text-5xl font-extrabold leading-tight drop-shadow-lg md:text-[62px] md:leading-[72px]"
            >
              Track Your Body Composition
              <br />
              <span className="text-magic-blue drop-shadow-lg">
                With Precision
              </span>
            </h1>
            <p className="not-prose mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-mercury-white/90 drop-shadow-md">
              Professional body composition tracking for fitness enthusiasts.
              Monitor body fat percentage, weight, FFMI, and lean body mass with
              advanced analytics and insights.
            </p>
            <div className="flex justify-center">
              <Button
                size="lg"
                className="bg-magic-blue px-8 py-6 text-lg text-mercury-white shadow-lg hover:bg-magic-blue/90 focus:ring-4 focus:ring-magic-blue/50 focus:ring-offset-2 focus:ring-offset-nordic-gray"
                onClick={() => navigate("/login")}
                aria-describedby="trial-details"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
            <p
              id="trial-details"
              className="mt-4 text-sm text-mercury-white/75"
              role="note"
            >
              No credit card required • 3-day free trial • Cancel anytime
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section
          className="theme-light prose container mx-auto px-6 py-20"
          aria-labelledby="features-heading"
        >
          <div className="mb-16 text-center">
            <h2
              id="features-heading"
              className="mb-4"
            >
              Everything You Need for Body Composition Tracking
            </h2>
            <p className="mx-auto max-w-2xl text-xl">
              Professional-grade tools and analytics to help you understand and
              optimize your body composition.
            </p>
          </div>
          <div className="not-prose grid gap-8 md:grid-cols-2 lg:grid-cols-3" role="list">
            {appFeatures.map((feature, index) => (
              <Card
                key={index}
                className="border-mercury-white bg-mercury-white transition-all duration-200 focus-within:ring-2 focus-within:ring-magic-blue/50 hover:scale-105 hover:shadow-xl"
                role="listitem"
                tabIndex="0"
                aria-labelledby={`feature-title-${index}`}
                aria-describedby={`feature-desc-${index}`}
              >
                <CardHeader>
                  <feature.icon
                    className="mb-4 h-12 w-12 text-magic-blue"
                    aria-hidden="true"
                  />
                  <CardTitle id={`feature-title-${index}`} className="text-xl text-nordic-gray">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription
                    id={`feature-desc-${index}`}
                    className="text-base leading-relaxed text-text-secondary"
                  >
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section
          className="theme-dark prose py-20"
          aria-labelledby="testimonials-heading"
        >
          <div className="container mx-auto px-6">
            <div className="mb-16 text-center">
              <h2
                id="testimonials-heading"
                className="mb-4"
              >
                Trusted by Fitness Professionals
              </h2>
              <p className="text-xl text-mercury-white/80">
                See what our users say about LogYourBody
              </p>
            </div>
            <div className="not-prose grid gap-8 md:grid-cols-3" role="list">
              {testimonials.map((testimonial, index) => (
                <Card
                  key={index}
                  className="border-mercury-white/10 bg-nordic-gray/50 backdrop-blur-sm focus-within:ring-2 focus-within:ring-magic-blue/50"
                  role="listitem"
                  tabIndex="0"
                >
                  <CardContent className="pt-6">
                    <div
                      className="mb-4 flex"
                      role="img"
                      aria-label={`${testimonial.rating} out of 5 stars`}
                    >
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < testimonial.rating
                              ? "fill-magic-blue text-magic-blue"
                              : "text-mercury-white/30"
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <blockquote className="mb-4 text-base leading-relaxed text-mercury-white/90">
                      "{testimonial.content}"
                    </blockquote>
                    <cite className="not-italic">
                      <p className="font-semibold text-mercury-white">{testimonial.name}</p>
                      <p className="text-sm text-text-secondary">
                        {testimonial.role}
                      </p>
                    </cite>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="theme-light prose container mx-auto px-6 py-20">
          <div className="mb-16 text-center">
            <h2 className="mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl">
              Start your 3-day free trial today. No hidden fees.
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
              className={`text-lg font-medium ${!isAnnual ? "text-nordic-gray" : "text-text-secondary"}`}
              id="monthly-label"
            >
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="focus:ring-4 focus:ring-magic-blue/50 data-[state=checked]:bg-magic-blue"
              aria-labelledby="monthly-label annual-label"
              aria-describedby="billing-savings"
            />
            <span
              className={`text-lg font-medium ${isAnnual ? "text-nordic-gray" : "text-text-secondary"}`}
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
              className="relative border-magic-blue/20 shadow-xl ring-2 ring-magic-blue focus-within:ring-4 focus-within:ring-magic-blue/50"
              role="region"
              aria-labelledby="pricing-title"
              aria-describedby="pricing-description"
            >
              <Badge
                className="absolute -top-3 left-1/2 -translate-x-1/2 transform bg-magic-blue text-mercury-white"
                role="status"
              >
                3-Day Free Trial
              </Badge>
              <CardHeader className="text-center">
                <CardTitle id="pricing-title" className="text-2xl text-nordic-gray">
                  LogYourBody Pro
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-magic-blue transition-all duration-300 ease-in-out">
                    <span className="sr-only">Price: </span>${currentPlan.price}
                  </span>
                  <span className="text-text-secondary transition-all duration-300 ease-in-out">
                    /{currentPlan.period}
                  </span>
                </div>
                {isAnnual && (
                  <div className="mt-2 transition-all duration-300 ease-in-out">
                    <span className="text-sm text-text-secondary">
                      ${pricing.annual.monthlyEquivalent}/month when billed
                      annually
                    </span>
                    <div className="text-sm font-medium text-green-600">
                      Save ${pricing.annual.savings} vs monthly billing
                    </div>
                  </div>
                )}
                <CardDescription
                  id="pricing-description"
                  className="mt-4 text-base text-text-secondary"
                >
                  Professional body composition tracking with advanced analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="mb-6 space-y-3" role="list">
                  {features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center text-nordic-gray"
                      role="listitem"
                    >
                      <Check
                        className="mr-3 h-5 w-5 text-magic-blue"
                        aria-hidden="true"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-magic-blue text-mercury-white hover:bg-magic-blue/90 focus:ring-4 focus:ring-magic-blue/50"
                  onClick={() => navigate("/login")}
                  aria-describedby="trial-terms"
                >
                  Start Free Trial
                </Button>
                <p
                  id="trial-terms"
                  className="mt-3 text-center text-xs text-text-secondary"
                >
                  No credit card required • Cancel anytime
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="theme-dark prose bg-magic-blue py-20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="mb-4 text-mercury-white">
              Ready to Transform Your Body Composition Tracking?
            </h2>
            <p className="not-prose mx-auto mb-8 max-w-2xl text-xl text-mercury-white/90">
              Join thousands of users who trust LogYourBody for accurate,
              professional body composition analysis.
            </p>
            <Button
              size="lg"
              className="bg-mercury-white px-8 py-6 text-lg text-magic-blue hover:bg-mercury-white/90 focus:ring-4 focus:ring-mercury-white/50"
              onClick={() => navigate("/login")}
            >
              Start Your 3-Day Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="not-prose mt-4 text-sm text-mercury-white/75">
              No commitment required • Cancel anytime
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="theme-light border-t border-mercury-white/20 py-12 font-inter" role="contentinfo">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-8">
            <h3 className="mb-4 text-2xl font-bold text-magic-blue">
              LogYourBody
            </h3>
            <p className="mx-auto max-w-md text-text-secondary">
              Professional body composition tracking for fitness enthusiasts and
              health professionals.
            </p>
          </div>
          <div className="mb-8 flex justify-center space-x-8">
            <Button variant="ghost" onClick={() => navigate("/privacy")} className="text-nordic-gray hover:bg-nordic-gray/5 hover:text-magic-blue">
              Privacy Policy
            </Button>
            <Button variant="ghost" onClick={() => navigate("/terms")} className="text-nordic-gray hover:bg-nordic-gray/5 hover:text-magic-blue">
              Terms of Service
            </Button>
            <Button variant="ghost" onClick={() => navigate("/changelog")} className="text-nordic-gray hover:bg-nordic-gray/5 hover:text-magic-blue">
              Changelog
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.open("mailto:support@logyourbody.com")}
              className="text-nordic-gray hover:bg-nordic-gray/5 hover:text-magic-blue"
            >
              Contact Support
            </Button>
          </div>
          <div className="flex flex-col items-center gap-4">
            <VersionDisplay />
            <p className="text-sm text-text-secondary">
              © 2024 LogYourBody. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
