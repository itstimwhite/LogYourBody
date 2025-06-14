import React from "react";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Footprints, TrendingUp } from "lucide-react";

export function StepTrackerSection() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <Badge className="mb-4 bg-linear-purple/10 text-linear-purple border-linear-purple/20 inline-block">
              Keep moving
            </Badge>
            <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-linear-text">
              Every step counts
            </h2>
            <p className="mb-8 text-lg sm:text-xl text-linear-text-secondary">
              Our step tracker quietly syncs with Apple Health so you can see how daily activity drives real change.
            </p>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-linear-purple/10">
                  <Footprints className="h-6 w-6 text-linear-purple" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-linear-text">Automatic counting</h3>
                  <p className="text-linear-text-secondary">No extra apps. Works right out of the box.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-linear-purple/10">
                  <TrendingUp className="h-6 w-6 text-linear-purple" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-linear-text">Activity insights</h3>
                  <p className="text-linear-text-secondary">Spot trends and stay motivated.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-linear-purple/10">
                  <BarChart3 className="h-6 w-6 text-linear-purple" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-linear-text">Integrated progress</h3>
                  <p className="text-linear-text-secondary">Steps, weight, and body fat in one timeline.</p>
                </div>
              </div>
            </div>
          </div>
          {/* Visual Demo */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-linear-purple/20 via-transparent to-transparent blur-3xl" />
              <div className="relative rounded-2xl border border-linear-border bg-linear-card p-8 text-center">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-linear-purple/10 px-4 py-2">
                  <Footprints className="h-4 w-4 text-linear-purple" />
                  <span className="text-sm font-medium text-linear-purple">10,200 steps</span>
                </div>
                <div className="mb-8">
                  <div className="text-3xl font-bold text-linear-text">Goal achieved</div>
                  <div className="text-sm text-linear-text-tertiary">12k step target</div>
                </div>
                <div className="relative">
                  <div className="relative h-3 rounded-full bg-linear-border">
                    <div className="absolute left-0 h-full w-5/6 rounded-full bg-gradient-to-r from-linear-purple/60 to-linear-purple" />
                    <div className="absolute left-5/6 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-2 border-linear-bg bg-linear-purple shadow-lg" />
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
