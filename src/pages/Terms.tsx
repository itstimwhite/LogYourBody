import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-svh bg-background text-foreground">
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
        <h1 className="text-xl font-semibold tracking-tight">
          Terms of Service
        </h1>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl space-y-8 p-6">
        <div className="space-y-6">
          <div>
            <h2 className="mb-4 text-2xl font-bold">
              LogYourBody Terms of Service
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">1. Acceptance of Terms</h3>
            <p className="leading-relaxed text-muted-foreground">
              By accessing and using LogYourBody (the "Service"), you accept and
              agree to be bound by the terms and provision of this agreement. If
              you do not agree to abide by the above, please do not use this
              service.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">2. Use License</h3>
            <p className="leading-relaxed text-muted-foreground">
              Permission is granted to temporarily download one copy of
              LogYourBody per device for personal, non-commercial transitory
              viewing only. This is the grant of a license, not a transfer of
              title, and under this license you may not:
            </p>
            <ul className="ml-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>modify or copy the materials</li>
              <li>
                use the materials for any commercial purpose or for any public
                display
              </li>
              <li>
                attempt to reverse engineer any software contained in
                LogYourBody
              </li>
              <li>
                remove any copyright or other proprietary notations from the
                materials
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">
              3. Health Information Disclaimer
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              LogYourBody is designed to help you track your body composition
              data. This information is for tracking purposes only and should
              not be considered medical advice. Always consult with a healthcare
              professional before making significant changes to your diet,
              exercise, or health regimen.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">4. Privacy</h3>
            <p className="leading-relaxed text-muted-foreground">
              Your privacy is important to us. Please review our Privacy Policy,
              which also governs your use of the Service, to understand our
              practices.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">5. Service Availability</h3>
            <p className="leading-relaxed text-muted-foreground">
              We strive to provide reliable service, but we cannot guarantee
              that LogYourBody will be available at all times. We may experience
              hardware, software, or other problems or need to perform
              maintenance related to the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">6. Limitations</h3>
            <p className="leading-relaxed text-muted-foreground">
              In no event shall LogYourBody or its suppliers be liable for any
              damages (including, without limitation, damages for loss of data
              or profit, or due to business interruption) arising out of the use
              or inability to use LogYourBody, even if LogYourBody or a
              LogYourBody authorized representative has been notified orally or
              in writing of the possibility of such damage.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">7. Changes to Terms</h3>
            <p className="leading-relaxed text-muted-foreground">
              LogYourBody may revise these terms of service at any time without
              notice. By using this application, you are agreeing to be bound by
              the then current version of these terms of service.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold">8. Contact Information</h3>
            <p className="leading-relaxed text-muted-foreground">
              If you have any questions about these Terms of Service, please
              contact us at:
            </p>
            <p className="text-foreground">
              Email: support@logyourbody.com
              <br />
              Website: www.logyourbody.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
