import Link from "next/link";
import { BarChart3, Camera, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";

export function HeroSection() {
  return (
    <section
      className="relative pt-20 pb-8 md:pt-24 md:pb-12 overflow-hidden"
      role="banner"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-linear-purple/5 to-transparent" />
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1
              id="hero-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-linear-text mb-4"
            >
              See your body clearly
            </h1>
            <p className="text-lg sm:text-xl text-linear-text-secondary max-w-2xl mx-auto mb-8">
              Effortless tracking of body fat, lean mass and progress photos. Syncs with Apple Health for one beautiful timeline.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Link href="/signup">
                <Button className="bg-linear-purple text-white px-8 py-3 text-base font-semibold rounded-lg hover:bg-linear-purple/90 transition-all shadow-md">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/demo" className="text-linear-text-secondary hover:text-linear-text transition-colors underline underline-offset-4">
                Watch 2‑min demo
              </Link>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-linear-text-tertiary">
              <span>No credit card required</span>
              <span>•</span>
              <span>10,000+ active users</span>
              <span>•</span>
              <span>4.9★ App Store</span>
            </div>
          </div>
          <div className="relative max-w-3xl mx-auto">
            <div className="rounded-xl bg-gradient-to-br from-linear-card/50 to-linear-card/30 border border-linear-border/50 backdrop-blur-sm p-4 shadow-xl">
              <div className="aspect-[16/9] bg-gradient-to-br from-linear-purple/10 to-linear-purple/5 rounded-lg border border-linear-border/30 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4 p-8">
                  <div className="text-center">
                    <div className="h-12 w-12 mx-auto mb-2 rounded-lg bg-linear-purple/20 flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-xs text-linear-text-secondary">Body Fat</p>
                  </div>
                  <div className="text-center">
                    <div className="h-12 w-12 mx-auto mb-2 rounded-lg bg-linear-purple/20 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-xs text-linear-text-secondary">FFMI</p>
                  </div>
                  <div className="text-center">
                    <div className="h-12 w-12 mx-auto mb-2 rounded-lg bg-linear-purple/20 flex items-center justify-center">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-xs text-linear-text-secondary">Photos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
