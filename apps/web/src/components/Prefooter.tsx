import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowRight, Sparkles, Shield, Clock, Download } from "lucide-react";
import { APP_CONFIG } from "@/constants/app";

interface PrefooterProps {
  variant?: "default" | "minimal" | "cta";
  className?: string;
}

export function Prefooter({ variant = "default", className = "" }: PrefooterProps) {
  if (variant === "minimal") {
    return (
      <section className={`relative py-16 md:py-20 ${className}`}>
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-4 text-3xl md:text-4xl font-bold tracking-tight text-linear-text">
            Ready to transform?
          </h2>
          <p className="mb-8 text-lg text-linear-text-secondary">
            Join {APP_CONFIG.metadata.totalUsers} people tracking real progress.
          </p>
          <Link href="/download/ios">
            <Button
              size="lg"
              className="bg-linear-text text-linear-bg px-8 py-3 text-base font-medium rounded-lg hover:bg-linear-text-secondary transition-all"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  if (variant === "cta") {
    return (
      <section className={`relative py-20 md:py-28 overflow-hidden ${className}`}>
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-linear-purple/10 via-transparent to-linear-purple/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(94,106,210,0.15),transparent)]" />
        
        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <div className="rounded-3xl bg-gradient-to-br from-linear-card via-linear-card/95 to-linear-card/90 border border-linear-border/50 p-12 md:p-16 text-center backdrop-blur-sm">
            <Badge className="mb-6 bg-linear-purple/10 text-white border-linear-purple/20 inline-flex items-center">
              <Sparkles className="mr-1 h-3 w-3" />
              Limited Time Offer
            </Badge>
            
            <h2 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-linear-text">
              Transform your body.
              <br />
              <span className="bg-gradient-to-r from-linear-text via-linear-purple to-linear-text bg-clip-text text-transparent">
                Transform your life.
              </span>
            </h2>
            
            <p className="mx-auto mb-10 max-w-2xl text-lg md:text-xl text-linear-text-secondary leading-relaxed">
              Professional body composition tracking trusted by {APP_CONFIG.metadata.totalUsers} people worldwide.
              See what you're really made of.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Link href="/download/ios">
                <Button
                  size="lg"
                  className="bg-linear-text text-linear-bg px-8 py-4 text-base font-medium rounded-xl hover:bg-linear-text-secondary transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  Download for iOS
                  <Download className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-linear-border/50 text-linear-text-secondary hover:bg-linear-border/30 hover:text-linear-text px-8 py-4 text-base rounded-xl transition-all backdrop-blur-sm"
                >
                  Watch Demo
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-linear-text-tertiary">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Privacy first</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{APP_CONFIG.trialLengthText}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default variant
  return (
    <section className={`relative py-20 md:py-24 bg-gradient-to-b from-transparent via-linear-card/30 to-linear-card/50 ${className}`}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Content */}
          <div>
            <Badge className="mb-4 bg-linear-purple/10 text-white border-linear-purple/20 inline-block">
              Why LogYourBody?
            </Badge>
            <h2 className="mb-6 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-linear-text">
              The only tracker that shows
              <br />
              <span className="text-linear-text-secondary">what's really changing</span>
            </h2>
            <p className="mb-8 text-lg text-linear-text-secondary leading-relaxed">
              Stop guessing with just weight. Track body fat percentage, FFMI, and see your actual transformation 
              with progress photos that tell the real story.
            </p>
            
            <div className="grid gap-4 sm:grid-cols-2 mb-8">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-linear-purple/20 flex items-center justify-center flex-shrink-0">
                  <div className="h-2 w-2 rounded-full bg-linear-purple" />
                </div>
                <div>
                  <h3 className="font-semibold text-linear-text mb-1">Professional Accuracy</h3>
                  <p className="text-sm text-linear-text-secondary">Navy, 3-site & 7-site methods</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-linear-purple/20 flex items-center justify-center flex-shrink-0">
                  <div className="h-2 w-2 rounded-full bg-linear-purple" />
                </div>
                <div>
                  <h3 className="font-semibold text-linear-text mb-1">Visual Proof</h3>
                  <p className="text-sm text-linear-text-secondary">Automated progress photos</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-linear-purple/20 flex items-center justify-center flex-shrink-0">
                  <div className="h-2 w-2 rounded-full bg-linear-purple" />
                </div>
                <div>
                  <h3 className="font-semibold text-linear-text mb-1">Smart Integration</h3>
                  <p className="text-sm text-linear-text-secondary">Syncs with Apple Health</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-linear-purple/20 flex items-center justify-center flex-shrink-0">
                  <div className="h-2 w-2 rounded-full bg-linear-purple" />
                </div>
                <div>
                  <h3 className="font-semibold text-linear-text mb-1">Private & Secure</h3>
                  <p className="text-sm text-linear-text-secondary">Your data stays yours</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/download/ios">
                <Button
                  className="bg-linear-purple text-white px-6 py-3 text-base font-medium rounded-lg hover:bg-linear-purple/90 transition-all"
                >
                  Start Tracking Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  variant="ghost"
                  className="text-linear-text-secondary hover:text-linear-text px-6 py-3 text-base rounded-lg transition-all"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Visual element */}
          <div className="relative lg:pl-12">
            <div className="relative">
              {/* Floating cards representing features */}
              <div className="grid gap-4">
                <div className="rounded-xl border border-linear-border/50 bg-linear-card/80 backdrop-blur-sm p-6 transform hover:-translate-y-1 transition-transform">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-linear-text-secondary">Body Fat %</span>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20">-2.3%</Badge>
                  </div>
                  <div className="text-2xl font-bold text-linear-text">14.5%</div>
                </div>
                
                <div className="rounded-xl border border-linear-border/50 bg-linear-card/80 backdrop-blur-sm p-6 transform hover:-translate-y-1 transition-transform">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-linear-text-secondary">FFMI</span>
                    <Badge className="bg-linear-purple/10 text-white border-linear-purple/20">Natural</Badge>
                  </div>
                  <div className="text-2xl font-bold text-linear-text">23.4</div>
                </div>
                
                <div className="rounded-xl border border-linear-border/50 bg-linear-card/80 backdrop-blur-sm p-6 transform hover:-translate-y-1 transition-transform">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-linear-text-secondary">Lean Mass</span>
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">+5 lbs</Badge>
                  </div>
                  <div className="text-2xl font-bold text-linear-text">165 lbs</div>
                </div>
              </div>
              
              {/* Background decoration */}
              <div className="absolute -inset-4 bg-gradient-to-r from-linear-purple/20 via-transparent to-linear-purple/20 blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Prefooter;