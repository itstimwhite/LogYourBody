'use client'

import React from 'react'
import { Badge } from './ui/badge'
import { TrendingUp, Clock } from 'lucide-react'

export function LandingPredictionSection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-transparent via-linear-purple/5 to-transparent">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <Badge className="mb-4 bg-linear-purple/10 text-white border-linear-purple/20 inline-block">
              Future insights
            </Badge>
            <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-linear-text">
              Know your body&apos;s future
            </h2>
            <p className="mb-8 text-lg sm:text-xl text-linear-text-secondary">
              Our prediction engine analyzes every log to forecast how you&apos;ll look if you keep your current habits. Catch setbacks early or double down on what&apos;s working.
            </p>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-linear-purple/10">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-linear-text">Data-driven forecasts</h3>
                  <p className="text-linear-text-secondary">We combine photos, scans, and workout logs into a single trend line.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-linear-purple/10">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-linear-text">Change course in time</h3>
                  <p className="text-linear-text-secondary">See your predicted body six months out so the mirror never catches you off guard.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl border border-linear-border bg-linear-card p-8 shadow-xl">
              <div className="text-center">
                <div className="mb-2 text-sm text-linear-text-secondary">If you stay on track</div>
                <div className="mb-4 text-4xl font-bold text-linear-text">12% BF</div>
                <div className="text-sm text-linear-text-tertiary">in 6 months</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LandingPredictionSection
