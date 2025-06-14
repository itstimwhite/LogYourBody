import { TestAuth } from '@/components/TestAuth';
import { AuthDebugSignup } from '@/components/AuthDebugSignup';

export default function TestAuthPage() {
  return (
    <div className="space-y-8 py-8">
      <AuthDebugSignup />
      <TestAuth />
    </div>
  );
}