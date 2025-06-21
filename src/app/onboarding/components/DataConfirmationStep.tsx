'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, Check } from 'lucide-react'
import { format } from 'date-fns'

export function DataConfirmationStep() {
  const { data, updateData, nextStep, previousStep } = useOnboarding()
  const [formData, setFormData] = useState({
    weight: data.weight?.toString() || '',
    bodyFatPercentage: data.bodyFatPercentage?.toString() || '',
    leanMass: data.leanMass?.toString() || '',
    fatMass: data.fatMass?.toString() || '',
    boneMass: data.boneMass?.toString() || '',
    scanDate: data.scanDate || format(new Date(), 'yyyy-MM-dd')
  })

  const handleSubmit = () => {
    updateData({
      weight: parseFloat(formData.weight) || undefined,
      bodyFatPercentage: parseFloat(formData.bodyFatPercentage) || undefined,
      leanMass: parseFloat(formData.leanMass) || undefined,
      fatMass: parseFloat(formData.fatMass) || undefined,
      boneMass: parseFloat(formData.boneMass) || undefined,
      scanDate: formData.scanDate
    })
    nextStep()
  }

  const isValid = formData.weight && formData.bodyFatPercentage

  return (
    <Card className="bg-linear-card border-linear-border">
      <CardHeader>
        <CardTitle className="text-linear-text">Confirm your data</CardTitle>
        <CardDescription className="text-linear-text-secondary">
          {data.weight ? 'We extracted this from your PDF' : 'Enter your body composition data'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-linear-text">
              Weight (lbs)
            </Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
              className="bg-linear-bg border-linear-border text-linear-text"
              placeholder="165.5"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bodyFat" className="text-linear-text">
              Body Fat %
            </Label>
            <Input
              id="bodyFat"
              type="number"
              step="0.1"
              value={formData.bodyFatPercentage}
              onChange={(e) => setFormData(prev => ({ ...prev, bodyFatPercentage: e.target.value }))}
              className="bg-linear-bg border-linear-border text-linear-text"
              placeholder="15.5"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="leanMass" className="text-linear-text">
              Lean Mass (lbs)
            </Label>
            <Input
              id="leanMass"
              type="number"
              step="0.1"
              value={formData.leanMass}
              onChange={(e) => setFormData(prev => ({ ...prev, leanMass: e.target.value }))}
              className="bg-linear-bg border-linear-border text-linear-text"
              placeholder="140.0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fatMass" className="text-linear-text">
              Fat Mass (lbs)
            </Label>
            <Input
              id="fatMass"
              type="number"
              step="0.1"
              value={formData.fatMass}
              onChange={(e) => setFormData(prev => ({ ...prev, fatMass: e.target.value }))}
              className="bg-linear-bg border-linear-border text-linear-text"
              placeholder="25.5"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="boneMass" className="text-linear-text">
              Bone Mass (lbs)
            </Label>
            <Input
              id="boneMass"
              type="number"
              step="0.1"
              value={formData.boneMass}
              onChange={(e) => setFormData(prev => ({ ...prev, boneMass: e.target.value }))}
              className="bg-linear-bg border-linear-border text-linear-text"
              placeholder="7.5"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="scanDate" className="text-linear-text">
              Scan Date
            </Label>
            <div className="relative">
              <Input
                id="scanDate"
                type="date"
                value={formData.scanDate}
                onChange={(e) => setFormData(prev => ({ ...prev, scanDate: e.target.value }))}
                className="bg-linear-bg border-linear-border text-linear-text pl-10"
              />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-linear-text-tertiary" />
            </div>
          </div>
        </div>

        {data.weight && (
          <div className="flex items-center gap-2 text-sm text-green-500">
            <Check className="h-4 w-4" />
            <span>Data extracted from your DEXA scan</span>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            variant="ghost"
            onClick={previousStep}
          >
            Back
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            className="ml-auto bg-linear-purple hover:bg-linear-purple/90 text-white"
          >
            Confirm and Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}