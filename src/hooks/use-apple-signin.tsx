import { useState } from 'react';
import { SignInWithApple } from '@capacitor-community/apple-sign-in';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isNativeiOS } from '@/lib/platform';

export interface AppleSignInResult {
  success: boolean;
  error?: string;
}

export function useAppleSignIn() {
  const [loading, setLoading] = useState(false);

  const checkAppleSignInAvailability = async (): Promise<boolean> => {
    if (!isNativeiOS()) {
      return false;
    }

    try {
      // Check if Apple Sign In is available
      const isAvailable = await SignInWithApple.isAvailable();
      console.log('Apple Sign In availability:', isAvailable);
      return isAvailable.isAvailable;
    } catch (error) {
      console.warn('Could not check Apple Sign In availability:', error);
      return false;
    }
  };

  const signInWithApple = async (): Promise<AppleSignInResult> => {
    if (!isNativeiOS()) {
      return {
        success: false,
        error: 'Apple Sign In is only available on iOS devices'
      };
    }

    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: 'Authentication service not available'
      };
    }

    setLoading(true);

    try {
      console.log('Starting native Apple Sign In...');
      
      // Check availability first
      const isAvailable = await checkAppleSignInAvailability();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Apple Sign In is not available. Please ensure "Sign In with Apple" capability is enabled in Xcode.'
        };
      }
      
      // Request Apple Sign In
      const response = await SignInWithApple.authorize({
        requestedScopes: ['email', 'fullName']
      });

      console.log('Apple Sign In response:', response);

      if (!response.response.identityToken) {
        throw new Error('No identity token received from Apple');
      }

      // Sign in to Supabase with the Apple ID token
      console.log('Signing in to Supabase with Apple ID token...');
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: response.response.identityToken,
        nonce: response.response.nonce,
        options: {
          skipBrowserRedirect: true
        }
      });

      if (error) {
        console.error('Supabase Apple Sign In error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      console.log('Apple Sign In successful:', data);
      return {
        success: true
      };

    } catch (error: any) {
      console.error('Native Apple Sign In failed:', error);
      
      // Handle specific error cases
      if (error.message?.includes('canceled') || error.code === 1001) {
        return {
          success: false,
          error: 'Sign in was canceled'
        };
      }
      
      // Error 1000 - Configuration issue
      if (error.code === 1000) {
        return {
          success: false,
          error: 'Apple Sign In not configured. Please enable "Sign In with Apple" capability in Xcode and ensure your Apple Developer account has this feature enabled.'
        };
      }
      
      // Error 1004 - Not supported
      if (error.code === 1004) {
        return {
          success: false,
          error: 'Apple Sign In is not supported on this device or iOS version'
        };
      }
      
      return {
        success: false,
        error: error.message || `Apple Sign In failed (Error ${error.code || 'Unknown'})`
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithApple,
    checkAppleSignInAvailability,
    loading
  };
}