// Quick environment check script for debugging production issues
console.log('=== Environment Variables Check ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'SET ✓' : 'MISSING ✗');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'SET ✓' : 'MISSING ✗');
console.log('=================================');

// Test Supabase connection
if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
  console.log('✓ All required environment variables are set');
} else {
  console.log('✗ Missing required environment variables');
  console.log('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}