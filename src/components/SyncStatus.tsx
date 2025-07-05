'use client';

import { useSync } from '@/hooks/use-sync';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CloudOff, CloudUpload, Cloud, AlertCircle } from 'lucide-react';

export function SyncStatus() {
  const { isSyncing, syncStatus, pendingSyncCount, error, syncNow, lastSyncDate } = useSync();

  if (pendingSyncCount === 0 && syncStatus !== 'error') {
    return null;
  }

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-lg p-3 text-sm",
      "bg-muted/50 backdrop-blur-sm",
      syncStatus === 'error' && "bg-destructive/10"
    )}>
      <div className="flex items-center gap-2">
        {isSyncing ? (
          <CloudUpload className="h-4 w-4 text-blue-500 animate-pulse" />
        ) : syncStatus === 'error' ? (
          <AlertCircle className="h-4 w-4 text-destructive" />
        ) : pendingSyncCount > 0 ? (
          <CloudOff className="h-4 w-4 text-orange-500" />
        ) : (
          <Cloud className="h-4 w-4 text-green-500" />
        )}
        
        <span className="text-muted-foreground">
          {isSyncing ? (
            'Syncing...'
          ) : syncStatus === 'error' ? (
            error || 'Sync failed'
          ) : pendingSyncCount > 0 ? (
            `${pendingSyncCount} ${pendingSyncCount === 1 ? 'item' : 'items'} pending sync`
          ) : (
            'All synced'
          )}
        </span>
      </div>

      {!isSyncing && (pendingSyncCount > 0 || syncStatus === 'error') && (
        <Button
          size="sm"
          variant="outline"
          onClick={syncNow}
          className="ml-auto"
        >
          Sync Now
        </Button>
      )}

      {lastSyncDate && !isSyncing && syncStatus === 'success' && (
        <span className="ml-auto text-xs text-muted-foreground">
          Last sync: {new Date(lastSyncDate).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}