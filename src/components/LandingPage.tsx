import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    }
  };

  const appFeatures = [
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track body fat percentage, weight, FFMI, and lean body mass with precision analytics and trends."
    },
    {
      icon: TrendingUp,
      title: "Progress Insights",
      description: "Visualize your body composition changes over time with detailed charts and progress tracking."
    },
    {
      icon: Camera,
      title: "Photo Progress",
      description: "Document your transformation with progress photos and visual comparison tools."
    },
    {
      icon: Smartphone,
      title: "Health App Sync",
      description: "Seamlessly sync with Apple Health and Google Fit for comprehensive health tracking."
    },
    {
      icon: Shield,
      title: "Data Privacy",
      description: "Your health data is encrypted and secure. We never share your personal information."
    },
    {
      icon: Clock,
      title: "3-Day Free Trial",
      description: "Try all premium features free for 3 days. No credit card required to start."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Fitness Enthusiast",
      content: "Finally, a body composition tracker that actually makes sense. The FFMI calculations help me understand my progress beyond just weight.",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      role: "Personal Trainer",
      content: "I recommend LogYourBody to all my clients. The detailed analytics help them stay motivated and track real progress.",
      rating: 5
    },
    {
      name: "Dr. Emily Watson",
      role: "Sports Nutritionist",
      content: "The precision and scientific approach to body composition tracking is exactly what my patients need.",
      rating: 5
    }
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
    "FFMI calculations"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Skip Links */}
      <div className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50">
        <button 
          className="bg-primary text-primary-foreground px-4 py-2 rounded focus:ring-4 focus:ring-primary/50"
          onClick={() => document.getElementById('main-content')?.focus()}
        >
          Skip to main content
        </button>
      </div>
      {/* Header */}
      <header className="border-b border-border" role="banner">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between" role="navigation" aria-label="Main navigation">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-white uppercase">
                <span className="sr-only">LogYourBody - </span>LOGYOURBODY
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/login")}
                aria-label="Sign in to your account"
                className="focus:ring-4 focus:ring-primary/50"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate("/login")}
                aria-label="Start your 3-day free trial"
                className="focus:ring-4 focus:ring-primary/50"
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
          className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
          role="banner"
          aria-labelledby="hero-heading"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')",
              filter: "grayscale(100%) contrast(1.2) brightness(0.3)"
            }}
            role="img"
            aria-label="Fitness professional using body composition tracking equipment"
          />
          
          {/* Enhanced overlay for better contrast */}
          <div className="absolute inset-0 bg-black/70" />
          
          {/* Content */}
          <div className="relative z-10 container mx-auto px-6 py-20 text-center">
            <Badge 
              className="mb-6 bg-primary text-white border-2 border-white/30 shadow-lg"
              role="status"
              aria-label="Special offer: 3-day free trial available"
            >
              3-Day Free Trial Available
            </Badge>
            <h1 
              id="hero-heading"
              className="text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg"
            >
              Track Your Body Composition
              <br />
              <span className="text-primary drop-shadow-lg">With Precision</span>
            </h1>
            <p className="text-xl text-white max-w-3xl mx-auto mb-10 leading-relaxed drop-shadow-md">
              Professional body composition tracking for fitness enthusiasts. Monitor body fat percentage, 
              weight, FFMI, and lean body mass with advanced analytics and insights.
            </p>
            <div className="flex justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-white shadow-lg focus:ring-4 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-black"
                onClick={() => navigate("/login")}
                aria-describedby="trial-details"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
            <p 
              id="trial-details"
              className="text-sm text-white/90 mt-4"
              role="note"
            >
              No credit card required • 3-day free trial • Cancel anytime
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-20" aria-labelledby="features-heading">
          <div className="text-center mb-16">
            <h2 id="features-heading" className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for Body Composition Tracking
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional-grade tools and analytics to help you understand and optimize your body composition.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
            {appFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className="border-border bg-card hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-primary/50"
                role="listitem"
                tabIndex="0"
                aria-labelledby={`feature-title-${index}`}
                aria-describedby={`feature-desc-${index}`}
              >
                <CardHeader>
                  <feature.icon 
                    className="h-12 w-12 text-primary mb-4" 
                    aria-hidden="true"
                  />
                  <CardTitle id={`feature-title-${index}`} className="text-xl">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription 
                    id={`feature-desc-${index}`}
                    className="text-base leading-relaxed"
                  >
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-secondary/30 py-20" aria-labelledby="testimonials-heading">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 id="testimonials-heading" className="text-3xl md:text-4xl font-bold mb-4">
                Trusted by Fitness Professionals
              </h2>
              <p className="text-xl text-muted-foreground">
                See what our users say about LogYourBody
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8" role="list">
              {testimonials.map((testimonial, index) => (
                <Card 
                  key={index} 
                  className="border-border bg-card focus-within:ring-2 focus-within:ring-primary/50"
                  role="listitem"
                  tabIndex="0"
                >
                  <CardContent className="pt-6">
                    <div className="flex mb-4" role="img" aria-label={`${testimonial.rating} out of 5 stars`}>
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-5 w-5 ${
                            i < testimonial.rating ? 'fill-primary text-primary' : 'text-gray-300'
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <blockquote className="text-base mb-4 leading-relaxed">
                      "{testimonial.content}"
                    </blockquote>
                    <cite className="not-italic">
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </cite>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground">
            Start your 3-day free trial today. No hidden fees.
          </p>
        </div>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12" role="group" aria-labelledby="billing-toggle-label">
          <span id="billing-toggle-label" className="sr-only">Choose billing frequency</span>
          <span 
            className={`text-lg font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}
            id="monthly-label"
          >
            Monthly
          </span>
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
            className="data-[state=checked]:bg-primary focus:ring-4 focus:ring-primary/50"
            aria-labelledby="monthly-label annual-label"
            aria-describedby="billing-savings"
          />
          <span 
            className={`text-lg font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}
            id="annual-label"
          >
            Annual
          </span>
          {isAnnual && (
            <Badge 
              id="billing-savings"
              className="ml-2 bg-green-100 text-green-800 border-green-200"
              role="status"
            >
              Save {pricing.annual.savingsPercent}%
            </Badge>
          )}
        </div>

        {/* Single Pricing Card */}
        <div className="max-w-md mx-auto">
          <Card 
            className="border-border ring-2 ring-primary shadow-lg relative focus-within:ring-4 focus-within:ring-primary/50"
            role="region"
            aria-labelledby="pricing-title"
            aria-describedby="pricing-description"
          >
            <Badge 
              className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground"
              role="status"
            >
              3-Day Free Trial
            </Badge>
            <CardHeader className="text-center">
              <CardTitle id="pricing-title" className="text-2xl">LogYourBody Pro</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold transition-all duration-300 ease-in-out">
                  <span className="sr-only">Price: </span>${currentPlan.price}
                </span>
                <span className="text-muted-foreground transition-all duration-300 ease-in-out">
                  /{currentPlan.period}
                </span>
              </div>
              {isAnnual && (
                <div className="mt-2 transition-all duration-300 ease-in-out">
                  <span className="text-sm text-muted-foreground">
                    ${pricing.annual.monthlyEquivalent}/month when billed annually
                  </span>
                  <div className="text-sm text-green-600 font-medium">
                    Save ${pricing.annual.savings} vs monthly billing
                  </div>
                </div>
              )}
              <CardDescription id="pricing-description" className="text-base mt-4">
                Professional body composition tracking with advanced analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6" role="list">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center" role="listitem">
                    <Check className="h-5 w-5 text-primary mr-3" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full focus:ring-4 focus:ring-primary/50" 
                onClick={() => navigate("/login")}
                aria-describedby="trial-terms"
              >
                Start Free Trial
              </Button>
              <p id="trial-terms" className="text-xs text-muted-foreground text-center mt-3">
                No credit card required • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Body Composition Tracking?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of users who trust LogYourBody for accurate, professional body composition analysis.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-6"
            onClick={() => navigate("/login")}
          >
            Start Your 3-Day Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-sm mt-4 opacity-75">
            No commitment required • Cancel anytime
          </p>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12" role="contentinfo">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-primary mb-4">LogYourBody</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Professional body composition tracking for fitness enthusiasts and health professionals.
            </p>
          </div>
          <div className="flex justify-center space-x-8 mb-8">
            <Button variant="ghost" onClick={() => navigate("/privacy")}>
              Privacy Policy
            </Button>
            <Button variant="ghost" onClick={() => navigate("/terms")}>
              Terms of Service
            </Button>
            <Button variant="ghost" onClick={() => navigate("/changelog")}>
              Changelog
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => window.open("mailto:support@logyourbody.com")}
            >
              Contact Support
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 LogYourBody. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}