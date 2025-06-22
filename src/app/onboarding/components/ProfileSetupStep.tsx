'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DateWheelPicker, HeightWheelPicker } from '@/components/ui/wheel-picker'
import { format } from 'date-fns'

export function ProfileSetupStep() {
  const { data, updateData, nextStep, previousStep } = useOnboarding()
  const [formData, setFormData] = useState({
    fullName: data.fullName || '',
    dateOfBirth: data.dateOfBirth || '',
    dateOfBirthDate: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date(1990, 0, 1),
    height: data.height || 71, // Default 5'11" in inches
    gender: data.gender || 'male' as 'male' | 'female'
  })

  const handleSubmit = () => {
    updateData({
      fullName: formData.fullName,
      dateOfBirth: formData.dateOfBirth,
      height: formData.height,
      gender: formData.gender
    })
    nextStep()
  }

  const isValid = formData.fullName && formData.dateOfBirth && formData.height

  return (
    <Card className="bg-linear-card border-linear-border">
      <CardHeader>
        <CardTitle className="text-linear-text">Profile Setup</CardTitle>
        <CardDescription className="text-linear-text-secondary">
          Tell us a bit about yourself
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-linear-text">
            Name
          </Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            className="bg-linear-bg border-linear-border text-linear-text"
            placeholder="John Doe"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label className="text-linear-text">Date of Birth</Label>
          <DateWheelPicker
            date={formData.dateOfBirthDate}
            onDateChange={(date) => {
              setFormData(prev => ({
                ...prev,
                dateOfBirthDate: date,
                dateOfBirth: format(date, 'yyyy-MM-dd')
              }))
            }}
            className="bg-linear-bg rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-linear-text">Height</Label>
          <HeightWheelPicker
            heightInCm={formData.height * 2.54} // Convert inches to cm
            units="imperial"
            onHeightChange={(heightInCm) => {
              // Store as inches
              setFormData(prev => ({
                ...prev,
                height: Math.round(heightInCm / 2.54)
              }))
            }}
            className="bg-linear-bg rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-linear-text">Gender</Label>
          <RadioGroup
            value={formData.gender}
            onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value as 'male' | 'female' }))}
            className="flex gap-4"
          >
            <label htmlFor="gender-male" className="flex items-center space-x-2 cursor-pointer">
              <RadioGroupItem value="male" id="gender-male" />
              <span className="text-linear-text">Male</span>
            </label>
            <label htmlFor="gender-female" className="flex items-center space-x-2 cursor-pointer">
              <RadioGroupItem value="female" id="gender-female" />
              <span className="text-linear-text">Female</span>
            </label>
          </RadioGroup>
        </div>

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
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}