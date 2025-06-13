import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { tw, settingsTokens } from '@/styles/settings-design';
import { SettingGroup, SettingItem } from './SettingGroup';

interface DatabaseStatus {
  connected: boolean;
  latency: number | null;
  lastSync: Date | null;
  recordCount: number;
  storageUsed: string;
  error?: string;
}

interface DatabaseStatusCardProps {
  onRefresh: () => Promise<DatabaseStatus>;
  onExportData: () => void;
  onClearCache: () => void;
  className?: string;
}

export const DatabaseStatusCard = React.memo<DatabaseStatusCardProps>(function DatabaseStatusCard({
  onRefresh,
  onExportData,
  onClearCache,
  className,
}) {
  const [status, setStatus] = useState<DatabaseStatus>({
    connected: false,
    latency: null,
    lastSync: null,
    recordCount: 0,
    storageUsed: '0 MB',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Initial status check
  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Haptic feedback
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        const { Haptics, ImpactStyle } = (window as any).Capacitor.Plugins;
        Haptics?.impact({ style: ImpactStyle.Light });
      }

      const newStatus = await onRefresh();
      setStatus(newStatus);
      setLastRefresh(new Date());

      // Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'database_status_refresh', {
          event_category: 'Database',
          event_label: 'Status Refresh',
          custom_parameters: {
            connected: newStatus.connected,
            latency: newStatus.latency,
            record_count: newStatus.recordCount,
          },
        });
      }
    } catch (error) {
      console.error('Failed to refresh database status:', error);
      setStatus(prev => ({
        ...prev,
        connected: false,
        error: error instanceof Error ? error.message : 'Failed to connect',
      }));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportData = () => {
    // Haptic feedback
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      const { Haptics, ImpactStyle } = (window as any).Capacitor.Plugins;
      Haptics?.impact({ style: ImpactStyle.Medium });
    }

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'data_export_initiated', {
        event_category: 'Data',
        event_label: 'Export Data',
        custom_parameters: {
          record_count: status.recordCount,
        },
      });
    }

    onExportData();
  };

  const handleClearCache = () => {
    // Haptic feedback
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      const { Haptics, ImpactStyle } = (window as any).Capacitor.Plugins;
      Haptics?.impact({ style: ImpactStyle.Medium });
    }

    // Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cache_cleared', {
        event_category: 'Database',
        event_label: 'Clear Cache',
      });
    }

    onClearCache();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getConnectionStatus = () => {
    if (status.error) {
      return {
        text: 'Connection Error',
        color: 'text-destructive',
        icon: (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ),
      };
    }
    
    if (!status.connected) {
      return {
        text: 'Disconnected',
        color: 'text-orange-400',
        icon: (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ),
      };
    }
    
    return {
      text: 'Connected',
      color: 'text-green-400',
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ),
    };
  };

  const connectionInfo = getConnectionStatus();

  return (
    <SettingGroup title="Database & Storage" className={className}>
      {/* Connection Status */}
      <SettingItem
        title="Connection Status"
        subtitle={status.error || `${status.latency ? `${status.latency}ms latency` : 'Checking connection...'}`}
        icon={
          <div className={connectionInfo.color}>
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 15h2v5h12V4H6v5H4V2h16v18H4v-5z"/>
            </svg>
          </div>
        }
        accessory={
          <div className="flex items-center gap-2">
            <div className={connectionInfo.color}>
              {connectionInfo.icon}
            </div>
            <motion.button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                'p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                tw.focus
              )}
              whileTap={{ scale: 0.9 }}
              transition={settingsTokens.animation.fast}
              aria-label="Refresh connection status"
            >
              <svg
                className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </motion.button>
          </div>
        }
      />

      {/* Storage Info */}
      <SettingItem
        title="Storage Usage"
        subtitle={`${status.recordCount.toLocaleString()} records • ${status.storageUsed}`}
        icon={
          <div className="text-blue-400">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 6h20v-4H2v4zm2-3h2v2H4v-2z"/>
            </svg>
          </div>
        }
      />

      {/* Last Sync */}
      <SettingItem
        title="Last Sync"
        subtitle={`Data: ${formatDate(status.lastSync)} • Status: ${formatDate(lastRefresh)}`}
        icon={
          <div className="text-purple-400">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
            </svg>
          </div>
        }
      />

      {/* Export Data */}
      <SettingItem
        title="Export Data"
        subtitle="Download your health data as CSV"
        onClick={handleExportData}
        accessoryType="disclosure"
        icon={
          <div className="text-green-400">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          </div>
        }
      />

      {/* Clear Cache */}
      <SettingItem
        title="Clear Local Cache"
        subtitle="Free up space by clearing cached data"
        onClick={handleClearCache}
        accessoryType="disclosure"
        icon={
          <div className="text-orange-400">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 2l2 2h8l2-2v2h4v2h-2v13c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V6H2V4h4V2zm2 2v2h8V4H8zm1 4v9h1V8H9zm3 0v9h1V8h-1zm3 0v9h1V8h-1z"/>
            </svg>
          </div>
        }
      />

      {/* Database info */}
      <div className={cn(tw.helperText, 'px-4 pb-2')}>
        <div className="space-y-1">
          <p className="font-medium text-foreground">Database Features:</p>
          <div className="space-y-0.5 text-xs">
            <div className="flex items-center gap-2">
              <svg className="h-3 w-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Real-time synchronization
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-3 w-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Automatic backups and versioning
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-3 w-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Offline support with conflict resolution
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-3 w-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              GDPR compliant data export
            </div>
          </div>
        </div>
      </div>
    </SettingGroup>
  );
});