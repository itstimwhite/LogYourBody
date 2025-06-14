import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AuthDebugSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [detailedError, setDetailedError] = useState<any>(null);

  const debugSignup = async () => {
    setLoading(true);
    setResult(null);
    setDetailedError(null);

    const testEmail = email || `debug-${Date.now()}@test.com`;
    const testPassword = password || 'DebugPass123!';

    console.log('=== AUTH DEBUG START ===');
    console.log('Attempting signup with:', { email: testEmail });
    
    try {
      // First, check if Supabase client exists
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      
      // Attempt signup
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          // Disable email confirmation for testing
          emailRedirectTo: window.location.origin,
          data: {
            test_signup: true,
            timestamp: new Date().toISOString()
          }
        }
      });

      console.log('Signup response:', { data, error });

      if (error) {
        // Capture detailed error information
        setDetailedError({
          message: error.message,
          status: error.status,
          code: error.code,
          details: error,
          hint: getErrorHint(error)
        });
        
        // Try to get more info from Supabase
        if (error.message.includes('Database error')) {
          console.log('Database error detected, checking auth settings...');
          
          // Check if we can at least query the database
          const { error: dbError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);
            
          if (dbError) {
            console.error('Database connection test failed:', dbError);
          } else {
            console.log('Database connection is working');
          }
        }
      }

      setResult({ data, error });

    } catch (err: any) {
      console.error('Caught error:', err);
      setDetailedError({
        message: err.message,
        type: 'exception',
        stack: err.stack,
        hint: 'Check browser console for more details'
      });
      setResult({ error: err });
    } finally {
      console.log('=== AUTH DEBUG END ===');
      setLoading(false);
    }
  };

  const getErrorHint = (error: any): string => {
    if (error.message.includes('Database error creating new user')) {
      return 'This error comes from Supabase auth system. Check: 1) Email auth is enabled, 2) No rate limits, 3) Project is active';
    }
    if (error.message.includes('Email rate limit exceeded')) {
      return 'Too many signup attempts. Wait a few minutes or try a different email.';
    }
    if (error.message.includes('Invalid email')) {
      return 'Email format is invalid. Use a real email format.';
    }
    if (error.message.includes('User already registered')) {
      return 'This email is already in use. Try a different email.';
    }
    return 'Unknown error - check Supabase Dashboard logs';
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Auth Debug - Detailed Signup Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              This will show detailed error information to help diagnose auth issues.
              Check the browser console for additional logs.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Input
              type="email"
              placeholder="test@example.com (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password (optional)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button 
              onClick={debugSignup} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Debug Signup'}
            </Button>
          </div>

          {detailedError && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>Error:</strong> {detailedError.message}
                </AlertDescription>
              </Alert>
              
              {detailedError.hint && (
                <Alert>
                  <AlertDescription>
                    <strong>Hint:</strong> {detailedError.hint}
                  </AlertDescription>
                </Alert>
              )}

              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-semibold mb-2">Full Error Details:</h4>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(detailedError, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {result && !detailedError && (
            <Alert variant="default" className="border-green-200">
              <AlertDescription>
                Success! User created. Check the result below.
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-semibold mb-2">Full Response:</h4>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}