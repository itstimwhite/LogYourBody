'use client'

import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { format, differenceInDays, isToday, isYesterday, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface TimelineEntry {
  id: string
  date: Date
  weight?: number
  bodyFat?: number
}

interface TimelineSliderProps {
  entries: TimelineEntry[]
  selectedIndex: number
  onIndexChange: (index: number) => void
  className?: string
  showQuickNavigation?: boolean
}

export function TimelineSlider({
  entries,
  selectedIndex,
  onIndexChange,
  className,
  showQuickNavigation = true
}: TimelineSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  // Ensure selected index is within bounds
  const safeSelectedIndex = Math.max(0, Math.min(selectedIndex, entries.length - 1))

  const formatDate = useCallback((date: Date) => {
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    
    const now = new Date()
    const daysDiff = differenceInDays(now, date)
    
    if (daysDiff < 7) {
      return format(date, 'EEEE')
    } else if (daysDiff < 30) {
      return `${daysDiff} days ago`
    } else {
      return format(date, 'MMM d, yyyy')
    }
  }, [])

  const formatDateLong = useCallback((date: Date) => {
    return format(date, 'EEEE, MMMM d, yyyy')
  }, [])

  const handleValueChange = useCallback(
    (value: number[]) => {
      const newIndex = value[0]
      onIndexChange(newIndex)

      // Create accessibility announcement
      const currentEntry = entries[newIndex]
      if (currentEntry) {
        const announcement = `Entry ${newIndex + 1} of ${entries.length}, ${formatDateLong(currentEntry.date)}`
        setAnnouncement(announcement)
      }
    },
    [entries, onIndexChange, formatDateLong]
  )

  const handleSliderStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleSliderEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handlePrevious = useCallback(() => {
    if (safeSelectedIndex > 0) {
      onIndexChange(safeSelectedIndex - 1)
    }
  }, [safeSelectedIndex, onIndexChange])

  const handleNext = useCallback(() => {
    if (safeSelectedIndex < entries.length - 1) {
      onIndexChange(safeSelectedIndex + 1)
    }
  }, [safeSelectedIndex, entries.length, onIndexChange])

  const handleToday = useCallback(() => {
    const todayIndex = entries.findIndex(entry => isToday(entry.date))
    if (todayIndex !== -1) {
      onIndexChange(todayIndex)
    }
  }, [entries, onIndexChange])

  const selectedEntry = useMemo(
    () => entries[safeSelectedIndex],
    [entries, safeSelectedIndex]
  )

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target && (event.target as HTMLElement).getAttribute('role') === 'slider') {
        // Let the slider handle arrow keys naturally
        return
      }

      switch (event.key) {
        case 'ArrowLeft':
          handlePrevious()
          break
        case 'ArrowRight':
          handleNext()
          break
        case 'Home':
          onIndexChange(0)
          break
        case 'End':
          onIndexChange(entries.length - 1)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [entries.length, handleNext, handlePrevious, onIndexChange])

  if (entries.length === 0) {
    return null
  }

  const currentDate = selectedEntry?.date
  const minDate = entries[0]?.date
  const maxDate = entries[entries.length - 1]?.date

  const hasToday = entries.some(entry => isToday(entry.date))

  return (
    <div className={cn("w-full bg-linear-card border-t border-linear-border", className)}>
      <div className="px-4 py-3 md:px-6 md:py-4 space-y-3">
        {/* Current date display */}
        <motion.div 
          className="text-center"
          key={safeSelectedIndex}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-2xl font-semibold text-linear-text" aria-live="polite">
            {currentDate ? formatDate(currentDate) : 'No date'}
          </div>
          <div className="text-sm text-linear-text-secondary mt-1">
            Entry {safeSelectedIndex + 1} of {entries.length}
            {selectedEntry?.weight && (
              <span className="ml-2">• {selectedEntry.weight} kg</span>
            )}
            {selectedEntry?.bodyFat && (
              <span className="ml-1">• {selectedEntry.bodyFat}%</span>
            )}
          </div>
        </motion.div>

        {/* Quick navigation buttons */}
        {showQuickNavigation && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={safeSelectedIndex === 0}
              className="h-8"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            {hasToday && !isToday(currentDate!) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToday}
                className="h-8"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Today
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              disabled={safeSelectedIndex === entries.length - 1}
              className="h-8"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Slider */}
        <div className="px-2 md:px-4">
          <div className="relative">
            <Slider
              value={[safeSelectedIndex]}
              onValueChange={handleValueChange}
              onPointerDown={handleSliderStart}
              onPointerUp={handleSliderEnd}
              onPointerLeave={handleSliderEnd}
              max={entries.length - 1}
              min={0}
              step={1}
              className={cn(
                "w-full",
                "[&_[role=slider]]:h-6 [&_[role=slider]]:w-6",
                "[&_[role=slider]]:border-2 [&_[role=slider]]:border-background",
                "[&_[role=slider]]:shadow-lg",
                isDragging && "[&_[role=slider]]:scale-110",
                "[&_.relative]:h-2"
              )}
              aria-label={`Timeline slider. Entry ${safeSelectedIndex + 1} of ${entries.length}`}
              aria-valuetext={currentDate ? formatDateLong(currentDate) : undefined}
            />

            {/* Visual indicators for notable dates */}
            {entries.length > 1 && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                {entries.map((entry, index) => {
                  const isSelected = index === safeSelectedIndex
                  const isFirst = index === 0
                  const isLast = index === entries.length - 1
                  const isTodayEntry = isToday(entry.date)
                  
                  if (!isFirst && !isLast && !isTodayEntry && !isSelected) {
                    return null
                  }

                  const position = entries.length > 1 
                    ? (index / (entries.length - 1)) * 100 
                    : 50

                  return (
                    <div
                      key={entry.id}
                      className="absolute -translate-x-1/2"
                      style={{ left: `${position}%` }}
                    >
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full transition-all",
                          isSelected && "scale-150 bg-linear-purple",
                          isTodayEntry && !isSelected && "bg-green-500",
                          !isSelected && !isTodayEntry && "bg-linear-border"
                        )}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Date range labels */}
        {entries.length > 1 && minDate && maxDate && (
          <div className="flex justify-between px-2 md:px-4 text-xs text-linear-text-tertiary">
            <span>{format(minDate, 'MMM d, yyyy')}</span>
            <span>{format(maxDate, 'MMM d, yyyy')}</span>
          </div>
        )}
      </div>

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </div>
  )
}