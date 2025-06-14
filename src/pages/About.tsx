import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Camera,
  TrendingUp,
  Users,
  Heart,
  Zap,
  Target,
  Shield,
  Award,
  Github,
  Flame,
  GraduationCap,
  Rocket,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { prefetchRoute } from "@/lib/prefetch";
import Footer from "@/components/Footer";

const About = () => {
  const navigate = useNavigate();

  const teamMembers = [
    {
      name: "Tim White",
      role: "Founder & Developer",
      bio: "Passionate about creating tools that help people understand their bodies better. 10+ years in software development with a focus on health and fitness technology.",
      avatar: "TW",
    },
  ];

  const values = [
    {
      icon: Award,
      title: "Be So Good They Can't Ignore You",
      description: "We don't compete on marketing budgets. We compete on substance. Every feature must be undeniably excellent.",
    },
    {
      icon: Flame,
      title: "Be Sexy",
      description: "Health tracking should be inspiring, not clinical. Beautiful design makes complex data accessible and motivating.",
    },
    {
      icon: BarChart3,
      title: "Evidence-Based Solutions",
      description: "We track what actually matters for body composition, not vanity metrics. Real data drives real progress.",
    },
    {
      icon: Zap,
      title: "Simplicity in Complexity",
      description: "Professional-grade analysis hidden behind elegant interfaces. 30-second logging for complete body metrics.",
    },
    {
      icon: Shield,
      title: "Privacy by Design",
      description: "Your body data is deeply personal. End-to-end encryption, complete control, and transparent policies.",
    },
    {
      icon: Target,
      title: "Precision Over Perception",
      description: "We measure reality, not feelings. Accurate body composition tracking, even when progress isn't linear.",
    },
    {
      icon: Rocket,
      title: "Ship Fast, Learn Faster",
      description: "Rapid iteration guided by user feedback. Perfect is the enemy of good, but good enough isn't good enough.",
    },
    {
      icon: GraduationCap,
      title: "Education Over Selling",
      description: "We succeed when our users succeed. Teaching how body composition works, not just selling features.",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Active Users" },
    { number: "2M+", label: "Measurements Logged" },
    { number: "4.9/5", label: "App Store Rating" },
    { number: "30 sec", label: "Average Log Time" },
  ];

  return (
    <div className="min-h-svh bg-linear-bg font-inter">
      {/* Header */}
      <header className="border-b border-linear-border" role="banner">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              onMouseEnter={() => prefetchRoute("/")}
              onFocus={() => prefetchRoute("/")}
              className="text-lg sm:text-xl font-semibold text-linear-text hover:text-linear-text-secondary transition-colors"
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
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-6 bg-linear-purple/10 text-linear-purple border-linear-purple/20 inline-block">
                Our Story
              </Badge>
              <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-linear-text">
                Building the future of
                <br />
                body composition tracking
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-linear-text-secondary">
                We're building the future of body composition tracking. Not another vanity metrics app, 
                but professional-grade tools that are beautiful, accurate, and inspire real progress.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-linear-border">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl font-bold text-linear-text mb-2">{stat.number}</div>
                  <div className="text-sm text-linear-text-secondary">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div>
                <Badge className="mb-4 bg-linear-purple/10 text-linear-purple border-linear-purple/20 inline-block">
                  Our Mission
                </Badge>
                <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-linear-text">
                  Evidence over vanity metrics
                </h2>
                <div className="space-y-6 text-lg text-linear-text-secondary">
                  <p>
                    Most fitness apps are built to make you feel good, not get results. They track steps, 
                    calories burned, and weight—metrics that tell you almost nothing about real body composition changes.
                  </p>
                  <p>
                    We track what actually matters: body fat percentage, lean mass, and FFMI. The same metrics 
                    used by professional bodybuilders and sports scientists, but made simple enough for daily use.
                  </p>
                  <p>
                    Our tools are beautiful because complex data should be inspiring, not intimidating. 
                    And they're accurate because we believe in measuring reality, not perception.
                  </p>
                </div>
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-lg border border-linear-border bg-linear-card p-6">
                  <BarChart3 className="mb-4 h-8 w-8 text-linear-purple" />
                  <h3 className="mb-2 text-lg font-semibold text-linear-text">
                    Professional Grade
                  </h3>
                  <p className="text-sm text-linear-text-secondary">
                    DEXA-scan accuracy in your pocket. Body fat tracking with ±2% precision when done right.
                  </p>
                </div>
                <div className="rounded-lg border border-linear-border bg-linear-card p-6">
                  <Camera className="mb-4 h-8 w-8 text-linear-purple" />
                  <h3 className="mb-2 text-lg font-semibold text-linear-text">
                    Visual Progress
                  </h3>
                  <p className="text-sm text-linear-text-secondary">
                    See changes your scale can't measure. Automated photo reminders with consistent angles.
                  </p>
                </div>
                <div className="rounded-lg border border-linear-border bg-linear-card p-6">
                  <TrendingUp className="mb-4 h-8 w-8 text-linear-purple" />
                  <h3 className="mb-2 text-lg font-semibold text-linear-text">
                    FFMI Tracking
                  </h3>
                  <p className="text-sm text-linear-text-secondary">
                    Know your genetic potential. Track lean muscle gains without the guesswork.
                  </p>
                </div>
                <div className="rounded-lg border border-linear-border bg-linear-card p-6">
                  <Users className="mb-4 h-8 w-8 text-linear-purple" />
                  <h3 className="mb-2 text-lg font-semibold text-linear-text">
                    Built for Results
                  </h3>
                  <p className="text-sm text-linear-text-secondary">
                    From personal use to professional coaching. Tools that actually move the needle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 md:py-32 bg-linear-card/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-16 text-center">
              <Badge className="mb-4 bg-linear-purple/10 text-linear-purple border-linear-purple/20 inline-block">
                Our Values
              </Badge>
              <h2 className="mb-4 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-linear-text">
                What drives us
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-linear-text-secondary">
                The principles that guide every decision we make and every feature we build.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <div
                    key={index}
                    className="rounded-lg border border-linear-border bg-linear-bg p-6 text-center hover:bg-linear-card/50 transition-colors"
                  >
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-linear-purple/10">
                      <IconComponent className="h-6 w-6 text-linear-purple" />
                    </div>
                    <h3 className="mb-3 text-base font-semibold text-linear-text leading-tight">
                      {value.title}
                    </h3>
                    <p className="text-sm text-linear-text-secondary leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-16 text-center">
              <Badge className="mb-4 bg-linear-purple/10 text-linear-purple border-linear-purple/20 inline-block">
                Our Team
              </Badge>
              <h2 className="mb-4 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-linear-text">
                Meet the founder
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-linear-text-secondary">
                Founded by a passionate developer dedicated to revolutionizing fitness tracking.
              </p>
            </div>

            <div className="flex justify-center">
              <div className="max-w-md">
                {teamMembers.map((member, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-linear-border bg-linear-card p-8 text-center"
                  >
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-purple/10 text-xl font-bold text-linear-purple">
                      {member.avatar}
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-linear-text">
                      {member.name}
                    </h3>
                    <p className="mb-4 text-sm font-medium text-linear-purple">
                      {member.role}
                    </p>
                    <p className="text-sm text-linear-text-secondary leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Open Source Section */}
        <section className="py-20 md:py-32 bg-linear-card/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-4 bg-linear-purple/10 text-linear-purple border-linear-purple/20 inline-block">
                Open Source
              </Badge>
              <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-linear-text">
                Built in the open
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-linear-text-secondary">
                LogYourBody is open source and built with transparency. We believe the best software 
                is created when developers can learn from, contribute to, and improve upon each other's work.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={() => window.open("https://github.com/itstimwhite/LogYourBody", "_blank")}
                  className="bg-linear-text text-linear-bg px-6 py-3 font-medium rounded-lg hover:bg-linear-text-secondary transition-colors inline-flex items-center gap-2"
                >
                  <Github className="h-5 w-5" />
                  View on GitHub
                </Button>
                <p className="text-sm text-linear-text-tertiary">
                  MIT Licensed • Free forever
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h2 className="mb-4 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-linear-text">
              Ready to track real progress?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-linear-text-secondary">
              Join thousands of people who have already discovered the difference accurate body composition tracking makes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => navigate("/login")}
                onMouseEnter={() => prefetchRoute("/login")}
                onFocus={() => prefetchRoute("/login")}
                className="bg-linear-text text-linear-bg px-8 py-4 text-base font-medium rounded-lg hover:bg-linear-text-secondary transition-colors"
              >
                Start Free Trial
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                onMouseEnter={() => prefetchRoute("/")}
                onFocus={() => prefetchRoute("/")}
                className="border border-linear-border text-linear-text-secondary hover:bg-linear-border/50 hover:text-linear-text px-8 py-4 text-base rounded-lg transition-all"
              >
                Learn More
              </Button>
            </div>
            <p className="mt-4 text-sm text-linear-text-tertiary">
              No credit card • 3-day trial • Cancel anytime
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;