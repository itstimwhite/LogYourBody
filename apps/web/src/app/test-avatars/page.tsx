'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { getAvatarUrl } from '@/utils/avatar-utils-smplx'

export default function TestAvatarsPage() {
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [bodyFat, setBodyFat] = useState(20)
  const [ffmi, setFFMI] = useState(20)
  const [avatarSystem, setAvatarSystem] = useState<'existing' | 'demo' | 'smpl'>('existing')

  // Get avatar URL based on selected system
  const getTestAvatarUrl = () => {
    switch (avatarSystem) {
      case 'demo':
        return `/avatars-wireframe-demo/${gender}/ffmi${String(ffmi).replace('.', '_')}/${gender}_ffmi${String(ffmi).replace('.', '_')}_bf${Math.round(bodyFat / 10) * 10}.png`
      case 'smpl':
        return `/avatars-smpl/${gender}/ffmi${String(ffmi).replace('.', '_')}/${gender}_ffmi${String(ffmi).replace('.', '_')}_bf${bodyFat}.png`
      default:
        return getAvatarUrl(gender, bodyFat, ffmi)
    }
  }

  const avatarUrl = getTestAvatarUrl()

  return (
    <div className="min-h-screen bg-linear-bg p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="bg-linear-card border-linear-border">
          <CardHeader>
            <CardTitle className="text-linear-text">Avatar System Test</CardTitle>
            <CardDescription className="text-linear-text-secondary">
              Test the avatar generation system with different body compositions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Controls */}
              <div className="space-y-6">
                <div>
                  <div className="text-sm font-medium text-linear-text mb-2 block">
                    Gender
                  </div>
                  <ToggleGroup
                    type="single"
                    value={gender}
                    onValueChange={(value) => value && setGender(value as 'male' | 'female')}
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
                  <div className="text-sm font-medium text-linear-text mb-2 block">
                    Body Fat: {bodyFat}%
                  </div>
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

                <div>
                  <div className="text-sm font-medium text-linear-text mb-2 block">
                    FFMI: {ffmi}
                  </div>
                  <Slider
                    value={[ffmi]}
                    onValueChange={([value]) => setFFMI(value)}
                    min={15}
                    max={25}
                    step={2.5}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-linear-text-tertiary">
                    <span>15</span>
                    <span>25</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <div className="text-sm font-medium text-linear-text mb-2 block">
                    Avatar System
                  </div>
                  <ToggleGroup
                    type="single"
                    value={avatarSystem}
                    onValueChange={(value) => value && setAvatarSystem(value as 'existing' | 'demo' | 'smpl')}
                    className="grid grid-cols-3"
                  >
                    <ToggleGroupItem value="existing" className="data-[state=on]:bg-linear-purple data-[state=on]:text-white">
                      Existing
                    </ToggleGroupItem>
                    <ToggleGroupItem value="demo" className="data-[state=on]:bg-linear-purple data-[state=on]:text-white">
                      Wireframe
                    </ToggleGroupItem>
                    <ToggleGroupItem value="smpl" className="data-[state=on]:bg-linear-purple data-[state=on]:text-white">
                      3D Model
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <div className="space-y-2 pt-4 border-t border-linear-border">
                  <h3 className="text-sm font-medium text-linear-text">Avatar Details</h3>
                  <div className="space-y-1 text-xs text-linear-text-secondary">
                    <p>Gender: {gender}</p>
                    <p>Body Fat: {bodyFat}%</p>
                    <p>FFMI: {ffmi}</p>
                    <p>System: {avatarSystem === 'demo' ? 'Wireframe Demo' : avatarSystem === 'smpl' ? '3D Model' : 'Existing Avatars'}</p>
                  </div>
                </div>
              </div>

              {/* Avatar Display */}
              <div className="flex items-center justify-center">
                <div className="relative bg-linear-bg rounded-lg p-8 border border-linear-border">
                  {avatarUrl ? (
                    <div className="relative w-64 h-80">
                      <Image
                        src={avatarUrl}
                        alt={`${gender} avatar at ${bodyFat}% body fat, FFMI ${ffmi}`}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-64 h-80 flex items-center justify-center text-linear-text-tertiary">
                      No avatar available
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      {avatarSystem === 'demo' ? 'Demo' : avatarSystem === 'smpl' ? '3D' : 'Default'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Avatar Grid Preview */}
            <div className="mt-8 pt-8 border-t border-linear-border">
              <h3 className="text-sm font-medium text-linear-text mb-4">
                Available Demo Avatars
              </h3>
              {(avatarSystem === 'demo' || avatarSystem === 'smpl') && (
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {[10, 20, 30, 40].flatMap((bf) => 
                    [17.5, 20, 22.5].map((ffmiVal) => (
                      <div
                        key={`${bf}-${ffmiVal}`}
                        className="cursor-pointer hover:ring-2 hover:ring-linear-purple rounded overflow-hidden"
                        onClick={() => {
                          setBodyFat(bf)
                          setFFMI(ffmiVal)
                        }}
                      >
                        <Image
                          src={avatarSystem === 'demo' 
                            ? `/avatars-wireframe-demo/${gender}/ffmi${String(ffmiVal).replace('.', '_')}/${gender}_ffmi${String(ffmiVal).replace('.', '_')}_bf${bf}.png`
                            : `/avatars-smpl/${gender}/ffmi${String(ffmiVal).replace('.', '_')}/${gender}_ffmi${String(ffmiVal).replace('.', '_')}_bf${bf}.png`
                          }
                          alt={`${bf}% BF, FFMI ${ffmiVal}`}
                          width={64}
                          height={80}
                          className="w-full h-auto"
                          unoptimized
                        />
                        <div className="text-center text-xs text-linear-text-tertiary p-1">
                          {bf}%/{ffmiVal}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}