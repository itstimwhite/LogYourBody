import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '../../components/ui/button'
import { Footer } from '../../components/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service - LogYourBody',
  description: 'LogYourBody terms of service and user agreement.',
}

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <p>
            By using LogYourBody (&ldquo;Service&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you don&apos;t agree to these Terms, please don&apos;t use our Service.
          </p>

          <h2 className="text-2xl font-semibold mt-8">1. Acceptance of Terms</h2>
          <p>
            By accessing or using LogYourBody, you agree to be bound by these Terms and our Privacy Policy. These Terms apply to all visitors, users, and others who access or use the Service.
          </p>

          <h2 className="text-2xl font-semibold mt-8">2. Description of Service</h2>
          <p>
            LogYourBody is a body composition tracking application that helps users monitor their fitness progress through various metrics including weight, body fat percentage, and other health-related data.
          </p>

          <h2 className="text-2xl font-semibold mt-8">3. User Accounts</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must provide accurate and complete information when creating an account</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>You must notify us immediately of any unauthorized access</li>
            <li>You are responsible for all activities under your account</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8">4. User Content</h2>
          <p>
            You retain all rights to your health data and content. By using our Service, you grant us a limited license to process and display your data solely for providing the Service to you.
          </p>

          <h2 className="text-2xl font-semibold mt-8">5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the Service for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with or disrupt the Service</li>
            <li>Upload malicious content or code</li>
            <li>Impersonate others or provide false information</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8">6. Payment Terms</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Subscription fees are billed in advance</li>
            <li>All payments are non-refundable except as required by law</li>
            <li>We reserve the right to change pricing with 30 days notice</li>
            <li>You can cancel your subscription at any time</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8">7. Health Disclaimer</h2>
          <p className="font-semibold">
            LogYourBody is not a medical device and should not be used for medical purposes. Always consult with a healthcare professional before making health decisions.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Our calculations are estimates based on published formulas</li>
            <li>Results may vary based on individual factors</li>
            <li>We are not responsible for decisions made based on our data</li>
            <li>Seek professional medical advice for health concerns</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8">8. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by LogYourBody, Inc. and are protected by international copyright, trademark, and other intellectual property laws.
          </p>

          <h2 className="text-2xl font-semibold mt-8">9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, LogYourBody shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.
          </p>

          <h2 className="text-2xl font-semibold mt-8">10. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless LogYourBody and its officers, directors, employees, and agents from any claims arising from your use of the Service or violation of these Terms.
          </p>

          <h2 className="text-2xl font-semibold mt-8">11. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Service will cease immediately.
          </p>

          <h2 className="text-2xl font-semibold mt-8">12. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Material changes will be notified via email or through the Service. Continued use after changes constitutes acceptance of the new Terms.
          </p>

          <h2 className="text-2xl font-semibold mt-8">13. Governing Law</h2>
          <p>
            These Terms shall be governed by the laws of California, USA, without regard to its conflict of law provisions.
          </p>

          <h2 className="text-2xl font-semibold mt-8">14. Contact Information</h2>
          <p>
            For questions about these Terms, please contact us at:
          </p>
          <p>
            Email: legal@logyourbody.com<br />
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