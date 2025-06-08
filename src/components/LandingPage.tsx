import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  const features = [
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

  const pricingPlans = [
    {
      name: "Monthly",
      price: "$9.99",
      period: "per month",
      description: "Perfect for getting started",
      features: [
        "Unlimited measurements",
        "Advanced analytics",
        "Progress photos",
        "Health app sync",
        "Data export",
        "Priority support"
      ]
    },
    {
      name: "Annual",
      price: "$69.99",
      period: "per year",
      description: "Best value - Save 42%",
      popular: true,
      features: [
        "Everything in Monthly",
        "Save $50 annually",
        "Extended data history",
        "Advanced insights",
        "Priority feature access",
        "Dedicated support"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-primary">LogYourBody</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Sign In
            </Button>
            <Button onClick={() => navigate("/login")}>
              Start Free Trial
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
          3-Day Free Trial Available
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Track Your Body Composition
          <br />
          <span className="text-primary">With Precision</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
          Professional body composition tracking for fitness enthusiasts. Monitor body fat percentage, 
          weight, FFMI, and lean body mass with advanced analytics and insights.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6"
            onClick={() => navigate("/login")}
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="text-lg px-8 py-6"
            onClick={() => navigate("/splash")}
          >
            View Demo
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          No credit card required • 3-day free trial • Cancel anytime
        </p>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for Body Composition Tracking
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional-grade tools and analytics to help you understand and optimize your body composition.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-secondary/30 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Fitness Professionals
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our users say about LogYourBody
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border bg-card">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-base mb-4 leading-relaxed">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
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
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={`border-border relative ${plan.popular ? 'ring-2 ring-primary shadow-lg' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <CardDescription className="text-base">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => navigate("/login")}
                >
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>
          ))}
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

      {/* Footer */}
      <footer className="border-t border-border py-12">
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