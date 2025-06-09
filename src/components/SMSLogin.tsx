import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MessageSquare, Shield, Smartphone } from 'lucide-react';
import { useSMSAuth } from '@/hooks/use-sms-auth';
import { cn } from '@/lib/utils';

interface SMSLoginProps {
  onBack: () => void;
  onSuccess: () => void;
  className?: string;
}

export const SMSLogin = React.memo(function SMSLogin({
  onBack,
  onSuccess,
  className
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
    error
  } = useSMSAuth();

  const [resendCountdown, setResendCountdown] = useState(0);
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-paste functionality for verification codes
  useEffect(() => {
    if (step === 'verification') {
      const handlePaste = (e: ClipboardEvent) => {
        const pastedText = e.clipboardData?.getData('text');
        if (pastedText && /^\d{6}$/.test(pastedText)) {
          setVerificationCode(pastedText);
          // Focus the last input to show the code is complete
          codeInputRefs.current[5]?.focus();
        }
      };

      document.addEventListener('paste', handlePaste);
      return () => document.removeEventListener('paste', handlePaste);
    }
  }, [step, setVerificationCode]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const formatPhoneDisplay = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 10) {
      const formatted = digits.slice(-10);
      return `(${formatted.slice(0, 3)}) ${formatted.slice(3, 6)}-${formatted.slice(6)}`;
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
    const digit = value.replace(/\D/g, '').slice(-1);
    
    // Update the verification code
    const newCode = verificationCode.split('');
    newCode[index] = digit;
    setVerificationCode(newCode.join(''));

    // Auto-focus next input
    if (digit && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  if (step === 'completed') {
    onSuccess();
    return null;
  }

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {step === 'phone' ? (
              <Smartphone className="h-8 w-8 text-primary" />
            ) : (
              <MessageSquare className="h-8 w-8 text-primary" />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {step === 'phone' ? 'Sign in with SMS' : 'Enter verification code'}
          </h1>
          
          <p className="text-muted-foreground">
            {step === 'phone' 
              ? 'We\'ll send you a secure code to verify your phone number'
              : `We sent a 6-digit code to ${formatPhoneDisplay(phoneNumber)}`
            }
          </p>
        </div>
      </div>

      {/* Phone Number Step */}
      {step === 'phone' && (
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              Phone Number
            </CardTitle>
            <CardDescription>
              Enter your mobile phone number to receive a verification code
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-lg h-12"
                  autoComplete="tel"
                  autoFocus
                />
              </div>
              
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  {error}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base"
                disabled={isLoading || !phoneNumber.trim()}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
                    Sending code...
                  </div>
                ) : (
                  'Send verification code'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Verification Step */}
      {step === 'verification' && (
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
              Verification Code
            </CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to your phone
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleCodeSubmit} className="space-y-6">
              {/* Code Input Grid */}
              <div className="flex gap-2 justify-center">
                {Array.from({ length: 6 }, (_, index) => (
                  <Input
                    key={index}
                    ref={(el) => (codeInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={verificationCode[index] || ''}
                    onChange={(e) => handleCodeInput(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-mono"
                    autoComplete="one-time-code"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3 text-center">
                  {error}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base"
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  'Verify code'
                )}
              </Button>
              
              {/* Resend Code */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
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
                    : 'Resend code'
                  }
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      {/* Security Notice */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          <Shield className="h-3 w-3 inline mr-1" />
          Your phone number is encrypted and secure
        </p>
      </div>
    </div>
  );
});