import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AuthTestScenarios() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, success: boolean, details: any) => {
    setResults(prev => [...prev, { test, success, details, timestamp: new Date() }]);
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults([]);

    // Test 1: Basic signup
    try {
      const email1 = `test1_${Date.now()}@example.com`;
      const { data, error } = await supabase.auth.signUp({
        email: email1,
        password: 'TestPassword123!',
      });
      addResult('Basic Signup', !error, { email: email1, error: error?.message, data });
    } catch (err: any) {
      addResult('Basic Signup', false, { error: err.message });
    }

    // Test 2: Signup with metadata
    try {
      const email2 = `test2_${Date.now()}@example.com`;
      const { data, error } = await supabase.auth.signUp({
        email: email2,
        password: 'TestPassword123!',
        options: {
          data: {
            name: 'Test User',
            test: true
          }
        }
      });
      addResult('Signup with Metadata', !error, { email: email2, error: error?.message, data });
    } catch (err: any) {
      addResult('Signup with Metadata', false, { error: err.message });
    }

    // Test 3: Check if we can query the database
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      addResult('Database Connection', !error, { count, error: error?.message });
    } catch (err: any) {
      addResult('Database Connection', false, { error: err.message });
    }

    // Test 4: Try to call our bypass function
    try {
      const { data, error } = await supabase
        .rpc('create_mock_user', {
          p_email: `mock_${Date.now()}@example.com`,
          p_name: 'Mock User'
        });
      addResult('Mock User Creation (Bypass)', !error, { data, error: error?.message });
    } catch (err: any) {
      addResult('Mock User Creation (Bypass)', false, { error: err.message });
    }

    // Test 5: Check auth.getSession
    try {
      const { data, error } = await supabase.auth.getSession();
      addResult('Get Session', !error, { hasSession: !!data.session, error: error?.message });
    } catch (err: any) {
      addResult('Get Session', false, { error: err.message });
    }

    // Test 6: Try magic link
    try {
      const email6 = `test6_${Date.now()}@example.com`;
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email6,
        options: {
          shouldCreateUser: true
        }
      });
      addResult('Magic Link Signup', !error, { email: email6, error: error?.message, data });
    } catch (err: any) {
      addResult('Magic Link Signup', false, { error: err.message });
    }

    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Auth Test Scenarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runAllTests} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Running Tests...' : 'Run All Test Scenarios'}
          </Button>

          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Test Results:</h3>
              {results.map((result, index) => (
                <Alert 
                  key={index}
                  variant={result.success ? "default" : "destructive"}
                  className={result.success ? "border-green-200" : ""}
                >
                  <AlertDescription>
                    <div className="font-semibold">{result.test}</div>
                    <div className="text-sm mt-1">
                      Status: {result.success ? '✅ Success' : '❌ Failed'}
                    </div>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm">View Details</summary>
                      <pre className="text-xs mt-2 overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          <Alert>
            <AlertDescription>
              <strong>What these tests check:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Basic signup with email/password</li>
                <li>Signup with user metadata</li>
                <li>Database connection</li>
                <li>Bypass auth with mock user creation</li>
                <li>Session management</li>
                <li>Magic link signup (alternative method)</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}