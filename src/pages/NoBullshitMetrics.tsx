import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { prefetchRoute } from "@/lib/prefetch";

interface BSFeature {
  icon: string;
  title: string;
  reason: string;
}

const bsFeatures: BSFeature[] = [
  {
    icon: "\u274C",
    title: "Daily Readiness Scores",
    reason:
      "Creates a negative feedback loop. When your app tells you you're not ready, you start acting like you're not.",
  },
  {
    icon: "\u274C",
    title: "Apple's Move Ring",
    reason: "Rewards activity quantity over quality. You end up chasing numbers, not progress.",
  },
  {
    icon: "\u274C",
    title: "Gamified Step Streaks",
    reason: "Streaks guilt you into overtraining and ignoring recovery.",
  },
];

interface FeatureCardProps {
  feature: BSFeature;
  index: number;
}

function FeatureCard({ feature, index }: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`grid grid-cols-[auto_1fr] gap-4 rounded-xl border border-linear-border p-4 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="text-2xl" aria-hidden="true">
        {feature.icon}
      </div>
      <div>
        <div className="font-semibold text-linear-text">{feature.title}</div>
        <p className="text-sm text-linear-text-secondary">{feature.reason}</p>
      </div>
    </div>
  );
}

const NoBullshitMetrics = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-svh bg-linear-bg text-linear-text font-inter">
      {/* Header */}
      <header className="border-b border-linear-border" role="banner">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            onMouseEnter={() => prefetchRoute("/")}
            onFocus={() => prefetchRoute("/")}
            className="text-lg font-semibold text-linear-text hover:text-linear-text-secondary transition-colors"
          >
            LogYourBody
          </button>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onMouseEnter={() => prefetchRoute("/login")}
              onFocus={() => prefetchRoute("/login")}
              onClick={() => navigate("/login")}
              className="text-sm text-linear-text-secondary hover:text-linear-text"
            >
              Log in
            </Button>
            <Button
              onMouseEnter={() => prefetchRoute("/login")}
              onFocus={() => prefetchRoute("/login")}
              onClick={() => navigate("/login")}
              className="bg-linear-text text-linear-bg text-sm font-medium px-4 py-2 rounded-lg hover:bg-linear-text-secondary transition-colors"
            >
              Sign up
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-linear-bg py-20 text-center">
          <div className="container mx-auto px-4 sm:px-6 space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">We don’t track garbage. We track what makes you hot.</h1>
            <p className="mx-auto max-w-3xl text-lg text-linear-text-secondary">Because your goal isn’t to impress a smartwatch. It’s to look phenomenal naked.</p>
          </div>
        </section>

        {/* Kill List */}
        <section className="bg-linear-bg py-16 border-t border-linear-border">
          <div className="container mx-auto px-4 sm:px-6 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">BS Feature Kill List</h2>
              <p className="text-sm text-linear-text-secondary">Ranked by how badly the fitness industry is lying to you</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {bsFeatures.map((feature, idx) => (
                <FeatureCard key={feature.title} feature={feature} index={idx} />
              ))}
            </div>
          </div>
        </section>

        {/* Recommendations */}
        <section className="bg-linear-bg py-16 border-t border-linear-border">
          <div className="container mx-auto px-4 sm:px-6 space-y-8">
            <h2 className="text-3xl font-bold text-center">What We Recommend Instead</h2>
            <p className="text-center text-linear-text-secondary">We don’t reinvent what already works. We integrate with it.</p>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-linear-card border-linear-border">
                <CardHeader>
                  <CardTitle>RP Hypertrophy App</CardTitle>
                  <CardDescription className="text-linear-text-secondary">Science-based training templates.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="link"
                    className="p-0 text-linear-text"
                    onClick={() => window.open("https://rptraining.com/hypertrophy-app", "_blank", "noopener")}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-linear-card border-linear-border">
                <CardHeader>
                  <CardTitle>MacroFactor</CardTitle>
                  <CardDescription className="text-linear-text-secondary">Adaptive nutrition logging.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="link"
                    className="p-0 text-linear-text"
                    onClick={() => window.open("https://macrofactorapp.com", "_blank", "noopener")}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-linear-bg py-20 border-t border-linear-border text-center">
          <div className="container mx-auto px-4 sm:px-6 space-y-6">
            <h2 className="text-3xl font-bold">Want real results?</h2>
            <p className="text-linear-text-secondary">Track what matters. Ignore the noise.</p>
            <Button
              onMouseEnter={() => prefetchRoute("/login")}
              onFocus={() => prefetchRoute("/login")}
              onClick={() => navigate("/login")}
              className="bg-linear-text text-linear-bg text-base font-medium px-6 py-3 rounded-lg hover:bg-linear-text-secondary transition-colors"
            >
              Join the Waitlist
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NoBullshitMetrics;
