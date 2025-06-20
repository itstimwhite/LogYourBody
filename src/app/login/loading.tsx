import { Loader2 } from 'lucide-react'

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-bg">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-linear-purple mx-auto mb-4" />
        <p className="text-linear-text-secondary">Loading login page...</p>
      </div>
    </div>
  )
}