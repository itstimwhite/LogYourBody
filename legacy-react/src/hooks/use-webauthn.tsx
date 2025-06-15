import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface WebAuthnCredential {
  id: string;
  publicKey: string;
  counter: number;
  deviceType: string;
  createdAt: string;
}

interface WebAuthnState {
  isSupported: boolean;
  isAvailable: boolean;
  isRegistered: boolean;
  credentials: WebAuthnCredential[];
  loading: boolean;
  error: string | null;
}

interface WebAuthnActions {
  registerBiometric: () => Promise<boolean>;
  authenticateWithBiometric: () => Promise<boolean>;
  removeBiometric: (credentialId: string) => Promise<boolean>;
  checkBiometricAvailability: () => Promise<boolean>;
}

export function useWebAuthn(): WebAuthnState & WebAuthnActions {
  const { user } = useAuth();
  const [state, setState] = useState<WebAuthnState>({
    isSupported: false,
    isAvailable: false,
    isRegistered: false,
    credentials: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    checkWebAuthnSupport();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserCredentials();
    }
  }, [user]);

  const checkWebAuthnSupport = async () => {
    const isSupported = window.PublicKeyCredential !== undefined;

    if (!isSupported) {
      setState((prev) => ({
        ...prev,
        isSupported: false,
        isAvailable: false,
        loading: false,
      }));
      return;
    }

    try {
      const isAvailable =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setState((prev) => ({
        ...prev,
        isSupported: true,
        isAvailable,
        loading: false,
      }));
    } catch (error) {
      console.error("Error checking WebAuthn availability:", error);
      setState((prev) => ({
        ...prev,
        isSupported: true,
        isAvailable: false,
        loading: false,
        error: "Failed to check biometric availability",
      }));
    }
  };

  const loadUserCredentials = async () => {
    if (!user) return;

    try {
      // Load credentials from localStorage for now
      // In production, this should come from your backend
      const storedCredentials = localStorage.getItem(
        `webauthn_credentials_${user.id}`,
      );
      const credentials = storedCredentials
        ? JSON.parse(storedCredentials)
        : [];

      setState((prev) => ({
        ...prev,
        credentials,
        isRegistered: credentials.length > 0,
      }));
    } catch (error) {
      console.error("Error loading credentials:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to load biometric credentials",
      }));
    }
  };

  const generateChallenge = (): Uint8Array => {
    return crypto.getRandomValues(new Uint8Array(32));
  };

  const bufferToBase64url = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let str = "";
    for (const byte of bytes) {
      str += String.fromCharCode(byte);
    }
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  };

  const base64urlToBuffer = (base64url: string): ArrayBuffer => {
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const registerBiometric = async (): Promise<boolean> => {
    if (!state.isSupported || !state.isAvailable || !user) {
      setState((prev) => ({
        ...prev,
        error: "Biometric authentication not available",
      }));
      return false;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const challenge = generateChallenge();
      const userId = new TextEncoder().encode(user.id);

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions =
        {
          challenge,
          rp: {
            name: "LogYourBody",
            id: window.location.hostname,
          },
          user: {
            id: userId,
            name: user.email || "",
            displayName: user.user_metadata?.name || user.email || "User",
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" }, // ES256
            { alg: -257, type: "public-key" }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            requireResidentKey: false,
          },
          timeout: 60000,
          attestation: "direct",
        };

      const credential = (await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      })) as PublicKeyCredential;

      if (!credential) {
        throw new Error("Failed to create credential");
      }

      const response = credential.response as AuthenticatorAttestationResponse;
      const newCredential: WebAuthnCredential = {
        id: credential.id,
        publicKey: bufferToBase64url(response.getPublicKey()!),
        counter: 0,
        deviceType: getDeviceType(),
        createdAt: new Date().toISOString(),
      };

      // Store credential (in production, send to backend)
      const updatedCredentials = [...state.credentials, newCredential];
      localStorage.setItem(
        `webauthn_credentials_${user.id}`,
        JSON.stringify(updatedCredentials),
      );

      setState((prev) => ({
        ...prev,
        credentials: updatedCredentials,
        isRegistered: true,
        loading: false,
      }));

      return true;
    } catch (error: any) {
      console.error("Biometric registration failed:", error);
      let errorMessage = "Failed to register biometric authentication";

      if (error.name === "NotAllowedError") {
        errorMessage = "Biometric registration was cancelled or denied";
      } else if (error.name === "NotSupportedError") {
        errorMessage =
          "Biometric authentication is not supported on this device";
      }

      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      return false;
    }
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    if (
      !state.isSupported ||
      !state.isAvailable ||
      !state.isRegistered ||
      !user
    ) {
      setState((prev) => ({
        ...prev,
        error: "Biometric authentication not available",
      }));
      return false;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const challenge = generateChallenge();
      const allowCredentials = state.credentials.map((cred) => ({
        id: base64urlToBuffer(cred.id),
        type: "public-key" as const,
      }));

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
        {
          challenge,
          allowCredentials,
          timeout: 60000,
          userVerification: "required",
        };

      const assertion = (await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      })) as PublicKeyCredential;

      if (!assertion) {
        throw new Error("Failed to get assertion");
      }

      // Verify the credential ID matches one of the stored credentials
      const assertionId = bufferToBase64url(assertion.rawId);
      const matchingCredential = state.credentials.find(
        (cred) => cred.id === assertion.id || cred.id === assertionId,
      );

      if (!matchingCredential) {
        throw new Error("Credential not found");
      }

      // In production, verify the assertion signature on your backend
      console.log("Biometric authentication successful:", assertion);

      setState((prev) => ({ ...prev, loading: false }));
      return true;
    } catch (error: any) {
      console.error("Biometric authentication failed:", error);
      let errorMessage = "Biometric authentication failed";

      if (error.name === "NotAllowedError") {
        errorMessage = "Biometric authentication was cancelled or denied";
      } else if (error.name === "InvalidStateError") {
        errorMessage = "No registered biometric credentials found";
      } else if (error.message === "Credential not found") {
        errorMessage = "Invalid biometric credential";
      }

      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      return false;
    }
  };

  const removeBiometric = async (credentialId: string): Promise<boolean> => {
    try {
      const updatedCredentials = state.credentials.filter(
        (cred) => cred.id !== credentialId,
      );

      if (user) {
        localStorage.setItem(
          `webauthn_credentials_${user.id}`,
          JSON.stringify(updatedCredentials),
        );
      }

      setState((prev) => ({
        ...prev,
        credentials: updatedCredentials,
        isRegistered: updatedCredentials.length > 0,
      }));

      return true;
    } catch (error) {
      console.error("Failed to remove biometric credential:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to remove biometric credential",
      }));
      return false;
    }
  };

  const checkBiometricAvailability = async (): Promise<boolean> => {
    if (!state.isSupported) return false;

    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  };

  const getDeviceType = (): string => {
    const userAgent = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(userAgent)) return "iOS";
    if (/Android/.test(userAgent)) return "Android";
    if (/Mac/.test(userAgent)) return "macOS";
    if (/Windows/.test(userAgent)) return "Windows";
    return "Unknown";
  };

  return {
    ...state,
    registerBiometric,
    authenticateWithBiometric,
    removeBiometric,
    checkBiometricAvailability,
  };
}
