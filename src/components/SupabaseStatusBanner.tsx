'use client'

import { useEffect, useState } from 'react'
import { 
  getSupabaseEnvironment, 
  validateSupabaseKeys,
  testSupabaseConnection 
} from '@/lib/supabase/client'
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConnectionStatus {
  success: boolean
  error?: string
  details?: string
  message?: string
}

export function SupabaseStatusBanner() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  const supabaseEnv = getSupabaseEnvironment()
  const keyValidation = validateSupabaseKeys()

  const testConnection = async () => {
    setIsLoading(true)
    try {
      const result = await testSupabaseConnection()
      setConnectionStatus(result)
    } catch (error) {
      setConnectionStatus({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Connection test failed'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production':
        return 'bg-red-500'
      case 'preview':
        return 'bg-yellow-500'
      case 'development':
      case 'local':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusStyles = () => {
    if (isLoading) return 'bg-gray-100 border-gray-300 text-gray-700'
    if (!connectionStatus) return 'bg-gray-100 border-gray-300 text-gray-700'
    if (connectionStatus.success) return 'bg-green-50 border-green-300 text-green-800'
    return 'bg-red-50 border-red-300 text-red-800'
  }

  const getSupabaseProjectId = () => {
    const url = keyValidation.url.value
    if (!url) return 'Not configured'
    const match = url.match(/https:\/\/([^.]+)\.supabase\.co/)
    return match ? match[1] : 'Unknown'
  }

  return (
    <div className={`w-full border-b-2 ${getStatusStyles()} p-4 transition-all duration-300`}>
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Status Section */}
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              {isLoading ? (
                <RefreshCw className="h-8 w-8 animate-spin text-gray-600" />
              ) : connectionStatus?.success ? (
                <div className="relative">
                  <Wifi className="h-8 w-8 text-green-600" />
                  <CheckCircle className="h-4 w-4 text-green-600 absolute -bottom-1 -right-1 bg-white rounded-full" />
                </div>
              ) : (
                <div className="relative">
                  <WifiOff className="h-8 w-8 text-red-600" />
                  <XCircle className="h-4 w-4 text-red-600 absolute -bottom-1 -right-1 bg-white rounded-full" />
                </div>
              )}
            </div>

            {/* Main Status Text */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">
                  Supabase Database Status
                </h2>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getEnvironmentColor(supabaseEnv)}`}>
                  {supabaseEnv.toUpperCase()} BRANCH
                </span>
              </div>
              <p className="text-sm opacity-80">
                {isLoading ? 'Testing connection...' : 
                 connectionStatus?.success ? '✅ Connected and operational' : 
                 '❌ Connection failed'}
              </p>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Project Info */}
            <div className="text-center sm:text-right">
              <p className="text-xs opacity-60">Project ID</p>
              <p className="text-sm font-mono font-semibold">{getSupabaseProjectId()}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs"
              >
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={testConnection}
                disabled={isLoading}
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-current/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              {/* Environment Info */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-1">
                  <Database className="h-4 w-4" />
                  Environment Details
                </h3>
                <div className="space-y-1 text-xs">
                  <div>Supabase Environment: <strong>{supabaseEnv}</strong></div>
                  <div>Vercel Environment: <strong>{process.env.VERCEL_ENV || 'local'}</strong></div>
                  <div>Node Environment: <strong>{process.env.NODE_ENV}</strong></div>
                </div>
              </div>

              {/* Connection Info */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-1">
                  {connectionStatus?.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  Connection Details
                </h3>
                <div className="space-y-1 text-xs">
                  <div>URL Status: {keyValidation.url.exists ? '✅ Configured' : '❌ Missing'}</div>
                  <div>API Key: {keyValidation.anonKey.exists ? '✅ Configured' : '❌ Missing'}</div>
                  {connectionStatus?.error && (
                    <div className="text-red-600">Error: {connectionStatus.error}</div>
                  )}
                </div>
              </div>

              {/* Technical Details */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  Technical Info
                </h3>
                <div className="space-y-1 text-xs font-mono">
                  <div className="truncate">URL: {keyValidation.url.value || 'Not set'}</div>
                  <div className="truncate">Key: {keyValidation.anonKey.value ? `${keyValidation.anonKey.value.substring(0, 20)}...` : 'Not set'}</div>
                </div>
              </div>
            </div>

            {/* Warning for non-dev environments */}
            {supabaseEnv === 'production' && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-800 text-sm">
                <strong>⚠️ Warning:</strong> You are connected to the PRODUCTION database. Be careful with any data modifications.
              </div>
            )}

            {/* Info message */}
            <div className="mt-4 text-xs opacity-60 text-center">
              This status banner is for development purposes and will be removed in production.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}