'use client'

import { cn } from '@/lib/utils'

interface BodyFatScaleProps {
  currentBF?: number
  gender?: 'male' | 'female'
  className?: string
}

const BF_RANGES = {
  male: {
    essential: { min: 2, max: 5, color: 'bg-red-500', label: 'Essential' },
    athletes: { min: 6, max: 13, color: 'bg-orange-500', label: 'Athletes' },
    fitness: { min: 14, max: 17, color: 'bg-green-500', label: 'Fitness' },
    average: { min: 18, max: 24, color: 'bg-yellow-500', label: 'Average' },
    obese: { min: 25, max: 100, color: 'bg-red-600', label: 'Obese' }
  },
  female: {
    essential: { min: 10, max: 13, color: 'bg-red-500', label: 'Essential' },
    athletes: { min: 14, max: 20, color: 'bg-orange-500', label: 'Athletes' },
    fitness: { min: 21, max: 24, color: 'bg-green-500', label: 'Fitness' },
    average: { min: 25, max: 31, color: 'bg-yellow-500', label: 'Average' },
    obese: { min: 32, max: 100, color: 'bg-red-600', label: 'Obese' }
  }
}

const GOAL_RANGES = {
  male: { min: 8, max: 12 },
  female: { min: 18, max: 22 }
}

export function BodyFatScale({ currentBF, gender = 'male', className }: BodyFatScaleProps) {
  const ranges = BF_RANGES[gender]
  const goalRange = GOAL_RANGES[gender]
  const maxDisplay = 35 // Max value to display on scale
  
  // Calculate position percentages
  const currentPosition = currentBF ? (Math.min(currentBF, maxDisplay) / maxDisplay) * 100 : null
  const goalStartPosition = (goalRange.min / maxDisplay) * 100
  const goalEndPosition = (goalRange.max / maxDisplay) * 100
  
  return (
    <div className={cn("space-y-3", className)}>
      {/* Scale bar */}
      <div className="relative h-10 rounded-lg overflow-hidden bg-linear-border/20">
        {/* Background gradient showing BF ranges */}
        <div className="absolute inset-0">
          {Object.entries(ranges).map(([key, range]) => {
            const startPercent = (range.min / maxDisplay) * 100
            const endPercent = (Math.min(range.max, maxDisplay) / maxDisplay) * 100
            const width = endPercent - startPercent
            
            return (
              <div
                key={key}
                className={cn(range.color, "opacity-20")}
                style={{
                  left: `${startPercent}%`,
                  width: `${width}%`,
                  position: 'absolute',
                  height: '100%'
                }}
              />
            )
          })}
        </div>
        
        {/* Goal range overlay */}
        <div
          className="absolute h-full bg-green-500 opacity-40 rounded"
          style={{
            left: `${goalStartPosition}%`,
            width: `${goalEndPosition - goalStartPosition}%`
          }}
        />
        
        {/* Goal range borders */}
        <div
          className="absolute h-full border-l-2 border-green-600"
          style={{ left: `${goalStartPosition}%` }}
        />
        <div
          className="absolute h-full border-r-2 border-green-600"
          style={{ left: `${goalEndPosition}%` }}
        />
        
        {/* Current BF% marker */}
        {currentPosition !== null && currentBF !== undefined && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-8 bg-linear-text shadow-lg"
            style={{ left: `${currentPosition}%` }}
          >
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-linear-card border border-linear-border px-2 py-0.5 rounded text-xs font-semibold text-linear-text whitespace-nowrap">
              {currentBF.toFixed(1)}%
            </div>
          </div>
        )}
      </div>
      
      {/* Scale labels */}
      <div className="relative h-4">
        {/* Percentage markers */}
        <div className="absolute inset-0 flex text-xs text-linear-text-tertiary">
          <span className="absolute" style={{ left: '0%' }}>0%</span>
          <span className="absolute" style={{ left: '28.5%', transform: 'translateX(-50%)' }}>10%</span>
          <span className="absolute" style={{ left: '57%', transform: 'translateX(-50%)' }}>20%</span>
          <span className="absolute" style={{ left: '85.5%', transform: 'translateX(-50%)' }}>30%</span>
        </div>
        
        {/* Goal range label */}
        <div
          className="absolute -top-5 text-xs font-medium text-green-600 bg-linear-card px-1 rounded"
          style={{
            left: `${(goalStartPosition + goalEndPosition) / 2}%`,
            transform: 'translateX(-50%)'
          }}
        >
          Goal: {goalRange.min}-{goalRange.max}%
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs mt-4">
        {Object.entries(ranges).slice(0, 4).map(([key, range]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={cn("w-2.5 h-2.5 rounded", range.color, "opacity-40")} />
            <span className="text-linear-text-secondary">{range.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}