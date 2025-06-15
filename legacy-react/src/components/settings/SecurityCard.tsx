import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { tw, settingsTokens } from "@/styles/settings-design";
import { SettingGroup, SettingItem } from "./SettingGroup";
import { Switch } from "./Switch";

interface SecurityCardProps {
  biometricEnabled: boolean;
  onBiometricToggle: (enabled: boolean) => void;
  twoFactorEnabled: boolean;
  onTwoFactorToggle: (enabled: boolean) => void;
  onChangePassword: () => void;
  onViewSessions: () => void;
  className?: string;
}

interface BiometricSupport {
  isAvailable: boolean;
  type: "faceId" | "touchId" | "fingerprint" | "none";
  deviceName: string;
}

export const SecurityCard = React.memo<SecurityCardProps>(
  function SecurityCard({
    biometricEnabled,
    onBiometricToggle,
    twoFactorEnabled,
    onTwoFactorToggle,
    onChangePassword,
    onViewSessions,
    className,
  }) {
    const [biometricSupport, setBiometricSupport] = useState<BiometricSupport>({
      isAvailable: false,
      type: "none",
      deviceName: "Device",
    });
    const [isCheckingBiometric, setIsCheckingBiometric] = useState(true);
    const [biometricLoading, setBiometricLoading] = useState(false);
    const [twoFactorLoading, setTwoFactorLoading] = useState(false);

    // Check biometric availability
    useEffect(() => {
      const checkBiometricSupport = async () => {
        setIsCheckingBiometric(true);

        try {
          // Check if we're on a native platform with biometric support
          if (typeof window !== "undefined" && (window as any).Capacitor) {
            const { Capacitor } = window as any;

            if (Capacitor.isNativePlatform()) {
              // Try to import BiometricAuth plugin
              try {
                const { BiometricAuth, BiometricAuthenticationType } = (
                  window as any
                ).Capacitor.Plugins;

                if (BiometricAuth) {
                  const result = await BiometricAuth.isAvailable();

                  if (result.isAvailable) {
                    let type: BiometricSupport["type"] = "fingerprint";
                    let deviceName = "Device";

                    // Determine biometric type based on platform
                    if (Capacitor.getPlatform() === "ios") {
                      // Check for Face ID vs Touch ID
                      if (
                        result.biometryType ===
                        BiometricAuthenticationType.FACE_ID
                      ) {
                        type = "faceId";
                        deviceName = "Face ID";
                      } else {
                        type = "touchId";
                        deviceName = "Touch ID";
                      }
                    } else {
                      type = "fingerprint";
                      deviceName = "Fingerprint";
                    }

                    setBiometricSupport({
                      isAvailable: true,
                      type,
                      deviceName,
                    });
                  } else {
                    setBiometricSupport({
                      isAvailable: false,
                      type: "none",
                      deviceName: "Device",
                    });
                  }
                }
              } catch (pluginError) {
                console.warn(
                  "BiometricAuth plugin not available:",
                  pluginError,
                );
                setBiometricSupport({
                  isAvailable: false,
                  type: "none",
                  deviceName: "Device",
                });
              }
            } else {
              // Web platform - check for WebAuthn support
              if (window.PublicKeyCredential && window.navigator.credentials) {
                setBiometricSupport({
                  isAvailable: true,
                  type: "fingerprint",
                  deviceName: "WebAuthn",
                });
              }
            }
          }
        } catch (error) {
          console.warn("Error checking biometric support:", error);
          setBiometricSupport({
            isAvailable: false,
            type: "none",
            deviceName: "Device",
          });
        } finally {
          setIsCheckingBiometric(false);
        }
      };

      checkBiometricSupport();
    }, []);

    const getBiometricIcon = () => {
      switch (biometricSupport.type) {
        case "faceId":
          return (
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 5.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5S11 8.33 11 7.5zm-4 0c0-.83.67-1.5 1.5-1.5S10 6.67 10 7.5 9.33 9 8.5 9 7 8.33 7 7.5zM12 20c-2.03 0-3.83-.82-5.13-2.15.05-1.19.9-2.26 2.21-2.7.5-.17.98-.15 1.42.05.36.17.8.25 1.25.25s.89-.08 1.25-.25c.44-.2.92-.22 1.42-.05 1.31.44 2.16 1.51 2.21 2.7C15.83 19.18 14.03 20 12 20z" />
            </svg>
          );
        case "touchId":
          return (
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.27.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.29-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.65-3.4 2.94-.08.14-.23.21-.39.21z" />
            </svg>
          );
        default:
          return (
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
          );
      }
    };

    const handleBiometricToggle = async (enabled: boolean) => {
      setBiometricLoading(true);

      try {
        if (enabled) {
          // Test biometric authentication before enabling
          if (typeof window !== "undefined" && (window as any).Capacitor) {
            const { BiometricAuth } = (window as any).Capacitor.Plugins;

            if (BiometricAuth) {
              const result = await BiometricAuth.authenticate({
                reason: "Enable biometric authentication for LogYourBody",
                title: "Enable Biometric Auth",
                subtitle: "Use your biometric to secure your account",
                description:
                  "This will enable biometric authentication for future logins",
              });

              if (result.isAuthenticated) {
                onBiometricToggle(enabled);

                // Analytics
                if (typeof window !== "undefined" && (window as any).gtag) {
                  (window as any).gtag("event", "security_setting_changed", {
                    event_category: "Security",
                    event_label: "Biometric Authentication",
                    custom_parameters: {
                      enabled: enabled,
                      biometric_type: biometricSupport.type,
                    },
                  });
                }
              }
            }
          } else {
            // Web fallback - just toggle
            onBiometricToggle(enabled);
          }
        } else {
          onBiometricToggle(enabled);
        }
      } catch (error) {
        console.warn("Biometric authentication failed:", error);
        // Don't change the toggle state if authentication failed
      } finally {
        setBiometricLoading(false);
      }
    };

    const handleTwoFactorToggle = async (enabled: boolean) => {
      setTwoFactorLoading(true);

      try {
        onTwoFactorToggle(enabled);

        // Analytics
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "security_setting_changed", {
            event_category: "Security",
            event_label: "Two Factor Authentication",
            custom_parameters: {
              enabled: enabled,
            },
          });
        }
      } catch (error) {
        console.warn("Two-factor toggle failed:", error);
      } finally {
        setTwoFactorLoading(false);
      }
    };

    return (
      <SettingGroup title="Security & Privacy" className={className}>
        {/* Biometric Authentication */}
        {biometricSupport.isAvailable && (
          <SettingItem
            title={`${biometricSupport.deviceName} Authentication`}
            subtitle={
              biometricEnabled ? "Enabled for quick access" : "Disabled"
            }
            icon={
              <div
                className={cn(
                  "text-blue-400",
                  !biometricEnabled && "text-muted-foreground",
                )}
              >
                {getBiometricIcon()}
              </div>
            }
            accessory={
              <Switch
                enabled={biometricEnabled}
                onChange={handleBiometricToggle}
                disabled={isCheckingBiometric}
                loading={biometricLoading}
                accessibilityLabel={`Toggle ${biometricSupport.deviceName} authentication`}
              />
            }
            disabled={isCheckingBiometric || biometricLoading}
          />
        )}

        {/* Two-Factor Authentication */}
        <SettingItem
          title="Two-Factor Authentication"
          subtitle={
            twoFactorEnabled
              ? "Extra security enabled"
              : "Add an extra layer of security"
          }
          icon={
            <div
              className={cn(
                "text-green-400",
                !twoFactorEnabled && "text-muted-foreground",
              )}
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
            </div>
          }
          accessory={
            <Switch
              enabled={twoFactorEnabled}
              onChange={handleTwoFactorToggle}
              loading={twoFactorLoading}
              accessibilityLabel="Toggle two-factor authentication"
            />
          }
          disabled={twoFactorLoading}
        />

        {/* Change Password */}
        <SettingItem
          title="Change Password"
          subtitle="Update your account password"
          onClick={onChangePassword}
          accessoryType="disclosure"
          icon={
            <div className="text-orange-400">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 16H6V10h12v12zm-6-9c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
              </svg>
            </div>
          }
        />

        {/* Active Sessions */}
        <SettingItem
          title="Active Sessions"
          subtitle="Manage devices signed into your account"
          onClick={onViewSessions}
          accessoryType="disclosure"
          icon={
            <div className="text-purple-400">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
              </svg>
            </div>
          }
        />

        {/* Security info */}
        <div className={cn(tw.helperText, "px-4 pb-2")}>
          <div className="space-y-1">
            <p className="font-medium text-foreground">Security Features:</p>
            <div className="space-y-0.5 text-xs">
              <div className="flex items-center gap-2">
                <svg
                  className="h-3 w-3 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                End-to-end encrypted data storage
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-3 w-3 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Secure authentication with JWT tokens
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-3 w-3 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Regular security audits and updates
              </div>
            </div>
          </div>
        </div>
      </SettingGroup>
    );
  },
);
