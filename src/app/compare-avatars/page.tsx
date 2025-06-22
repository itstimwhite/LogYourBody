'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Button } from '@/components/ui/button'

const BODY_FAT_PERCENTAGES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]

export default function CompareAvatarsPage() {
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [bodyFat, setBodyFat] = useState(20)

  const genderPrefix = gender === 'male' ? 'm' : 'f'
  const existingAvatar = `/avatars/${genderPrefix}_bf${bodyFat}.png`
  const newAvatar = `/avatars-v2/${genderPrefix}_bf${bodyFat}.png`

  return (
    <div className="min-h-screen bg-linear-bg p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-linear-text mb-2">Avatar Comparison</h1>
          <p className="text-linear-text-secondary">Compare existing avatars with new 3D rendered versions</p>
        </div>

        {/* Controls */}
        <Card className="bg-linear-card border-linear-border">
          <CardHeader>
            <CardTitle className="text-linear-text">Avatar Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-linear-text mb-2 block">
                Gender
              </label>
              <ToggleGroup
                type="single"
                value={gender}
                onValueChange={(value) => value && setGender(value as 'male' | 'female')}
                className="grid grid-cols-2 w-full max-w-xs"
              >
                <ToggleGroupItem value="male" className="data-[state=on]:bg-linear-purple data-[state=on]:text-white">
                  Male
                </ToggleGroupItem>
                <ToggleGroupItem value="female" className="data-[state=on]:bg-linear-purple data-[state=on]:text-white">
                  Female
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div>
              <label className="text-sm font-medium text-linear-text mb-2 block">
                Body Fat: {bodyFat}%
              </label>
              <Slider
                value={[bodyFat]}
                onValueChange={([value]) => setBodyFat(value)}
                min={5}
                max={50}
                step={5}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-linear-text-tertiary">
                <span>5%</span>
                <span>50%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-linear-card border-linear-border">
            <CardHeader>
              <CardTitle className="text-linear-text">Existing Avatar</CardTitle>
              <CardDescription className="text-linear-text-secondary">
                Current SVG/PNG avatars
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-linear-bg rounded-lg p-8 flex items-center justify-center">
                <div className="relative w-48 h-64">
                  <Image
                    src={existingAvatar}
                    alt={`Existing ${gender} avatar at ${bodyFat}% body fat`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-card border-linear-border">
            <CardHeader>
              <CardTitle className="text-linear-text">New 3D Avatar</CardTitle>
              <CardDescription className="text-linear-text-secondary">
                3D rendered avatars with body composition modeling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-linear-bg rounded-lg p-8 flex items-center justify-center">
                <div className="relative w-48 h-64">
                  <Image
                    src={newAvatar}
                    alt={`New ${gender} avatar at ${bodyFat}% body fat`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Selection Grid */}
        <Card className="bg-linear-card border-linear-border">
          <CardHeader>
            <CardTitle className="text-linear-text">Quick Selection</CardTitle>
            <CardDescription className="text-linear-text-secondary">
              Click to view different body fat percentages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {BODY_FAT_PERCENTAGES.map((bf) => (
                <Button
                  key={bf}
                  variant={bodyFat === bf ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBodyFat(bf)}
                  className={bodyFat === bf ? "bg-linear-purple" : ""}
                >
                  {bf}%
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-linear-card border-linear-border">
          <CardHeader>
            <CardTitle className="text-linear-text">About the New Avatars</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-linear-text-secondary">
            <p>
              The new avatars are generated using 3D body modeling techniques that more accurately 
              represent body composition changes based on body fat percentage.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>More realistic body proportions</li>
              <li>Gender-specific body shape differences</li>
              <li>Smooth transitions between body fat percentages</li>
              <li>Consistent lighting and rendering</li>
              <li>Transparent backgrounds for better integration</li>
            </ul>
            <p className="pt-4">
              To use the new avatars in production, simply move the files from 
              <code className="bg-linear-bg px-2 py-1 rounded text-xs"> public/avatars-v2/ </code>
              to 
              <code className="bg-linear-bg px-2 py-1 rounded text-xs"> public/avatars/ </code>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}