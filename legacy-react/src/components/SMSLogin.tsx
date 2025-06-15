import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MessageSquare, Shield, Smartphone } from "lucide-react";
import { useSMSAuth } from "@/hooks/use-sms-auth";
import { cn } from "@/lib/utils";
import { AsYouType, parsePhoneNumberFromString } from "libphonenumber-js";

interface SMSLoginProps {
  onBack: () => void;
  onSuccess: () => void;
  className?: string;
}

export const SMSLogin = React.memo(function SMSLogin({
  onBack,
  onSuccess,
  className,
}: SMSLoginProps) {
  const {
    isLoading,
    step,
    phoneNumber,
    verificationCode,
    setPhoneNumber,
    setVerificationCode,
    sendSMSCode,
    verifySMSCode,
    resendCode,
    error,
  } = useSMSAuth();

  const [resendCountdown, setResendCountdown] = useState(0);
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isPhoneValid = !!parsePhoneNumberFromString(phoneNumber, "US")?.isValid();

  // Auto-paste functionality for verification codes
  useEffect(() => {
    if (step === "verification") {
      const handlePaste = (e: ClipboardEvent) => {
        const pastedText = e.clipboardData?.getData("text");
        if (pastedText && /^\d{6}$/.test(pastedText)) {
          setVerificationCode(pastedText);
          // Focus the last input to show the code is complete
          codeInputRefs.current[5]?.focus();
        }
      };

      document.addEventListener("paste", handlePaste);
      return () => document.removeEventListener("paste", handlePaste);
    }
  }, [step, setVerificationCode]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(
        () => setResendCountdown(resendCountdown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const formatPhoneDisplay = (phone: string) => {
    const parsed = parsePhoneNumberFromString(phone, "US");
    if (parsed) {
      return parsed.formatInternational();
    }
    return phone;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await sendSMSCode();
    if (success) {
      setResendCountdown(60);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await verifySMSCode();
    if (success) {
      onSuccess();
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    const success = await resendCode();
    if (success) {
      setResendCountdown(60);
    }
  };

  const handleCodeInput = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);

    // Update the verification code
    const newCode = verificationCode.split("");
    newCode[index] = digit;
    setVerificationCode(newCode.join(""));

    // Auto-focus next input
    if (digit && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  if (step === "completed") {
    onSuccess();
    return null;
  }

  return (
    <div className={cn("mx-auto w-full max-w-md", className)}>
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="-ml-2 mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Phone Number Step */}
      {step === "phone" && (
        <div className="space-y-6">
          {/* Icon and title */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Smartphone className="h-7 w-7 text-primary" />
            </div>
            <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
              Sign in with SMS
            </h1>
            <p className="text-sm text-muted-foreground">
              We'll send you a secure code to verify your phone number
            </p>
          </div>

          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 555 123 4567"
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(new AsYouType("US").input(e.target.value))
                }
                className="h-12 text-base"
                autoComplete="tel"
                autoFocus
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="h-12 w-full text-base font-medium"
              disabled={isLoading || !isPhoneValid}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                  Sending code...
                </div>
              ) : (
                "Send verification code"
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Verification Step */}
      {step === "verification" && (
        <div className="space-y-6">
          {/* Icon and title */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <MessageSquare className="h-7 w-7 text-primary" />
            </div>
            <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
              Enter verification code
            </h1>
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code to {formatPhoneDisplay(phoneNumber)}
            </p>
          </div>

          <form onSubmit={handleCodeSubmit} className="space-y-6">
            {/* Code Input Grid */}
            <div className="flex justify-center gap-2">
              {Array.from({ length: 6 }, (_, index) => (
                <Input
                  key={index}
                  ref={(el) => (codeInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={verificationCode[index] || ""}
                  onChange={(e) => handleCodeInput(index, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(index, e)}
                  className="h-12 w-12 text-center font-mono text-lg"
                  autoComplete="one-time-code"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="h-12 w-full text-base font-medium"
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                  Verifying...
                </div>
              ) : (
                "Verify code"
              )}
            </Button>

            {/* Resend Code */}
            <div className="text-center">
              <p className="mb-2 text-sm text-muted-foreground">
                Didn't receive the code?
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={resendCountdown > 0 || isLoading}
                className="text-primary hover:text-primary/80"
              >
                {resendCountdown > 0
                  ? `Resend in ${resendCountdown}s`
                  : "Resend code"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Shield className="h-3 w-3" />
        <span>Your phone number is encrypted and secure</span>
      </div>
    </div>
  );
});
