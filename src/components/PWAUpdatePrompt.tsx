import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw, X } from 'lucide-react';
import { usePWAUpdate } from '@/hooks/use-pwa-update';

interface PWAUpdatePromptProps {
  onUpdateAccepted?: () => void;
}

export function PWAUpdatePrompt({ onUpdateAccepted }: PWAUpdatePromptProps) {
  const { updateAvailable, isUpdating, applyUpdate, dismissUpdate } = usePWAUpdate();
  const currentVersion = import.meta.env.PACKAGE_VERSION || '1.0.0';
  const newVersion = new Date().toISOString().split('T')[0].replace(/-/g, '.');

  const handleUpdate = async () => {
    if (onUpdateAccepted) {
      onUpdateAccepted();
    }
    await applyUpdate();
  };

  const handleDismiss = () => {
    dismissUpdate();
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="shadow-lg border-primary/20 bg-card/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Update Available</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            A new version of LogYourBody is ready to install.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current:</span>
            <Badge variant="outline">{currentVersion}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">New:</span>
            <Badge variant="default">{newVersion}</Badge>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="flex-1"
              size="sm"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Update Now
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              size="sm"
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}