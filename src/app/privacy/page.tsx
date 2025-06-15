import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy - LogYourBody',
  description: 'LogYourBody privacy policy - Learn how we protect and handle your data.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold">
              LogYourBody
            </Link>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <p>
            At LogYourBody, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
          </p>

          <h2 className="text-2xl font-semibold mt-8">Information We Collect</h2>
          
          <h3 className="text-xl font-semibold mt-6">Personal Information</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Email address (for account creation and communication)</li>
            <li>Name (optional, for personalization)</li>
            <li>Birthday and gender (for accurate body composition calculations)</li>
            <li>Height and weight measurements</li>
            <li>Body composition data (body fat percentage, measurements)</li>
            <li>Progress photos (optional, stored securely)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6">Health Data</h3>
          <p>
            With your permission, we may access health data from Apple Health or Google Fit to automatically import weight measurements. This data never leaves your device without your explicit consent.
          </p>

          <h2 className="text-2xl font-semibold mt-8">How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and maintain our service</li>
            <li>To calculate and track your body composition metrics</li>
            <li>To send you progress reports and insights</li>
            <li>To improve our algorithms and user experience</li>
            <li>To communicate with you about your account</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8">Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>End-to-end encryption for sensitive health data</li>
            <li>Secure HTTPS connections for all data transfers</li>
            <li>Regular security audits and updates</li>
            <li>Limited access to personal data by our team</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8">Data Sharing</h2>
          <p>
            We <strong>never</strong> sell your personal data. We may share your information only in these circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>With your explicit consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and prevent fraud</li>
            <li>With service providers who help us operate our business (under strict confidentiality agreements)</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8">Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data in a portable format</li>
            <li>Opt-out of marketing communications</li>
            <li>Withdraw consent for data processing</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8">Data Retention</h2>
          <p>
            We retain your data only as long as necessary to provide our services. You can delete your account and all associated data at any time from your account settings.
          </p>

          <h2 className="text-2xl font-semibold mt-8">Children&apos;s Privacy</h2>
          <p>
            LogYourBody is not intended for children under 13. We do not knowingly collect data from children under 13 years of age.
          </p>

          <h2 className="text-2xl font-semibold mt-8">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes via email or through the app.
          </p>

          <h2 className="text-2xl font-semibold mt-8">Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <p>
            Email: privacy@logyourbody.com<br />
            Address: LogYourBody, Inc.<br />
            123 Fitness Street<br />
            San Francisco, CA 94105
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}