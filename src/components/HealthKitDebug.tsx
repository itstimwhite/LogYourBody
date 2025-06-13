import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Activity,
  Scale,
  RefreshCw,
  Shield,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { useHealthKit } from "@/hooks/use-healthkit";
import { isNativeiOS } from "@/lib/platform";
import { toast } from "@/hooks/use-toast";

export function HealthKitDebug() {
  const {
    isAvailable,
    isAuthorized,
    loading,
    error,
    requestPermissions,
    getHealthData,
    getWeightHistory,
    syncToDatabase,
  } = useHealthKit();

  const [testResults, setTestResults] = useState<any>({});
  const [isTesting, setIsTesting] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);
  const [weightHistory, setWeightHistory] = useState<any[]>([]);

  // Auto-refresh status every 5 seconds when testing
  useEffect(() => {
    if (isTesting) {
      const interval = setInterval(() => {
        // This will trigger the hook to re-check status
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isTesting]);

  const runPermissionTest = async () => {
    setIsTesting(true);
    const testResult = {
      timestamp: new Date().toISOString(),
      platform: isNativeiOS() ? "iOS" : "Non-iOS",
      available: isAvailable,
      authorized: isAuthorized,
      error: error,
    };

    try {
      console.log("🔍 HealthKit Debug: Starting permission test...");
      const granted = await requestPermissions();
      testResult.permissionGranted = granted;
      
      toast({
        title: granted ? "Permissions Granted" : "Permissions Denied",
        description: granted 
          ? "HealthKit permissions were successfully granted"
          : "HealthKit permissions were denied or not available",
        variant: granted ? "default" : "destructive",
      });
    } catch (err: any) {
      testResult.permissionError = err.message;
      console.error("🚨 Permission test error:", err);
      
      toast({
        title: "Permission Test Failed",
        description: err.message,
        variant: "destructive",
      });
    }

    setTestResults((prev: any) => ({
      ...prev,
      permissions: testResult,
    }));
    setIsTesting(false);
  };

  const runDataTest = async () => {
    if (!isAvailable || !isAuthorized) {
      toast({
        title: "Cannot Test Data",
        description: "HealthKit is not available or not authorized",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    try {
      console.log("📊 HealthKit Debug: Testing data retrieval...");
      
      // Test basic health data
      const data = await getHealthData();
      setHealthData(data);
      
      // Test weight history (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const history = await getWeightHistory(startDate, endDate);
      setWeightHistory(history);

      setTestResults((prev: any) => ({
        ...prev,
        data: {
          timestamp: new Date().toISOString(),
          healthData: data,
          weightHistoryCount: history.length,
          success: true,
        },
      }));

      toast({
        title: "Data Test Complete",
        description: `Retrieved ${history.length} weight entries`,
      });
    } catch (err: any) {
      console.error("🚨 Data test error:", err);
      setTestResults((prev: any) => ({
        ...prev,
        data: {
          timestamp: new Date().toISOString(),
          error: err.message,
          success: false,
        },
      }));

      toast({
        title: "Data Test Failed",
        description: err.message,
        variant: "destructive",
      });
    }
    setIsTesting(false);
  };

  const runSyncTest = async () => {
    if (!isAvailable || !isAuthorized) {
      toast({
        title: "Cannot Test Sync",
        description: "HealthKit is not available or not authorized",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    try {
      console.log("🔄 HealthKit Debug: Testing database sync...");
      const result = await syncToDatabase();
      
      setTestResults((prev: any) => ({
        ...prev,
        sync: {
          timestamp: new Date().toISOString(),
          result,
        },
      }));

      toast({
        title: result.success ? "Sync Successful" : "Sync Failed",
        description: result.success 
          ? `Synced ${result.weightEntries || 0} weight entries`
          : result.error || "Unknown sync error",
        variant: result.success ? "default" : "destructive",
      });
    } catch (err: any) {
      console.error("🚨 Sync test error:", err);
      toast({
        title: "Sync Test Failed",
        description: err.message,
        variant: "destructive",
      });
    }
    setIsTesting(false);
  };

  const getStatusBadge = (condition: boolean, label: string) => {
    return (
      <Badge variant={condition ? "default" : "secondary"} className="ml-2">
        {condition ? <CheckCircle className="mr-1 h-3 w-3" /> : <AlertCircle className="mr-1 h-3 w-3" />}
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <Card className="border-border bg-secondary/30">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Heart className="mr-2 h-5 w-5 text-primary" />
            HealthKit Debug & Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Section */}
          <div className="space-y-2">
            <h4 className="font-medium">Current Status</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant={isNativeiOS() ? "default" : "secondary"}>
                Platform: {isNativeiOS() ? "iOS" : "Non-iOS"}
              </Badge>
              {getStatusBadge(isAvailable, "Available")}
              {getStatusBadge(isAuthorized, "Authorized")}
              {loading && (
                <Badge variant="outline">
                  <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                  Loading
                </Badge>
              )}
              {error && (
                <Badge variant="destructive">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Error
                </Badge>
              )}
            </div>
            {error && (
              <div className="rounded border border-destructive/20 bg-destructive/10 p-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          {/* Test Actions */}
          <div className="space-y-3">
            <h4 className="font-medium">Test Actions</h4>
            
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={runPermissionTest}
                disabled={isTesting || !isNativeiOS()}
                size="sm"
                variant="outline"
              >
                <Shield className="mr-2 h-4 w-4" />
                Test Permissions
              </Button>

              <Button
                onClick={runDataTest}
                disabled={isTesting || !isAvailable || !isAuthorized}
                size="sm"
                variant="outline"
              >
                <Activity className="mr-2 h-4 w-4" />
                Test Data Retrieval
              </Button>

              <Button
                onClick={runSyncTest}
                disabled={isTesting || !isAvailable || !isAuthorized}
                size="sm"
                variant="outline"
              >
                <Scale className="mr-2 h-4 w-4" />
                Test Database Sync
              </Button>
            </div>

            {!isNativeiOS() && (
              <div className="rounded border border-orange-200 bg-orange-50 p-2 text-sm text-orange-700">
                <Info className="mr-1 inline h-4 w-4" />
                HealthKit is only available on iOS devices. These tests will not work on web or other platforms.
              </div>
            )}
          </div>

          {/* Health Data Display */}
          {healthData && (
            <div className="space-y-2">
              <h4 className="font-medium">Retrieved Health Data</h4>
              <div className="rounded border bg-muted/30 p-3 text-sm">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(healthData, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Weight History Display */}
          {weightHistory.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Weight History ({weightHistory.length} entries)</h4>
              <div className="max-h-40 overflow-y-auto rounded border bg-muted/30 p-3 text-sm">
                {weightHistory.slice(0, 10).map((entry, index) => (
                  <div key={index} className="flex justify-between border-b border-muted py-1 last:border-b-0">
                    <span>{new Date(entry.date).toLocaleDateString()}</span>
                    <span>{entry.value} {entry.unit}</span>
                  </div>
                ))}
                {weightHistory.length > 10 && (
                  <div className="pt-2 text-center text-muted-foreground">
                    ... and {weightHistory.length - 10} more entries
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Test Results</h4>
              <div className="max-h-60 overflow-y-auto rounded border bg-muted/30 p-3 text-sm">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}