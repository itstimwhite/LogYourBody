#!/usr/bin/env node

// Test SMS authentication on remote Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://przjeunffnkjzxpykvjn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByempldW5mZm5ranp4cHlrdmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTI1NDYsImV4cCI6MjA2NDk4ODU0Nn0.jZyohfzoydZKaSH_q0Tu4VqEbyFDdf-8i0kSm-YzB8w";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSMSAuth() {
  console.log('Testing SMS Authentication on Remote Supabase...\n');
  
  // Test phone numbers for different scenarios
  const testCases = [
    { phone: '+15551234567', description: 'US number format' },
    { phone: '+1234567890', description: 'Invalid but properly formatted' }
  ];
  
  for (const testCase of testCases) {
    console.log(`\nTesting: ${testCase.description}`);
    console.log(`Phone: ${testCase.phone}`);
    
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: testCase.phone,
        options: {
          channel: 'sms',
        },
      });
      
      if (error) {
        console.log(`❌ Error: ${error.message}`);
        
        // Check for specific error types
        if (error.message.includes('Database error')) {
          console.log('   -> This indicates a database/auth configuration issue');
        } else if (error.message.includes('SMS provider')) {
          console.log('   -> SMS provider may not be configured');
        } else if (error.message.includes('rate limit')) {
          console.log('   -> Rate limiting is active (good sign - SMS is working)');
        } else if (error.message.includes('Invalid phone number')) {
          console.log('   -> Phone validation is working');
        }
      } else {
        console.log('✅ Success! OTP request sent');
        if (data) {
          console.log('   Response:', JSON.stringify(data, null, 2));
        }
      }
    } catch (err) {
      console.log(`❌ Exception: ${err.message}`);
    }
  }
  
  console.log('\n\nDiagnostic Summary:');
  console.log('==================');
  console.log('If you see "Database error saving new user":');
  console.log('- The auth system cannot create users');
  console.log('- Run the fix_supabase_auth.sql script in SQL Editor');
  console.log('\nIf you see rate limiting errors:');
  console.log('- SMS is properly configured and working!');
  console.log('- Just being protected from too many requests');
  console.log('\nIf you see "Invalid phone number":');
  console.log('- SMS provider is configured');
  console.log('- Phone validation is active');
}

testSMSAuth().catch(console.error);