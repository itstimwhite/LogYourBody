import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { prefetchRoute } from "@/lib/prefetch";
import { 
  X, 
  Timer, 
  Heart, 
  Activity, 
  Users, 
  Zap, 
  Brain, 
  Search, 
  Calendar,
  Pill,
  Mountain,
  Bot,
  Trophy,
  Watch,
  ArrowRight,
  Check,
  TrendingUp,
  Utensils,
  Target,
  Sparkles
} from "lucide-react";

interface BSFeature {
  icon: React.ElementType;
  title: string;
  reason: string;
  psychologicalInsight?: string;
}

const bsFeatures: BSFeature[] = [
  {
    icon: Timer,
    title: "Generic Rest Timers",
    reason: "Optimal rest is context-dependent—muscle group, diet, sleep, fatigue. A timer guesses. You recover.",
  },
  {
    icon: Heart,
    title: "Heart Rate, HRV, VO₂max, SpO₂",
    reason: "Zero hypertrophy value. Doesn't move the needle for aesthetics. Looks fancy, does nothing.",
  },
  {
    icon: Activity,
    title: "BMI",
    reason: "A 6'0\", 190 lb shredded lifter at 9% body fat is \"obese\" by BMI. Enough said.",
  },
  {
    icon: Brain,
    title: "Sleep Scoring",
    reason: "Bad data leads to bad mindset. If your app says you \"slept poorly,\" you'll feel worse—even if you didn't.",
    psychologicalInsight: "Creates negative placebo effect"
  },
  {
    icon: Activity,
    title: "Daily \"Readiness Scores\"",
    reason: "Creates a negative feedback loop. If the app tells you you're not ready, you'll believe it—and train worse.",
    psychologicalInsight: "Self-fulfilling prophecy"
  },
  {
    icon: Mountain,
    title: "Cold Plunge Logs",
    reason: "Cold exposure blunts muscle growth. Want to track your regression? Not here.",
  },
  {
    icon: Zap,
    title: "Massage & Recovery Logs",
    reason: "Recovery is measured by performance, not foam rolling. A cuddle with your dog is just as effective.",
  },
  {
    icon: Search,
    title: "Food Scanner / Barcode Logging",
    reason: "Adds noise, not clarity. Use MacroFactor—it nails meal tracking better than anything else.",
  },
  {
    icon: Pill,
    title: "Supplement Schedulers",
    reason: "You either take your creatine or you don't. We're not here to parent you.",
  },
  {
    icon: Calendar,
    title: "Workout Generator / Program Builder",
    reason: "You're better off with RP's VirtuFii. We track what matters, not what Mike Israetel already perfected.",
  },
  {
    icon: Bot,
    title: "AI Coaching Chatbots",
    reason: "Hallucinates. Contradicts itself. You deserve real coaching—not a motivational clippy.",
  },
  {
    icon: Trophy,
    title: "Leaderboards / Social Feeds",
    reason: "You're not in a race with a stranger. You're sculpting your best body—privately.",
  },
  {
    icon: Watch,
    title: "Wearable Syncs (besides steps)",
    reason: "The only thing worth syncing is your NEAT (step count). Everything else is vanity metrics.",
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

  const Icon = feature.icon;

  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border border-linear-border/50 bg-gradient-to-br from-linear-card/30 to-transparent p-6 transition-all duration-500 hover:border-red-500/30 hover:bg-red-500/5 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      {/* Corner X Mark */}
      <div className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
        <X className="h-4 w-4 text-red-500" />
      </div>

      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-xl bg-linear-border/30 flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
            <Icon className="h-6 w-6 text-linear-text-secondary group-hover:text-red-500/70 transition-colors" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-linear-text text-lg leading-tight">
            {feature.title}
          </h3>
          <p className="text-sm text-linear-text-secondary leading-relaxed">
            {feature.reason}
          </p>
          {feature.psychologicalInsight && (
            <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">
              {feature.psychologicalInsight}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

const NoBullshitMetrics = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-svh bg-linear-bg text-linear-text font-inter">
      {/* Header */}
      <header className="border-b border-linear-border sticky top-0 bg-linear-bg/95 backdrop-blur-sm z-50" role="banner">
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
              className="text-sm text-linear-text-secondary hover:text-linear-text hidden sm:block"
            >
              Log in
            </Button>
            <Button
              onMouseEnter={() => prefetchRoute("/login")}
              onFocus={() => prefetchRoute("/login")}
              onClick={() => navigate("/login")}
              className="bg-linear-text text-linear-bg text-sm font-medium px-4 py-2 rounded-lg hover:bg-linear-text-secondary transition-colors"
            >
              Start free trial
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          {/* Background gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.05),transparent)]" />
          
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="mx-auto max-w-4xl text-center space-y-8">
              <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-sm px-4 py-2">
                The Anti-BS Manifesto
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="text-linear-text">We don't track</span>
                <br />
                <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                  garbage
                </span>
                <br />
                <span className="text-linear-text">We track what makes you</span>
                <br />
                <span className="bg-gradient-to-r from-linear-text to-linear-purple bg-clip-text text-transparent">
                  hot
                </span>
              </h1>
              
              <p className="mx-auto max-w-3xl text-xl text-linear-text-secondary leading-relaxed">
                Because your goal isn't to impress a smartwatch. 
                It's to look phenomenal naked.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  onClick={() => navigate("/login")}
                  onMouseEnter={() => prefetchRoute("/login")}
                  onFocus={() => prefetchRoute("/login")}
                  className="bg-linear-text text-linear-bg px-8 py-4 text-base font-medium rounded-xl hover:bg-linear-text-secondary transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  Try the real thing
                </Button>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('kill-list')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-linear-border text-linear-text-secondary hover:bg-linear-border/30 hover:text-linear-text px-8 py-4 text-base rounded-xl"
                >
                  See the kill list
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Kill List Section */}
        <section id="kill-list" className="py-24 md:py-32 border-t border-linear-border">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-16 text-center space-y-6">
              <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                Feature Kill List
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-linear-text">
                What we
                <span className="text-red-500"> refuse</span> to build
              </h2>
              <p className="text-lg text-linear-text-secondary max-w-2xl mx-auto">
                And why these "features" are sabotaging your progress
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
              {bsFeatures.map((feature, idx) => (
                <FeatureCard key={feature.title} feature={feature} index={idx} />
              ))}
            </div>

            {/* Psychological Insight Callout */}
            <div className="mt-16 rounded-2xl border border-linear-purple/30 bg-gradient-to-br from-linear-purple/10 to-transparent p-8 text-center">
              <Sparkles className="h-8 w-8 text-linear-purple mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-linear-text mb-4">
                The Psychology Behind Our Choices
              </h3>
              <p className="text-linear-text-secondary max-w-3xl mx-auto leading-relaxed">
                Features like sleep scores and readiness metrics create a negative placebo effect. 
                When your app tells you you're "not ready," you'll unconsciously perform worse—even 
                if you were perfectly fine. We track objective progress, not subjective feelings 
                that become self-fulfilling prophecies.
              </p>
            </div>
          </div>
        </section>

        {/* Recommendations Section */}
        <section className="py-24 md:py-32 bg-gradient-to-b from-linear-card/20 to-transparent border-t border-linear-border">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-16 text-center space-y-6">
              <Badge className="bg-linear-purple/10 text-white border-linear-purple/20">
                Expert Recommendations
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-linear-text">
                What we
                <span className="bg-gradient-to-r from-linear-text to-linear-purple bg-clip-text text-transparent"> actually</span> recommend
              </h2>
              <p className="text-lg text-linear-text-secondary max-w-2xl mx-auto">
                We don't reinvent what already works perfectly. We integrate with the best.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* RP VirtuFii Card */}
              <Card className="group relative overflow-hidden border-linear-border/50 bg-gradient-to-br from-linear-card/50 to-transparent hover:border-linear-purple/30 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-linear-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-linear-purple/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <Badge className="bg-linear-purple/10 text-white border-linear-purple/20 text-xs">
                      For Training
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl text-linear-text">RP's VirtuFii</CardTitle>
                  <CardDescription className="text-linear-text-secondary text-base">
                    Science-backed programming from the best in the game
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-white" />
                      <span className="text-linear-text-secondary">Auto-regulated volume</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-white" />
                      <span className="text-linear-text-secondary">Fatigue management</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-white" />
                      <span className="text-linear-text-secondary">Evidence-based progressions</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-linear-border text-linear-text-secondary hover:bg-linear-border/30 hover:text-linear-text group"
                    onClick={() => window.open("https://rpstrength.com/", "_blank", "noopener")}
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>

              {/* MacroFactor Card */}
              <Card className="group relative overflow-hidden border-linear-border/50 bg-gradient-to-br from-linear-card/50 to-transparent hover:border-linear-purple/30 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-linear-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-linear-purple/10 flex items-center justify-center">
                      <Utensils className="h-6 w-6 text-white" />
                    </div>
                    <Badge className="bg-linear-purple/10 text-white border-linear-purple/20 text-xs">
                      For Nutrition
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl text-linear-text">MacroFactor</CardTitle>
                  <CardDescription className="text-linear-text-secondary text-base">
                    Accurate, flexible nutrition tracking by evidence-based coaches
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-white" />
                      <span className="text-linear-text-secondary">Adaptive TDEE algorithm</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-white" />
                      <span className="text-linear-text-secondary">No guilt or shame tactics</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-white" />
                      <span className="text-linear-text-secondary">Actually accurate database</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-linear-border text-linear-text-secondary hover:bg-linear-border/30 hover:text-linear-text group"
                    onClick={() => window.open("https://macrofactorapp.com", "_blank", "noopener")}
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-24 md:py-32 border-t border-linear-border">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <Badge className="bg-linear-purple/10 text-white border-linear-purple/20">
                    Our Philosophy
                  </Badge>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-linear-text">
                    Focus on what
                    <br />
                    <span className="bg-gradient-to-r from-linear-text to-linear-purple bg-clip-text text-transparent">
                      actually matters
                    </span>
                  </h2>
                  <p className="text-lg text-linear-text-secondary leading-relaxed">
                    Every feature we build passes one test: Does it directly help you build 
                    muscle or lose fat? If not, it's noise.
                  </p>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Target className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-linear-text mb-1">Objective Metrics Only</h4>
                        <p className="text-sm text-linear-text-secondary">
                          Body fat percentage, FFMI, and lean mass. Numbers that reflect real change.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Sparkles className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-linear-text mb-1">No Psychological Manipulation</h4>
                        <p className="text-sm text-linear-text-secondary">
                          No streaks, no guilt, no "readiness scores" that mess with your head.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Check className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-linear-text mb-1">Evidence-Based Decisions</h4>
                        <p className="text-sm text-linear-text-secondary">
                          If research doesn't support it, we don't build it. Period.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="rounded-2xl border border-linear-border/50 bg-gradient-to-br from-linear-card/50 to-transparent p-8">
                    <div className="text-center space-y-6">
                      <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-linear-purple/20 to-linear-purple/10 flex items-center justify-center">
                        <X className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-linear-text">
                        13 features killed
                      </h3>
                      <p className="text-linear-text-secondary">
                        That's 13 ways other apps distract you from your goals
                      </p>
                      <div className="pt-4">
                        <div className="text-4xl font-bold bg-gradient-to-br from-linear-text to-linear-purple bg-clip-text text-transparent">
                          100%
                        </div>
                        <p className="text-sm text-linear-text-secondary mt-1">
                          Focus on body composition
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 md:py-32 overflow-hidden border-t border-linear-border">
          <div className="absolute inset-0 bg-gradient-to-br from-linear-purple/5 via-transparent to-linear-purple/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(94,106,210,0.1),transparent)]" />
          
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="mx-auto max-w-4xl text-center space-y-8">
              <Badge className="bg-linear-purple/10 text-white border-linear-purple/20">
                Ready for real results?
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-linear-text">
                Track what matters.
                <br />
                <span className="bg-gradient-to-r from-linear-text via-linear-purple to-linear-text bg-clip-text text-transparent">
                  Ignore the noise.
                </span>
              </h2>
              <p className="text-lg text-linear-text-secondary max-w-2xl mx-auto">
                Join thousands who've stopped chasing vanity metrics and started building 
                the body they actually want.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  onMouseEnter={() => prefetchRoute("/login")}
                  onFocus={() => prefetchRoute("/login")}
                  onClick={() => navigate("/login")}
                  className="bg-linear-text text-linear-bg px-8 py-4 text-base font-medium rounded-xl hover:bg-linear-text-secondary transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  Start tracking properly
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/")}
                  onMouseEnter={() => prefetchRoute("/")}
                  onFocus={() => prefetchRoute("/")}
                  className="border border-linear-border/50 text-linear-text-secondary hover:bg-linear-border/30 hover:text-linear-text px-8 py-4 text-base rounded-xl"
                >
                  Learn more
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NoBullshitMetrics;