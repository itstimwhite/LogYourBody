import { useEffect, useState } from 'react';
import { syncManager } from '@/lib/sync/sync-manager';

export interface SyncState {
  isSyncing: boolean;
  lastSyncDate: Date | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  pendingSyncCount: number;
  error?: string;
}

export function useSync() {
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    lastSyncDate: null,
    syncStatus: 'idle',
    pendingSyncCount: 0,
  });

  useEffect(() => {
    // Subscribe to sync state changes
    const unsubscribe = syncManager.subscribe(setSyncState);
    
    // Cleanup on unmount
    return unsubscribe;
  }, []);

  const syncNow = async () => {
    await syncManager.syncAll();
  };

  const logWeight = async (weight: number, unit: string, notes?: string) => {
    return syncManager.logWeight(weight, unit, notes);
  };

  const logDailyMetrics = async (steps?: number, notes?: string) => {
    return syncManager.logDailyMetrics(steps, notes);
  };

  return {
    ...syncState,
    syncNow,
    logWeight,
    logDailyMetrics,
  };
}