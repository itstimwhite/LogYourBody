'use client'

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function BrandPage() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = (text: string, item: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(item);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const colors = {
    primary: [
      { name: 'Purple', hex: '#5E6AD2', rgb: 'rgb(94, 106, 210)', usage: 'Primary actions, links' },
      { name: 'Purple Light', hex: '#8B92E8', rgb: 'rgb(139, 146, 232)', usage: 'Hover states' },
      { name: 'Purple Dark', hex: '#4752C4', rgb: 'rgb(71, 82, 196)', usage: 'Active states' },
    ],
    neutral: [
      { name: 'Background', hex: '#09090B', rgb: 'rgb(9, 9, 11)', usage: 'Main background' },
      { name: 'Card', hex: '#18181B', rgb: 'rgb(24, 24, 27)', usage: 'Card backgrounds' },
      { name: 'Border', hex: '#27272A', rgb: 'rgb(39, 39, 42)', usage: 'Borders, dividers' },
    ],
    text: [
      { name: 'Primary', hex: '#FAFAFA', rgb: 'rgb(250, 250, 250)', usage: 'Main text' },
      { name: 'Secondary', hex: '#A1A1AA', rgb: 'rgb(161, 161, 170)', usage: 'Secondary text' },
      { name: 'Tertiary', hex: '#71717A', rgb: 'rgb(113, 113, 122)', usage: 'Disabled, hints' },
    ],
    semantic: [
      { name: 'Success', hex: '#22C55E', rgb: 'rgb(34, 197, 94)', usage: 'Success states' },
      { name: 'Warning', hex: '#F59E0B', rgb: 'rgb(245, 158, 11)', usage: 'Warning states' },
      { name: 'Error', hex: '#EF4444', rgb: 'rgb(239, 68, 68)', usage: 'Error states' },
    ],
  };

  const typography = {
    fonts: [
      { 
        name: 'Inter', 
        weights: ['400', '500', '600', '700'],
        usage: 'Primary font for all UI elements',
        sample: 'The quick brown fox jumps over the lazy dog'
      },
      { 
        name: 'SF Mono', 
        weights: ['400', '500'],
        usage: 'Monospace font for code and numbers',
        sample: '0123456789 {code: "example"}'
      },
    ],
    scale: [
      { name: 'Display', size: '48px', lineHeight: '56px', weight: '700' },
      { name: 'Heading 1', size: '36px', lineHeight: '44px', weight: '700' },
      { name: 'Heading 2', size: '30px', lineHeight: '38px', weight: '600' },
      { name: 'Heading 3', size: '24px', lineHeight: '32px', weight: '600' },
      { name: 'Body Large', size: '18px', lineHeight: '28px', weight: '400' },
      { name: 'Body', size: '16px', lineHeight: '24px', weight: '400' },
      { name: 'Body Small', size: '14px', lineHeight: '20px', weight: '400' },
      { name: 'Caption', size: '12px', lineHeight: '16px', weight: '400' },
    ],
  };

  const logos = [
    { name: 'Full Logo', description: 'Primary logo with wordmark' },
    { name: 'Icon Only', description: 'Standalone icon for small spaces' },
    { name: 'Dark Background', description: 'Light version for dark backgrounds' },
    { name: 'Light Background', description: 'Dark version for light backgrounds' },
  ];

  return (
    <div className="min-h-screen bg-linear-bg font-inter">
      {/* Header */}
      <header className="border-b border-linear-border sticky top-0 bg-linear-bg/80 backdrop-blur-xl z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-linear-text">Brand Guidelines</h1>
            </div>
            <Button className="gap-2" disabled>
              <Download className="h-4 w-4" />
              Download Assets
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-12">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto mb-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-linear-text mb-6">
              LogYourBody Brand
            </h1>
            <p className="text-xl text-linear-text-secondary max-w-2xl mx-auto">
              Our brand represents precision, progress, and the pursuit of physical excellence. 
              These guidelines ensure consistency across all touchpoints.
            </p>
          </div>
        </section>

        {/* Logo Section */}
        <section className="max-w-6xl mx-auto mb-24">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-linear-text mb-4">Logo</h2>
            <p className="text-linear-text-secondary max-w-3xl">
              Our logo embodies strength and progress. Use it consistently to maintain brand recognition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {logos.map((logo) => (
              <div key={logo.name} className="group">
                <div className="bg-linear-card border border-linear-border rounded-xl p-8 h-48 flex items-center justify-center mb-4 transition-all group-hover:border-linear-purple/30">
                  <div className="text-2xl font-bold text-linear-text">LogYourBody</div>
                </div>
                <h3 className="text-lg font-semibold text-linear-text mb-1">{logo.name}</h3>
                <p className="text-sm text-linear-text-secondary">{logo.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-linear-card/50 border border-linear-border rounded-xl">
            <h3 className="text-lg font-semibold text-linear-text mb-4">Usage Guidelines</h3>
            <ul className="space-y-2 text-sm text-linear-text-secondary">
              <li>• Maintain clear space equal to the height of the "L" around the logo</li>
              <li>• Never stretch, rotate, or distort the logo</li>
              <li>• Ensure sufficient contrast between logo and background</li>
              <li>• Minimum size: 24px height for icon, 120px width for full logo</li>
            </ul>
          </div>
        </section>

        {/* Colors Section */}
        <section className="max-w-6xl mx-auto mb-24">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-linear-text mb-4">Colors</h2>
            <p className="text-linear-text-secondary max-w-3xl">
              Our color palette reflects the precision and sophistication of body transformation tracking.
            </p>
          </div>

          {Object.entries(colors).map(([category, colorSet]) => (
            <div key={category} className="mb-12">
              <h3 className="text-xl font-semibold text-linear-text mb-6 capitalize">{category}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {colorSet.map((color) => (
                  <div key={color.name} className="group">
                    <div 
                      className="h-32 rounded-xl mb-4 transition-transform group-hover:scale-105 cursor-pointer relative overflow-hidden"
                      style={{ backgroundColor: color.hex }}
                      onClick={() => copyToClipboard(color.hex, color.name)}
                    >
                      {copiedItem === color.name && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
                            <Check className="h-4 w-4 text-white" />
                            <span className="text-sm font-medium text-white">Copied</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-linear-text">{color.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-linear-text-secondary">
                        <code className="font-mono">{color.hex}</code>
                        <button 
                          onClick={() => copyToClipboard(color.hex, color.name)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm text-linear-text-tertiary">{color.usage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Typography Section */}
        <section className="max-w-6xl mx-auto mb-24">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-linear-text mb-4">Typography</h2>
            <p className="text-linear-text-secondary max-w-3xl">
              Clean, modern typography that enhances readability and conveys professionalism.
            </p>
          </div>

          {/* Font Families */}
          <div className="mb-16">
            <h3 className="text-xl font-semibold text-linear-text mb-6">Font Families</h3>
            <div className="space-y-8">
              {typography.fonts.map((font) => (
                <div key={font.name} className="p-6 bg-linear-card border border-linear-border rounded-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-linear-text mb-1">{font.name}</h4>
                      <p className="text-sm text-linear-text-secondary">{font.usage}</p>
                    </div>
                    <div className="flex gap-2">
                      {font.weights.map((weight) => (
                        <span key={weight} className="text-xs px-2 py-1 bg-linear-bg rounded-md text-linear-text-secondary">
                          {weight}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p 
                    className="text-2xl text-linear-text"
                    style={{ fontFamily: font.name === 'SF Mono' ? 'monospace' : 'Inter' }}
                  >
                    {font.sample}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Type Scale */}
          <div>
            <h3 className="text-xl font-semibold text-linear-text mb-6">Type Scale</h3>
            <div className="space-y-6">
              {typography.scale.map((style) => (
                <div key={style.name} className="flex items-baseline gap-8 p-4 rounded-lg hover:bg-linear-card/50 transition-colors">
                  <div className="w-32 flex-shrink-0">
                    <span className="text-sm text-linear-text-secondary">{style.name}</span>
                  </div>
                  <div className="flex-1">
                    <p 
                      className="text-linear-text"
                      style={{ 
                        fontSize: style.size, 
                        lineHeight: style.lineHeight,
                        fontWeight: style.weight 
                      }}
                    >
                      The quick brown fox jumps over the lazy dog
                    </p>
                  </div>
                  <div className="text-sm text-linear-text-tertiary font-mono">
                    {style.size} / {style.lineHeight}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Voice & Tone Section */}
        <section className="max-w-4xl mx-auto mb-24">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-linear-text mb-4">Voice & Tone</h2>
            <p className="text-linear-text-secondary max-w-3xl">
              We speak with confidence and clarity, focusing on results and transformation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-linear-card border border-linear-border rounded-xl">
              <h3 className="text-lg font-semibold text-linear-text mb-4">We are</h3>
              <ul className="space-y-2 text-linear-text-secondary">
                <li>✓ Direct and honest</li>
                <li>✓ Results-focused</li>
                <li>✓ Encouraging but realistic</li>
                <li>✓ Professional yet approachable</li>
                <li>✓ Data-driven</li>
              </ul>
            </div>
            <div className="p-6 bg-linear-card border border-linear-border rounded-xl">
              <h3 className="text-lg font-semibold text-linear-text mb-4">We are not</h3>
              <ul className="space-y-2 text-linear-text-secondary">
                <li>✗ Preachy or judgmental</li>
                <li>✗ Overly technical</li>
                <li>✗ Making false promises</li>
                <li>✗ Casual or unprofessional</li>
                <li>✗ Vague or ambiguous</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-6 bg-linear-purple/10 border border-linear-purple/20 rounded-xl">
            <h3 className="text-lg font-semibold text-linear-text mb-3">Example messaging</h3>
            <p className="text-linear-text-secondary italic">
              "Track what matters. See real progress. Professional body composition tracking 
              that shows you exactly how you're transforming."
            </p>
          </div>
        </section>

        {/* Download Section */}
        <section className="max-w-4xl mx-auto text-center py-12">
          <div className="p-8 bg-linear-card border border-linear-border rounded-xl">
            <h2 className="text-2xl font-bold text-linear-text mb-4">Need our brand assets?</h2>
            <p className="text-linear-text-secondary mb-6">
              Download logos, colors, and guidelines in various formats.
            </p>
            <Button size="lg" className="gap-2" disabled>
              <Download className="h-5 w-5" />
              Download Brand Package
            </Button>
            <p className="text-sm text-linear-text-tertiary mt-4">Coming soon</p>
          </div>
        </section>
      </main>
    </div>
  );
}