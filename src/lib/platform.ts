import { Capacitor } from "@capacitor/core";

/**
 * Platform detection utilities for Capacitor apps
 */

// Check if running in native iOS app
export const isNativeiOS = (): boolean => {
  return Capacitor.getPlatform() === "ios";
};

// Check if running in native Android app
export const isNativeAndroid = (): boolean => {
  return Capacitor.getPlatform() === "android";
};

// Check if running in any native app
export const isNativeApp = (): boolean => {
  return Capacitor.isNativePlatform();
};

// Check if running in web browser
export const isWebApp = (): boolean => {
  return Capacitor.getPlatform() === "web";
};

// Check if running in development mode
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === "development";
};

// Check if PWA features are supported and should be shown
export const shouldShowPWAFeatures = (): boolean => {
  // Don't show PWA features in native apps
  if (isNativeApp()) {
    return false;
  }

  // Show PWA features in web browsers
  return isWebApp();
};

// Check if email authentication should be available
export const shouldShowEmailAuth = (): boolean => {
  // Hide email auth in native iOS app (prefer Apple Sign In)
  if (isNativeiOS()) {
    return false;
  }

  // Only show email auth on web (no Android support)
  return isWebApp();
};

// Check if Google Sign In should be available
export const shouldShowGoogleSignIn = (): boolean => {
  // Only show Google Sign In on web
  return isWebApp();
};

// Get platform-specific app info
export const getPlatformInfo = () => {
  return {
    platform: Capacitor.getPlatform(),
    isNative: Capacitor.isNativePlatform(),
    isWeb: isWebApp(),
    isiOS: isNativeiOS(),
    isAndroid: isNativeAndroid(),
    shouldShowPWA: shouldShowPWAFeatures(),
    shouldShowEmailAuth: shouldShowEmailAuth(),
    shouldShowGoogleSignIn: shouldShowGoogleSignIn(),
  };
};

// Log platform information for debugging
export const logPlatformInfo = (): void => {
  const info = getPlatformInfo();
  console.group("📱 Platform Information");
  console.log("Platform:", info.platform);
  console.log("Is Native:", info.isNative);
  console.log("Is iOS:", info.isiOS);
  console.log("Is Android:", info.isAndroid);
  console.log("Is Web:", info.isWeb);
  console.log("Show PWA Features:", info.shouldShowPWA);
  console.log("Show Email Auth:", info.shouldShowEmailAuth);
  console.log("Show Google Sign In:", info.shouldShowGoogleSignIn);
  console.groupEnd();
};
