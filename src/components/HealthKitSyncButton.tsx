import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download, CheckCircle, AlertCircle } from "lucide-react";
import { useHealthKit } from "@/hooks/use-healthkit";
import { toast } from "@/hooks/use-toast";
import { isNativeiOS } from "@/lib/platform";

export function HealthKitSyncButton() {
  const { isAvailable, isAuthorized, syncToDatabase, loading } = useHealthKit();
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<any>(null);

  const handleSync = async () => {
    if (!isNativeiOS()) {
      toast({
        title: "Not Available",
        description: "HealthKit sync is only available on iOS devices",
        variant: "destructive",
      });
      return;
    }

    if (!isAvailable || !isAuthorized) {
      toast({
        title: "HealthKit Not Available",
        description: "Please enable HealthKit permissions in settings",
        variant: "destructive",
      });
      return;
    }

    setSyncing(true);
    try {
      console.log("Starting HealthKit sync...");
      const result = await syncToDatabase();
      setLastSyncResult(result);

      if (result.success) {
        const messages = [];
        if (result.weightEntries) {
          messages.push(`${result.weightEntries} weight entries`);
        }
        if (result.bodyFatEntries) {
          messages.push(`${result.bodyFatEntries} body fat entries`);
        }
        if (result.stepEntries) {
          messages.push(`${result.stepEntries} days of step data`);
        }
        if (result.profileUpdated) {
          messages.push("profile updated");
        }

        toast({
          title: "HealthKit Sync Complete",
          description:
            messages.length > 0
              ? `Synced: ${messages.join(", ")}`
              : "All data up to date",
        });
      } else {
        toast({
          title: "Sync Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Sync Failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const getButtonIcon = () => {
    if (syncing || loading) {
      return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
    }
    if (lastSyncResult?.success) {
      return <CheckCircle className="mr-2 h-4 w-4 text-green-500" />;
    }
    if (lastSyncResult?.success === false) {
      return <AlertCircle className="mr-2 h-4 w-4 text-red-500" />;
    }
    return <Download className="mr-2 h-4 w-4" />;
  };

  const getButtonText = () => {
    if (syncing) return "Syncing...";
    if (loading) return "Loading...";
    return "Sync now";
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={syncing || loading || !isAvailable || !isAuthorized}
      className="w-full border-border bg-secondary text-foreground hover:bg-muted"
    >
      {getButtonIcon()}
      {getButtonText()}
    </Button>
  );
}
