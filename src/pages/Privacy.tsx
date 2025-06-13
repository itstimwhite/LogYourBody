import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border px-6 py-4">
        <Button
          size="icon"
          variant="outline"
          onClick={() => navigate("/")}
          className="h-10 w-10 border-border bg-secondary text-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">Privacy Policy</h1>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl space-y-8 p-6">
        <div className="space-y-6">
          <div>
            <h2 className="mb-4 text-2xl font-bold">
              LogYourBody Privacy Policy
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">1. Information We Collect</h3>
            <p className="leading-relaxed text-muted-foreground">
              LogYourBody collects information you provide directly to us, such
              as when you create an account, log body measurements, or contact
              us for support.
            </p>
            <div className="space-y-3">
              <h4 className="text-lg font-medium">Personal Information:</h4>
              <ul className="ml-4 list-inside list-disc space-y-2 text-muted-foreground">
                <li>Name and email address</li>
                <li>Date of birth and biological sex</li>
                <li>Height and physical measurements</li>
                <li>
                  Body composition data (weight, body fat percentage, etc.)
                </li>
                <li>Photos you choose to upload</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">
              2. How We Use Your Information
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              We use the information we collect to:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>Provide, maintain, and improve our services</li>
              <li>Calculate and display your body composition metrics</li>
              <li>
                Sync data with health platforms (when you choose to enable this)
              </li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">
              3. Health Data Integration
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              When you choose to sync with Apple HealthKit or Google Fit, we
              only access the specific health data types you authorize. This
              data is used solely to enhance your LogYourBody experience and is
              never shared with third parties.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">4. Information Sharing</h3>
            <p className="leading-relaxed text-muted-foreground">
              We do not sell, trade, or otherwise transfer your personal
              information to third parties. Your health and body composition
              data is private and remains under your control.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              We may share information in the following limited circumstances:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>
                In connection with a business transfer (with prior notice to
                you)
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">5. Data Security</h3>
            <p className="leading-relaxed text-muted-foreground">
              We implement appropriate technical and organizational security
              measures to protect your personal information against unauthorized
              access, alteration, disclosure, or destruction. All data is
              encrypted in transit and at rest.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">6. Data Retention</h3>
            <p className="leading-relaxed text-muted-foreground">
              We retain your personal information only for as long as necessary
              to provide our services and comply with legal obligations. You can
              delete your account and associated data at any time through the
              app settings.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">7. Your Rights</h3>
            <p className="leading-relaxed text-muted-foreground">
              You have the right to:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>Access and review your personal information</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Delete your account and associated data</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of certain communications</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">8. Children's Privacy</h3>
            <p className="leading-relaxed text-muted-foreground">
              LogYourBody is not intended for use by children under the age of
              13. We do not knowingly collect personal information from children
              under 13.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">9. Changes to This Policy</h3>
            <p className="leading-relaxed text-muted-foreground">
              We may update this privacy policy from time to time. We will
              notify you of any changes by posting the new privacy policy on
              this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">10. Contact Us</h3>
            <p className="leading-relaxed text-muted-foreground">
              If you have any questions about this Privacy Policy, please
              contact us at:
            </p>
            <p className="text-foreground">
              Email: privacy@logyourbody.com
              <br />
              Website: www.logyourbody.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
