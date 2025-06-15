import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { isValidPhoneNumber } from "react-phone-number-input";

interface UseSMSAuthReturn {
  isLoading: boolean;
  step: "phone" | "verification" | "completed";
  phoneNumber: string;
  verificationCode: string;
  setPhoneNumber: (phone: string) => void;
  setVerificationCode: (code: string) => void;
  sendSMSCode: () => Promise<boolean>;
  verifySMSCode: () => Promise<boolean>;
  resendCode: () => Promise<boolean>;
  resetFlow: () => void;
  error: string | null;
}

export function useSMSAuth(): UseSMSAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"phone" | "verification" | "completed">(
    "phone",
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatPhoneNumber = useCallback((phone: string): string | null => {
    if (!phone || !isValidPhoneNumber(phone)) {
      return null;
    }
    return phone; // Already in E.164 format from the input component
  }, []);

  const sendSMSCode = useCallback(async (): Promise<boolean> => {
    if (!phoneNumber.trim()) {
      setError("Please enter a phone number");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);

      if (!formattedPhone) {
        setError("Invalid phone number format");
        return false;
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          channel: "sms",
        },
      });

      if (error) {
        console.error("SMS send error:", error);
        setError(error.message || "Failed to send verification code");
        return false;
      }

      setStep("verification");
      toast.success("Verification code sent!");
      return true;
    } catch (err: any) {
      console.error("SMS send error:", err);
      setError(err.message || "Failed to send verification code");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber, formatPhoneNumber]);

  const verifySMSCode = useCallback(async (): Promise<boolean> => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      if (!formattedPhone) {
        setError("Invalid phone number format");
        return false;
      }

      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: verificationCode,
        type: "sms",
      });

      if (error) {
        console.error("SMS verification error:", error);
        setError(error.message || "Invalid verification code");
        return false;
      }

      if (data.user) {
        setStep("completed");
        toast.success("Phone number verified successfully!");
        return true;
      }

      setError("Verification failed. Please try again.");
      return false;
    } catch (err: any) {
      console.error("SMS verification error:", err);
      setError(err.message || "Verification failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [verificationCode, phoneNumber, formatPhoneNumber]);

  const resendCode = useCallback(async (): Promise<boolean> => {
    return await sendSMSCode();
  }, [sendSMSCode]);

  const resetFlow = useCallback(() => {
    setStep("phone");
    setPhoneNumber("");
    setVerificationCode("");
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    step,
    phoneNumber,
    verificationCode,
    setPhoneNumber,
    setVerificationCode,
    sendSMSCode,
    verifySMSCode,
    resendCode,
    resetFlow,
    error,
  };
}
