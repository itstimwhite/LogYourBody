import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWebAuthn } from "@/hooks/use-webauthn";
import { Fingerprint, Smartphone, Shield, Trash2, Plus } from "lucide-react";

interface BiometricSetupProps {
  onComplete?: () => void;
}

export function BiometricSetup({ onComplete }: BiometricSetupProps) {
  const {
    isSupported,
    isAvailable,
    isRegistered,
    credentials,
    loading,
    error,
    registerBiometric,
    removeBiometric,
  } = useWebAuthn();

  const [registering, setRegistering] = useState(false);

  const handleRegister = async () => {
    setRegistering(true);
    const success = await registerBiometric();
    setRegistering(false);

    if (success && onComplete) {
      onComplete();
    }
  };

  const handleRemove = async (credentialId: string) => {
    await removeBiometric(credentialId);
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "iOS":
        return <Smartphone className="h-4 w-4" />;
      case "Android":
        return <Smartphone className="h-4 w-4" />;
      case "macOS":
        return <Fingerprint className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getDeviceLabel = (deviceType: string) => {
    switch (deviceType) {
      case "iOS":
        return "Face ID / Touch ID";
      case "Android":
        return "Fingerprint / Face Unlock";
      case "macOS":
        return "Touch ID";
      case "Windows":
        return "Windows Hello";
      default:
        return "Biometric";
    }
  };

  if (!isSupported) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Your device doesn't support biometric authentication.
        </div>
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Biometric authentication is not available on this device. Make sure
          you have Touch ID, Face ID, or fingerprint authentication enabled in
          your device settings.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!isRegistered ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Fingerprint className="h-4 w-4" />
            <span>No biometric credentials registered</span>
          </div>
          <Button
            onClick={handleRegister}
            disabled={registering || loading}
            className="w-full"
          >
            {registering ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                Setting up biometric authentication...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Set up biometric authentication
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Registered devices</span>
            <Badge variant="secondary" className="text-xs">
              {credentials.length} device{credentials.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          <div className="space-y-2">
            {credentials.map((credential) => (
              <div
                key={credential.id}
                className="flex items-center justify-between rounded-md bg-secondary p-3"
              >
                <div className="flex items-center space-x-3">
                  {getDeviceIcon(credential.deviceType)}
                  <div>
                    <div className="text-sm font-medium">
                      {getDeviceLabel(credential.deviceType)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Added{" "}
                      {new Date(credential.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(credential.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            onClick={handleRegister}
            disabled={registering || loading}
            variant="outline"
            className="w-full"
          >
            {registering ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                Adding device...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add another device
              </>
            )}
          </Button>
        </div>
      )}

      <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
        <div className="flex items-start space-x-2">
          <Shield className="mt-0.5 h-3 w-3 flex-shrink-0" />
          <div>
            <p className="mb-1 font-medium">How it works:</p>
            <ul className="space-y-1">
              <li>• Your biometric data never leaves your device</li>
              <li>• Only a secure credential is stored with LogYourBody</li>
              <li>• You can remove access anytime from your settings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
