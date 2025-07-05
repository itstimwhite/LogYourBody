'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Smartphone,
  Download,
  Apple,
  QrCode,
  Star,
  ArrowRight,
  BarChart3,
  Camera,
  Zap,
  Shield,
  TrendingUp,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

export default function MobilePage() {
  const [showQR, setShowQR] = useState(false)

  const features = [
    {
      icon: BarChart3,
      title: 'FFMI Tracking',
      description: 'Know your genetic potential with accurate fat-free mass index calculations',
    },
    {
      icon: Camera,
      title: 'Progress Photos',
      description: 'Automated reminders with consistent angles to see changes over time',
    },
    {
      icon: Zap,
      title: '30-Second Logging',
      description: 'Complete body composition metrics faster than tying your shoes',
    },
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description: 'Trend predictions and weekly reports to optimize your progress',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data stays yours. Export anytime, delete anytime',
    },
    {
      icon: Clock,
      title: 'Health Sync',
      description: 'Seamless integration with Apple Health and Google Fit',
    },
  ]

  const testimonials = [
    {
      name: 'Alex Chen',
      role: 'Software Engineer',
      content: 'Finally found an app that tracks what actually matters for body composition.',
      rating: 5,
    },
    {
      name: 'Sarah Miller',
      role: 'Personal Trainer',
      content: 'I recommend this to all my clients. The FFMI tracking is game-changing.',
      rating: 5,
    },
    {
      name: 'Mike Rodriguez',
      role: 'Fitness Enthusiast',
      content: 'Love how it integrates with Apple Health. Makes logging effortless.',
      rating: 5,
    },
  ]

  // Generate QR code data URL (placeholder - in real app this would be actual QR)
  const generateQRCode = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iNjAiIHk9IjIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjEwMCIgeT0iMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iMTQwIiB5PSIyMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJibGFjayIvPgo8cmVjdCB4PSIxNjAiIHk9IjIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjIwIiB5PSI2MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJibGFjayIvPgo8cmVjdCB4PSI4MCIgeT0iNjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iMTIwIiB5PSI2MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJibGFjayIvPgo8cmVjdCB4PSIxNjAiIHk9IjYwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjQwIiB5PSIxMDAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iMTAwIiB5PSIxMDAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iMTQwIiB5PSIxMDAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iMjAiIHk9IjE0MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJibGFjayIvPgo8cmVjdCB4PSI4MCIgeT0iMTQwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjEyMCIgeT0iMTQwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjE2MCIgeT0iMTQwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjYwIiB5PSIxNjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iMTAwIiB5PSIxNjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iMTQwIiB5PSIxNjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz4KPC9zdmc+'
  }

  const handleDownload = (platform: 'ios' | 'android') => {
    if (platform === 'ios') {
      window.open('https://apps.apple.com/app/logyourbody', '_blank')
    } else {
      window.open('https://play.google.com/store/apps/details?id=com.logyourbody.app', '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-linear-bg font-inter">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-6 bg-linear-purple/10 text-linear-purple border-linear-purple/20 inline-block">
                <Smartphone className="h-3 w-3 mr-2" />
                Mobile App
              </Badge>
              
              <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-linear-text">
                Body composition tracking
                <br />
                <span className="bg-gradient-to-r from-linear-purple via-linear-text to-linear-purple bg-clip-text text-transparent">
                  in your pocket
                </span>
              </h1>
              
              <p className="mx-auto mb-8 max-w-2xl text-lg text-linear-text-secondary">
                Track FFMI, body fat percentage, and progress photos with professional-grade accuracy. 
                The most advanced body composition app available on iOS and Android.
              </p>

              {/* Download Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Button
                  onClick={() => handleDownload('ios')}
                  className="bg-linear-text text-linear-bg px-8 py-4 text-base font-medium rounded-xl hover:bg-linear-text-secondary transition-all duration-200 hover:scale-105 shadow-lg min-w-[200px]"
                >
                  <Apple className="h-5 w-5 mr-2" />
                  Download for iOS
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleDownload('android')}
                  className="border border-linear-border text-linear-text hover:bg-linear-border/30 px-8 py-4 text-base rounded-xl transition-all min-w-[200px]"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Get on Android
                </Button>
              </div>

              {/* QR Code Section */}
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => setShowQR(!showQR)}
                  className="text-linear-text-secondary hover:text-linear-text transition-colors"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan QR code to download
                </Button>
                
                {showQR && (
                  <div className="mt-6 inline-block p-6 bg-white rounded-2xl shadow-xl">
                    <Image
                      src={generateQRCode()}
                      alt="Download QR Code"
                      width={128}
                      height={128}
                      className="w-32 h-32 mx-auto"
                    />
                    <p className="text-xs text-gray-600 mt-2">Scan with your camera</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Background decorations */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-20 h-20 bg-linear-purple/5 rounded-full"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-linear-purple/5 rounded-full"></div>
            <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-linear-purple/20 rounded-full"></div>
            <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-linear-purple/30 rounded-full"></div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 bg-linear-card/20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-linear-text">
                Everything you need to track real progress
              </h2>
              <p className="text-linear-text-secondary max-w-2xl mx-auto">
                Professional-grade body composition tracking with the simplicity of a modern mobile app.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <Card key={index} className="border-linear-border bg-linear-bg hover:shadow-lg transition-all">
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-linear-purple/10 mb-4">
                        <IconComponent className="h-6 w-6 text-linear-purple" />
                      </div>
                      <h3 className="mb-3 text-lg font-semibold text-linear-text">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-linear-text-secondary leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Device Mockup */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-md">
              <div className="relative">
                {/* Phone Frame */}
                <div className="relative mx-auto w-72 h-[600px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                  <div className="w-full h-full bg-linear-bg rounded-[2.5rem] overflow-hidden">
                    {/* Status Bar */}
                    <div className="h-12 bg-linear-card flex items-center justify-between px-6">
                      <div className="text-xs text-linear-text font-medium">9:41</div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 bg-linear-text rounded-sm"></div>
                        <div className="w-6 h-3 border border-linear-text rounded-sm">
                          <div className="w-4 h-full bg-linear-text rounded-sm"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* App Content */}
                    <div className="p-6 space-y-6">
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-linear-text mb-2">Dashboard</h3>
                        <p className="text-sm text-linear-text-secondary">Your progress at a glance</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-linear-card p-4 rounded-xl">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-linear-text-secondary">FFMI</span>
                            <span className="text-lg font-bold text-linear-text">21.4</span>
                          </div>
                          <div className="w-full bg-linear-border rounded-full h-2">
                            <div className="bg-linear-purple h-2 rounded-full w-3/4"></div>
                          </div>
                        </div>
                        
                        <div className="bg-linear-card p-4 rounded-xl">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-linear-text-secondary">Body Fat</span>
                            <span className="text-lg font-bold text-linear-text">12.3%</span>
                          </div>
                          <div className="w-full bg-linear-border rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full w-1/3"></div>
                          </div>
                        </div>
                        
                        <div className="bg-linear-card p-4 rounded-xl">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-linear-text-secondary">Weight</span>
                            <span className="text-lg font-bold text-linear-text">180 lbs</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button className="w-full bg-linear-text text-linear-bg rounded-xl py-3">
                        Log New Measurement
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Floating Stats */}
                <div className="absolute -top-4 -left-4 bg-linear-bg/90 backdrop-blur-sm border border-linear-border/50 rounded-xl p-3 shadow-lg">
                  <div className="text-center">
                    <div className="text-xl font-bold text-linear-text">4.9★</div>
                    <div className="text-xs text-linear-text-secondary">App Store</div>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -right-4 bg-linear-bg/90 backdrop-blur-sm border border-linear-border/50 rounded-xl p-3 shadow-lg">
                  <div className="text-center">
                    <div className="text-xl font-bold text-linear-text">10K+</div>
                    <div className="text-xs text-linear-text-secondary">Downloads</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16 bg-linear-card/20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-linear-text">
                Loved by fitness enthusiasts worldwide
              </h2>
              <p className="text-linear-text-secondary">
                Join thousands who&apos;ve already discovered better body composition tracking
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border-linear-border bg-linear-bg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-linear-text-secondary mb-4 italic">
                      &quot;{testimonial.content}&quot;
                    </p>
                    <div>
                      <div className="font-semibold text-linear-text">{testimonial.name}</div>
                      <div className="text-sm text-linear-text-secondary">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-linear-text mb-4">
              Ready to track real progress?
            </h2>
            <p className="text-linear-text-secondary mb-8 max-w-2xl mx-auto">
              Download LogYourBody today and start seeing your body composition changes with scientific accuracy.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => handleDownload('ios')}
                className="bg-linear-text text-linear-bg px-8 py-4 text-base font-medium rounded-xl hover:bg-linear-text-secondary transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <Apple className="h-5 w-5 mr-2" />
                Download for iOS
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border border-linear-border text-linear-text hover:bg-linear-border/30 px-8 py-4 text-base rounded-xl transition-all"
                >
                  Try Web Version
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}