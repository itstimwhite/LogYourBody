import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { checkDatabaseStatus, DatabaseStatus } from '@/lib/database-check';
import { RefreshCw, Database, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export function DatabaseDebug() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const result = await checkDatabaseStatus();
      setStatus(result);
    } catch (error) {
      console.error('Error checking database status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (exists: boolean) => {
    return exists ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (exists: boolean) => {
    return (
      <Badge variant={exists ? 'default' : 'destructive'}>
        {exists ? 'Exists' : 'Missing'}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>Database Status</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkStatus}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription>
          Check if all required database tables exist and are accessible
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status ? (
          <>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {status.connected ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                Database Connection
              </span>
              <Badge variant={status.connected ? 'default' : 'destructive'}>
                {status.connected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Tables:</h4>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {getStatusIcon(status.profilesTableExists)}
                  profiles
                </span>
                {getStatusBadge(status.profilesTableExists)}
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {getStatusIcon(status.userSettingsTableExists)}
                  user_settings
                </span>
                {getStatusBadge(status.userSettingsTableExists)}
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {getStatusIcon(status.emailSubscriptionsTableExists)}
                  email_subscriptions
                </span>
                {getStatusBadge(status.emailSubscriptionsTableExists)}
              </div>
            </div>

            {status.error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Error</p>
                    <p className="text-xs text-destructive/80">{status.error}</p>
                  </div>
                </div>
              </div>
            )}

            {!status.profilesTableExists && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Migration Required</p>
                    <p className="text-xs text-yellow-700">
                      Run database migrations to create the required tables.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Checking database status...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}