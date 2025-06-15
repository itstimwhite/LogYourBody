'use client'

import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import {
  Users,
  Heart,
  Target,
  Lightbulb,
  Clock,
  Briefcase,
  Mail,
  Coffee,
  Home,
  Globe,
} from 'lucide-react'

export default function CareersPage() {
  const coreValues = [
    {
      icon: Heart,
      title: "Health First",
      description: "We're passionate about helping people understand their bodies and achieve their fitness goals through data-driven insights.",
    },
    {
      icon: Target,
      title: "Precision & Accuracy",
      description: "Every metric matters. We build tools that provide accurate, reliable data people can trust to make important health decisions.",
    },
    {
      icon: Users,
      title: "User-Centric Design",
      description: "Our users' success is our success. We design every feature with real people and real use cases in mind.",
    },
    {
      icon: Lightbulb,
      title: "Innovation & Growth",
      description: "We're always learning, experimenting, and pushing the boundaries of what's possible in fitness technology.",
    },
  ];


  const benefits = [
    {
      icon: Home,
      title: "Remote-First Culture",
      description: "Work from anywhere in the world. We believe great work happens when people have the flexibility they need.",
    },
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive health insurance, mental health support, and a $500 annual fitness stipend.",
    },
    {
      icon: Coffee,
      title: "Learning & Growth",
      description: "$2,000 annual learning budget for courses, conferences, and books. We invest in your professional development.",
    },
    {
      icon: Clock,
      title: "Flexible Schedule",
      description: "Flexible working hours and unlimited PTO. We trust you to manage your time and deliver great work.",
    },
    {
      icon: Globe,
      title: "Equity & Ownership",
      description: "Every team member gets equity. When LogYourBody succeeds, everyone succeeds.",
    },
    {
      icon: Users,
      title: "Amazing Team",
      description: "Work with passionate, talented people who care about making a real impact on people's health.",
    },
  ];

  const handleApply = (position: string) => {
    const subject = encodeURIComponent(`Application for ${position} - LogYourBody`);
    const body = encodeURIComponent(`Hi LogYourBody team,

I'm interested in applying for the ${position} position. 

Please find my resume attached, and I'd love to discuss how I can contribute to your mission of helping people track what really matters.

Best regards,
[Your Name]`);
    
    window.open(`mailto:careers@logyourbody.com?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-linear-bg font-inter">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-6 bg-linear-purple/10 text-linear-purple border-linear-purple/20 inline-block">
                Join Our Mission
              </Badge>
              <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-linear-text">
                Help people track what
                <br />
                <span className="bg-gradient-to-r from-linear-purple via-linear-text to-linear-purple bg-clip-text text-transparent">
                  really matters
                </span>
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-linear-text-secondary">
                We&apos;re building the future of body composition tracking. Join our remote-first team 
                and help millions of people understand their bodies better.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  className="bg-linear-text text-linear-bg px-8 py-4 text-base font-medium rounded-xl hover:bg-linear-text-secondary transition-all duration-200 hover:scale-105 shadow-lg"
                  onClick={() => document.getElementById('open-positions')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  View Open Positions
                </Button>
                <Button
                  variant="ghost"
                  className="border border-linear-border/50 text-linear-text-secondary hover:bg-linear-border/30 hover:text-linear-text px-8 py-4 text-base rounded-xl transition-all backdrop-blur-sm"
                  onClick={() => handleApply("General Application")}
                >
                  Apply Generally
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 bg-linear-card/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl sm:text-4xl font-bold text-linear-text">
                Our Core Values
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-linear-text-secondary">
                These values guide everything we do, from product decisions to how we work together.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {coreValues.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <div
                    key={index}
                    className="rounded-lg border border-linear-border bg-linear-bg p-6 text-center"
                  >
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-linear-purple/10">
                      <IconComponent className="h-6 w-6 text-linear-purple" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-linear-text">
                      {value.title}
                    </h3>
                    <p className="text-sm text-linear-text-secondary leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section id="open-positions" className="py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl sm:text-4xl font-bold text-linear-text">
                Open Positions
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-linear-text-secondary">
                We&apos;re looking for passionate people to join our mission. All positions are remote-first.
              </p>
            </div>

            <Card className="border-linear-border bg-linear-card">
              <CardContent className="text-center py-16">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-linear-purple/10">
                  <Briefcase className="h-8 w-8 text-linear-purple/60" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-linear-text">
                  No Open Positions
                </h3>
                <p className="mb-6 text-linear-text-secondary max-w-md mx-auto">
                  We don&apos;t have any open positions at the moment, but we&apos;re always interested in hearing from talented people who share our passion for health technology.
                </p>
                <Button
                  onClick={() => handleApply("General Application")}
                  variant="outline"
                  className="border-linear-border text-linear-text hover:bg-linear-border/30"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send General Application
                </Button>
              </CardContent>
            </Card>

            {/* No Perfect Match CTA */}
            <div className="mt-16 text-center">
              <Card className="border-linear-border bg-linear-card/50">
                <CardHeader>
                  <CardTitle className="text-xl text-linear-text">
                    Don&apos;t see a perfect match?
                  </CardTitle>
                  <CardDescription className="text-linear-text-secondary">
                    We&apos;re always looking for talented people who share our passion for health technology.
                    Send us your resume and tell us how you&apos;d like to contribute.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleApply("General Application")}
                    variant="outline"
                    className="border-linear-border text-linear-text hover:bg-linear-border/30"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send General Application
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits & Perks */}
        <section className="py-20 bg-linear-card/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl sm:text-4xl font-bold text-linear-text">
                Benefits & Perks
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-linear-text-secondary">
                We believe in taking care of our team so they can do their best work.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div
                    key={index}
                    className="rounded-lg border border-linear-border bg-linear-bg p-6"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-linear-purple/10">
                      <IconComponent className="h-6 w-6 text-linear-purple" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-linear-text">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-linear-text-secondary leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="mb-6 text-4xl sm:text-5xl font-bold tracking-tight text-linear-text">
                Ready to make an impact?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-linear-text-secondary">
                Join us in building the future of health tracking. Help millions of people 
                understand their bodies and achieve their fitness goals.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  className="bg-linear-text text-linear-bg px-8 py-4 text-base font-medium rounded-xl hover:bg-linear-text-secondary transition-all duration-200 hover:scale-105 shadow-lg"
                  onClick={() => document.getElementById('open-positions')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Browse Positions
                </Button>
                <Button
                  variant="ghost"
                  className="border border-linear-border/50 text-linear-text-secondary hover:bg-linear-border/30 hover:text-linear-text px-8 py-4 text-base rounded-xl transition-all backdrop-blur-sm"
                  onClick={() => window.open("mailto:careers@logyourbody.com", '_blank')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Get in Touch
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}