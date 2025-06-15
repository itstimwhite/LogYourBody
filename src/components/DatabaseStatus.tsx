'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  getSupabaseEnvironment, 
  getVercelEnvironment, 
  validateSupabaseKeys,
  testSupabaseConnection 
} from '@/lib/supabase/client'
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'

interface ConnectionStatus {
  success: boolean
  error?: string
  details?: string
  message?: string
}

export function DatabaseStatus() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showKeys, setShowKeys] = useState(false)

  const supabaseEnv = getSupabaseEnvironment()
  const vercelEnv = getVercelEnvironment()
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

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-500' : 'text-red-500'
  }

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />
  }

  const getEnvironmentBadgeVariant = (env: string) => {
    switch (env) {
      case 'production':
        return 'destructive'
      case 'preview':
      case 'staging':
        return 'secondary'
      case 'development':
      case 'local':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  return (
    <Card className="border-linear-border bg-linear-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-linear-text">
          <Database className="h-5 w-5 text-linear-purple" />
          Database Status
          <Button
            variant="ghost"
            size="sm"
            onClick={testConnection}
            disabled={isLoading}
            className="ml-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Environment Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-linear-text-tertiary mb-1">Supabase Environment</div>
            <Badge variant={getEnvironmentBadgeVariant(supabaseEnv)} className="text-xs">
              {supabaseEnv.toUpperCase()}
            </Badge>
          </div>
          <div>
            <div className="text-xs text-linear-text-tertiary mb-1">Vercel Environment</div>
            <Badge variant={getEnvironmentBadgeVariant(vercelEnv)} className="text-xs">
              {vercelEnv.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Connection Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-linear-text-secondary">Connection Status</span>
            {connectionStatus && (
              <div className={`flex items-center gap-1 ${getStatusColor(connectionStatus.success)}`}>
                {getStatusIcon(connectionStatus.success)}
                <span className="text-xs">
                  {connectionStatus.success ? 'Connected' : 'Failed'}
                </span>
              </div>
            )}
          </div>
          
          {connectionStatus && !connectionStatus.success && (
            <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
              <div className="font-medium">Error: {connectionStatus.error}</div>
              {connectionStatus.details && (
                <div className="text-red-300 mt-1">{connectionStatus.details}</div>
              )}
            </div>
          )}
        </div>

        {/* API Keys Validation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-linear-text-secondary">API Keys</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowKeys(!showKeys)}
              className="h-6 px-2"
            >
              {showKeys ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-linear-text-tertiary">Supabase URL</span>
              <div className={`flex items-center gap-1 ${getStatusColor(keyValidation.url.valid)}`}>
                {getStatusIcon(keyValidation.url.exists && keyValidation.url.valid)}
                <span>{keyValidation.url.exists ? 'Valid' : 'Missing'}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-linear-text-tertiary">Anon Key</span>
              <div className={`flex items-center gap-1 ${getStatusColor(keyValidation.anonKey.valid)}`}>
                {getStatusIcon(keyValidation.anonKey.exists && keyValidation.anonKey.valid)}
                <span>{keyValidation.anonKey.exists ? 'Valid' : 'Missing'}</span>
              </div>
            </div>
          </div>

          {showKeys && (
            <div className="text-xs space-y-1 bg-linear-border/20 p-2 rounded">
              <div>
                <span className="text-linear-text-tertiary">URL: </span>
                <span className="text-linear-text font-mono text-[10px]">
                  {keyValidation.url.value}
                </span>
              </div>
              <div>
                <span className="text-linear-text-tertiary">Key: </span>
                <span className="text-linear-text font-mono text-[10px]">
                  {keyValidation.anonKey.value}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Show/Hide Details Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-xs text-linear-text-tertiary hover:text-linear-text"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </Button>

        {/* Detailed Information */}
        {showDetails && (
          <div className="text-xs space-y-2 bg-linear-border/10 p-3 rounded border border-linear-border/30">
            <div>
              <span className="text-linear-text-secondary font-medium">Environment Variables:</span>
              <div className="mt-1 space-y-1 text-linear-text-tertiary">
                <div>VERCEL_ENV: {process.env.VERCEL_ENV || 'undefined'}</div>
                <div>NODE_ENV: {process.env.NODE_ENV || 'undefined'}</div>
                <div>NEXT_PUBLIC_SUPABASE_URL: {keyValidation.url.exists ? '✓ Set' : '✗ Missing'}</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY: {keyValidation.anonKey.exists ? '✓ Set' : '✗ Missing'}</div>
              </div>
            </div>
            
            {connectionStatus && (
              <div>
                <span className="text-linear-text-secondary font-medium">Connection Details:</span>
                <div className="mt-1 text-linear-text-tertiary">
                  {connectionStatus.success ? (
                    <div className="text-green-400">✓ Database connection successful</div>
                  ) : (
                    <div className="text-red-400">✗ {connectionStatus.error}</div>
                  )}
                </div>
              </div>
            )}
            
            <div className="pt-2 border-t border-linear-border/30">
              <div className="text-linear-text-tertiary text-[10px]">
                This status panel will be removed after launch. It&apos;s for debugging only.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}