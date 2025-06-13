import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function EmailConfirmationBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if user needs email confirmation
    const needsConfirmation = localStorage.getItem('pending_email_confirmation');
    const userDismissed = localStorage.getItem('email_banner_dismissed');
    
    if (needsConfirmation && !userDismissed && user && !dismissed) {
      setShow(true);
    }
  }, [user, dismissed]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem('email_banner_dismissed', 'true');
  };

  const handleResendEmail = async () => {
    // TODO: Implement resend email functionality
    console.log('Resending confirmation email...');
  };

  if (!show) return null;

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1">
          <span className="text-blue-800 dark:text-blue-200">
            Please check your email and click the confirmation link to fully activate your account.
          </span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendEmail}
            className="h-8 text-xs border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
          >
            Resend
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}