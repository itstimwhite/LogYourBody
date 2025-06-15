'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog'
import { Calendar, Loader2, X } from 'lucide-react'
import { profileService, type BodyMetric } from '../lib/services/profile'

interface LogEntryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onSuccess?: (metric: BodyMetric) => void
}

export function LogEntryModal({ open, onOpenChange, userId, onSuccess }: LogEntryModalProps) {
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [method, setMethod] = useState<'dexa' | 'scale' | 'calipers' | 'visual'>('scale')
  const [muscleMass, setMuscleMass] = useState('')
  const [boneMass, setBoneMass] = useState('')
  const [waterPercentage, setWaterPercentage] = useState('')

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0])
    setWeight('')
    setBodyFat('')
    setMethod('scale')
    setMuscleMass('')
    setBoneMass('')
    setWaterPercentage('')
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!weight || !bodyFat) {
        setError('Weight and body fat percentage are required')
        return
      }

      const weightNum = parseFloat(weight)
      const bodyFatNum = parseFloat(bodyFat)

      if (isNaN(weightNum) || isNaN(bodyFatNum)) {
        setError('Please enter valid numbers for weight and body fat')
        return
      }

      if (bodyFatNum < 1 || bodyFatNum > 50) {
        setError('Body fat percentage must be between 1% and 50%')
        return
      }

      const metricData: Omit<BodyMetric, 'id' | 'created_at'> = {
        user_id: userId,
        date,
        weight: weightNum,
        body_fat_percentage: bodyFatNum,
        method,
        muscle_mass: muscleMass ? parseFloat(muscleMass) : null,
        bone_mass: boneMass ? parseFloat(boneMass) : null,
        water_percentage: waterPercentage ? parseFloat(waterPercentage) : null,
        photo_url: null,
        step_count: null,
      }

      const result = await profileService.createBodyMetric(metricData)

      if (result) {
        resetForm()
        onOpenChange(false)
        onSuccess?.(result)
        router.refresh() // Refresh to show new data
      } else {
        setError('Failed to save entry. Please try again.')
      }
    } catch (err) {
      console.error('Error saving metric:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      resetForm()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md border-linear-border bg-linear-card text-linear-text">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Log Body Metrics
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={loading}
              className="h-8 w-8 text-linear-text-secondary hover:text-linear-text"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
              className="border-linear-border bg-linear-bg text-linear-text"
            />
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (lbs) *</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="50"
              max="500"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 180.5"
              required
              className="border-linear-border bg-linear-bg text-linear-text"
            />
          </div>

          {/* Body Fat */}
          <div className="space-y-2">
            <Label htmlFor="bodyFat">Body Fat Percentage (%) *</Label>
            <Input
              id="bodyFat"
              type="number"
              step="0.1"
              min="1"
              max="50"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              placeholder="e.g. 15.2"
              required
              className="border-linear-border bg-linear-bg text-linear-text"
            />
          </div>

          {/* Method */}
          <div className="space-y-2">
            <Label htmlFor="method">Measurement Method</Label>
            <Select value={method} onValueChange={(value) => setMethod(value as typeof method)}>
              <SelectTrigger className="border-linear-border bg-linear-bg text-linear-text">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-linear-border bg-linear-card">
                <SelectItem value="scale">Smart Scale</SelectItem>
                <SelectItem value="dexa">DEXA Scan</SelectItem>
                <SelectItem value="calipers">Body Fat Calipers</SelectItem>
                <SelectItem value="visual">Visual Estimation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Optional fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="muscleMass">Muscle Mass (lbs)</Label>
              <Input
                id="muscleMass"
                type="number"
                step="0.1"
                min="0"
                value={muscleMass}
                onChange={(e) => setMuscleMass(e.target.value)}
                placeholder="Optional"
                className="border-linear-border bg-linear-bg text-linear-text"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="boneMass">Bone Mass (lbs)</Label>
              <Input
                id="boneMass"
                type="number"
                step="0.1"
                min="0"
                value={boneMass}
                onChange={(e) => setBoneMass(e.target.value)}
                placeholder="Optional"
                className="border-linear-border bg-linear-bg text-linear-text"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="waterPercentage">Water Percentage (%)</Label>
            <Input
              id="waterPercentage"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={waterPercentage}
              onChange={(e) => setWaterPercentage(e.target.value)}
              placeholder="Optional"
              className="border-linear-border bg-linear-bg text-linear-text"
            />
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-linear-text text-linear-bg hover:bg-linear-text/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Entry'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}