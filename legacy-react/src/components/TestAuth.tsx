import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function TestAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testEmailSignup = async () => {
    setLoading(true);
    try {
      const testEmail = email || `test-${Date.now()}@example.com`;
      const testPassword = password || 'TestPassword123!';
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });
      
      setResult({ type: 'email', data, error });
      
      if (error) {
        toast.error(`Email signup failed: ${error.message}`);
      } else {
        toast.success('Email signup successful!');
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
      setResult({ type: 'email', error: err });
    } finally {
      setLoading(false);
    }
  };

  const testPhoneSignup = async () => {
    setLoading(true);
    try {
      const testPhone = phone || '+15551234567';
      
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: testPhone,
        options: {
          channel: 'sms',
        },
      });
      
      setResult({ type: 'phone', data, error });
      
      if (error) {
        toast.error(`SMS signup failed: ${error.message}`);
      } else {
        toast.success('SMS OTP sent!');
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
      setResult({ type: 'phone', error: err });
    } finally {
      setLoading(false);
    }
  };

  const testDirectPhoneUser = async () => {
    setLoading(true);
    try {
      const testPhone = phone || '+15551234567';
      
      // Call the custom function we created
      const { data, error } = await supabase
        .rpc('create_phone_user', {
          phone_number: testPhone,
        });
      
      setResult({ type: 'direct_phone', data, error });
      
      if (error) {
        toast.error(`Direct phone creation failed: ${error.message}`);
      } else if (data?.success) {
        toast.success('Phone user created directly!');
      } else {
        toast.error(data?.error || 'Unknown error');
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
      setResult({ type: 'direct_phone', error: err });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Auth System Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Test */}
          <div className="space-y-2">
            <h3 className="font-semibold">Test Email Signup</h3>
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
              onClick={testEmailSignup} 
              disabled={loading}
              className="w-full"
            >
              Test Email Signup
            </Button>
          </div>

          {/* Phone Test */}
          <div className="space-y-2">
            <h3 className="font-semibold">Test SMS Auth</h3>
            <Input
              type="tel"
              placeholder="+15551234567 (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Button 
              onClick={testPhoneSignup} 
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              Test SMS OTP
            </Button>
            <Button 
              onClick={testDirectPhoneUser} 
              disabled={loading}
              className="w-full"
              variant="secondary"
            >
              Test Direct Phone Creation (Workaround)
            </Button>
          </div>

          {/* Results */}
          {result && (
            <div className="mt-4 rounded-lg bg-muted p-4">
              <h4 className="font-semibold mb-2">Result ({result.type}):</h4>
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}