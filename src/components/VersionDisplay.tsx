import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, RefreshCw } from 'lucide-react';

interface VersionDisplayProps {
  className?: string;
  showBuildInfo?: boolean;
}

export function VersionDisplay({ className = '', showBuildInfo = false }: VersionDisplayProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [buildTime] = useState(new Date().toISOString());
  
  const version = import.meta.env.PACKAGE_VERSION || '1.0.0';
  const buildHash = import.meta.env.VITE_BUILD_HASH || 'dev';
  const environment = import.meta.env.MODE || 'development';

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkForUpdates = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          setLastChecked(new Date());
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!showBuildInfo) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={`text-xs ${className}`}
            >
              v{version}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1 text-xs">
              <div>Version: {version}</div>
              <div>Environment: {environment}</div>
              <div>Build: {buildHash}</div>
              <div className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                {isOnline ? 'Online' : 'Offline'}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={`space-y-2 text-xs text-muted-foreground ${className}`}>
      <div className="flex items-center justify-between">
        <span>Version Information</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={checkForUpdates}
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Check Updates
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="font-medium">Version:</span>
          <Badge variant="outline" className="ml-2 text-xs">
            v{version}
          </Badge>
        </div>
        
        <div className="flex items-center">
          <span className="font-medium">Status:</span>
          <div className="flex items-center ml-2">
            <span className={`w-2 h-2 rounded-full mr-1 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        
        <div>
          <span className="font-medium">Environment:</span>
          <Badge 
            variant={environment === 'production' ? 'default' : 'secondary'} 
            className="ml-2 text-xs"
          >
            {environment}
          </Badge>
        </div>
        
        <div>
          <span className="font-medium">Build:</span>
          <span className="ml-2 font-mono text-xs">
            {buildHash.slice(0, 8)}
          </span>
        </div>
      </div>
      
      {lastChecked && (
        <div className="text-xs text-muted-foreground">
          Last checked: {formatTime(lastChecked)}
        </div>
      )}
    </div>
  );
}