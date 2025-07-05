import { SignIn } from '@clerk/nextjs'
import { BarChart3 } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-bg p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <BarChart3 className="h-12 w-12 text-linear-purple" />
          </div>
          <h1 className="text-3xl font-bold text-linear-text mb-2">Welcome back</h1>
          <p className="text-linear-text-secondary">
            Sign in to continue your fitness journey
          </p>
        </div>

        <SignIn 
          appearance={{
            baseTheme: undefined,
            variables: {
              colorPrimary: '#8b5cf6', // linear-purple
              colorText: '#e1e1e3', // linear-text
              colorTextSecondary: '#a1a1a8', // linear-text-secondary
              colorBackground: '#18181b', // linear-card
              colorInputBackground: '#18181b',
              colorInputText: '#e1e1e3',
              borderRadius: '0.5rem',
            },
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-linear-card border-linear-border shadow-xl',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 'border-linear-border hover:bg-linear-hover',
              formButtonPrimary: 'bg-linear-purple hover:bg-linear-purple/90',
              footerActionLink: 'text-linear-purple hover:text-linear-purple/80',
              identityPreviewEditButton: 'text-linear-purple hover:text-linear-purple/80',
              formFieldLabel: 'text-linear-text-secondary',
              formFieldInput: 'bg-linear-bg border-linear-border text-linear-text',
              dividerLine: 'bg-linear-border',
              dividerText: 'text-linear-text-tertiary',
            }
          }}
          routing="path"
          path="/login"
          signUpUrl="/signup"
          afterSignInUrl="/dashboard"
        />
      </div>
    </div>
  )
}