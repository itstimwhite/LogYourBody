'use client'

import { cn } from '@/lib/utils'

interface BodyFatScaleProps {
  currentBF?: number
  gender?: 'male' | 'female'
  className?: string
}

const BF_RANGES = {
  male: {
    essential: { min: 2, max: 5, color: 'bg-gradient-to-r from-red-500/20 to-red-500/10', label: 'Essential' },
    athletes: { min: 6, max: 13, color: 'bg-gradient-to-r from-blue-500/20 to-blue-500/10', label: 'Athletes' },
    fitness: { min: 14, max: 17, color: 'bg-gradient-to-r from-green-500/20 to-green-500/10', label: 'Fitness' },
    average: { min: 18, max: 24, color: 'bg-gradient-to-r from-yellow-500/20 to-yellow-500/10', label: 'Average' },
    obese: { min: 25, max: 100, color: 'bg-gradient-to-r from-orange-500/20 to-orange-500/10', label: 'Obese' }
  },
  female: {
    essential: { min: 10, max: 13, color: 'bg-gradient-to-r from-red-500/20 to-red-500/10', label: 'Essential' },
    athletes: { min: 14, max: 20, color: 'bg-gradient-to-r from-blue-500/20 to-blue-500/10', label: 'Athletes' },
    fitness: { min: 21, max: 24, color: 'bg-gradient-to-r from-green-500/20 to-green-500/10', label: 'Fitness' },
    average: { min: 25, max: 31, color: 'bg-gradient-to-r from-yellow-500/20 to-yellow-500/10', label: 'Average' },
    obese: { min: 32, max: 100, color: 'bg-gradient-to-r from-orange-500/20 to-orange-500/10', label: 'Obese' }
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
    <div className={cn("space-y-2", className)}>
      {/* Scale bar */}
      <div className="relative h-6 bg-linear-bg rounded border border-linear-border overflow-hidden">
        {/* Background segments */}
        <div className="absolute inset-0 flex">
          {Object.entries(ranges).map(([key, range]) => {
            const startPercent = (range.min / maxDisplay) * 100
            const endPercent = (Math.min(range.max, maxDisplay) / maxDisplay) * 100
            const width = endPercent - startPercent
            
            return (
              <div
                key={key}
                className={cn(range.color)}
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
        
        {/* Goal range overlay - subtle highlight */}
        <div
          className="absolute h-full bg-linear-purple/10 border-x border-linear-purple/30"
          style={{
            left: `${goalStartPosition}%`,
            width: `${goalEndPosition - goalStartPosition}%`
          }}
        />
        
        {/* Current BF% marker */}
        {currentPosition !== null && currentBF !== undefined && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-linear-text"
            style={{ left: `${currentPosition}%` }}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-linear-card border border-linear-border px-1.5 py-0.5 rounded text-xs font-medium text-linear-text whitespace-nowrap">
              {currentBF.toFixed(1)}%
            </div>
          </div>
        )}
      </div>
      
      {/* Scale labels - minimalist approach */}
      <div className="flex justify-between text-xs text-linear-text-tertiary">
        <span>0</span>
        <span>10</span>
        <span>20</span>
        <span>30%</span>
      </div>
      
      {/* Info row */}
      <div className="flex items-center justify-between text-xs">
        {/* Current status */}
        <div className="flex items-center gap-2">
          {currentBF !== undefined && (
            <>
              <span className="text-linear-text-secondary">Current:</span>
              <span className="font-medium text-linear-text">
                {(() => {
                  const category = Object.entries(ranges).find(([_, range]) => 
                    currentBF >= range.min && currentBF <= range.max
                  )?.[1]?.label || 'Unknown'
                  return category
                })()}
              </span>
            </>
          )}
        </div>
        
        {/* Goal indicator */}
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-linear-purple/20 border border-linear-purple/30 rounded-sm" />
          <span className="text-linear-text-secondary">Goal: {goalRange.min}-{goalRange.max}%</span>
        </div>
      </div>
    </div>
  )
}