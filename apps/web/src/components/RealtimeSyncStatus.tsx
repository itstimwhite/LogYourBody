'use client'

import { useRealtimeSync } from '@/hooks/use-realtime-sync'
import { 
  Cloud, 
  Loader2, 
  Check, 
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

export function RealtimeSyncStatus() {
  const {
    isSyncing,
    lastSyncDate,
    syncStatus,
    pendingSyncCount,
    isOnline,
    realtimeConnected,
    error,
    syncNow,
    clearError
  } = useRealtimeSync()

  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="h-4 w-4 text-linear-text-tertiary" />
    }
    
    if (isSyncing) {
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
    }
    
    if (error || syncStatus === 'error') {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    
    if (pendingSyncCount > 0) {
      return <Cloud className="h-4 w-4 text-yellow-500" />
    }
    
    if (realtimeConnected) {
      return <Wifi className="h-4 w-4 text-green-500" />
    }
    
    return <Check className="h-4 w-4 text-green-500" />
  }

  const getStatusText = () => {
    if (!isOnline) return 'Offline'
    if (isSyncing) return 'Syncing...'
    if (error) return 'Sync error'
    if (pendingSyncCount > 0) return `${pendingSyncCount} pending`
    if (realtimeConnected) return 'Live sync'
    return 'Synced'
  }

  const getTooltipContent = () => {
    const lines = []
    
    if (!isOnline) {
      lines.push('You are offline. Changes will sync when reconnected.')
    } else if (realtimeConnected) {
      lines.push('Real-time sync is active')
    }
    
    if (pendingSyncCount > 0) {
      lines.push(`${pendingSyncCount} changes waiting to sync`)
    }
    
    if (lastSyncDate) {
      lines.push(`Last sync: ${formatDistanceToNow(lastSyncDate, { addSuffix: true })}`)
    }
    
    if (error) {
      lines.push(`Error: ${error}`)
    }
    
    return lines.join('\n')
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={syncNow}
              disabled={isSyncing || !isOnline}
              className={cn(
                "gap-2 text-xs",
                error && "text-red-500 hover:text-red-600"
              )}
            >
              {getStatusIcon()}
              <span className="hidden sm:inline">{getStatusText()}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="whitespace-pre-line text-xs">{getTooltipContent()}</p>
            {!isOnline && (
              <p className="mt-2 text-xs font-medium">Click to retry when online</p>
            )}
          </TooltipContent>
        </Tooltip>
        
        {error && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="h-6 w-6 p-0"
          >
            <span className="sr-only">Clear error</span>
            ×
          </Button>
        )}
      </div>
    </TooltipProvider>
  )
}

// Minimal sync indicator for mobile
export function MobileSyncIndicator() {
  const {
    isSyncing,
    pendingSyncCount,
    isOnline,
    realtimeConnected,
    error
  } = useRealtimeSync()

  const getIndicatorColor = () => {
    if (!isOnline) return 'bg-gray-500'
    if (error) return 'bg-red-500'
    if (isSyncing) return 'bg-blue-500'
    if (pendingSyncCount > 0) return 'bg-yellow-500'
    if (realtimeConnected) return 'bg-green-500'
    return 'bg-green-500'
  }

  const showIndicator = !isOnline || error || isSyncing || pendingSyncCount > 0

  if (!showIndicator && realtimeConnected) return null

  return (
    <div className="fixed top-2 right-2 z-50">
      <div className={cn(
        "h-2 w-2 rounded-full",
        getIndicatorColor(),
        isSyncing && "animate-pulse"
      )} />
    </div>
  )
}