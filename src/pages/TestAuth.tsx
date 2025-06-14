import { TestAuth } from '@/components/TestAuth';
import { AuthDebugSignup } from '@/components/AuthDebugSignup';
import { AuthTestScenarios } from '@/components/AuthTestScenarios';

export default function TestAuthPage() {
  return (
    <div className="space-y-8 py-8">
      <AuthTestScenarios />
      <AuthDebugSignup />
      <TestAuth />
    </div>
  );
}