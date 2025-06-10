import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, RefreshCw, TestTube, CreditCard } from 'lucide-react';
import { useRevenueCat, hasProFeatures, getSubscriptionStatus } from '@/hooks/use-revenuecat';
import { RevenueCatPaywall } from './RevenueCatPaywall';
import { toast } from '@/hooks/use-toast';

export function RevenueCatDebug() {
  const {
    isConfigured,
    isLoading,
    customerInfo,
    offerings,
    error,
    getOfferings,
    restorePurchases,
  } = useRevenueCat();

  const [testing, setTesting] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleTestOfferings = async () => {
    setTesting(true);
    try {
      const fetchedOfferings = await getOfferings();
      toast({
        title: 'Offerings Test',
        description: `Found ${fetchedOfferings.length} offerings`,
      });
      console.log('Offerings:', fetchedOfferings);
    } catch (err) {
      toast({
        title: 'Offerings Test Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleRestorePurchases = async () => {
    setTesting(true);
    try {
      const restoredInfo = await restorePurchases();
      toast({
        title: 'Restore Test',
        description: 'Purchase restoration completed',
      });
      console.log('Restored Customer Info:', restoredInfo);
    } catch (err) {
      toast({
        title: 'Restore Test Failed', 
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const subscriptionStatus = getSubscriptionStatus(customerInfo);
  const hasProAccess = hasProFeatures(customerInfo);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          RevenueCat Integration Test
        </CardTitle>
        <CardDescription>
          Debug and test RevenueCat subscription functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Configuration Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Configuration:</span>
            <Badge variant={isConfigured ? "default" : "destructive"}>
              {isConfigured ? "Configured" : "Not Configured"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Loading:</span>
            <Badge variant={isLoading ? "secondary" : "outline"}>
              {isLoading ? "Loading" : "Ready"}
            </Badge>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium">Error:</p>
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Customer Info */}
        {customerInfo && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Customer Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">User ID:</span>
                <p className="text-muted-foreground break-all">{customerInfo.originalAppUserId}</p>
              </div>
              <div>
                <span className="font-medium">Pro Features:</span>
                <Badge variant={hasProAccess ? "default" : "outline"}>
                  {hasProAccess ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            
            {/* Subscription Status */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Subscription:</span>
                <Badge variant={subscriptionStatus.isActive ? "default" : "outline"}>
                  {subscriptionStatus.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Will Renew:</span>
                <Badge variant={subscriptionStatus.willRenew ? "default" : "secondary"}>
                  {subscriptionStatus.willRenew ? "Yes" : "No"}
                </Badge>
              </div>
            </div>

            {subscriptionStatus.expirationDate && (
              <div className="text-sm">
                <span className="font-medium">Expires:</span>
                <p className="text-muted-foreground">
                  {new Date(subscriptionStatus.expirationDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Offerings Info */}
        {offerings && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Available Offerings</h4>
            <div className="space-y-2">
              {offerings.map((offering, index) => (
                <div key={index} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{offering.metadata?.displayName || offering.identifier}</span>
                    <Badge variant="outline">{offering.availablePackages.length} packages</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {offering.availablePackages.map((pkg, pkgIndex) => (
                      <div key={pkgIndex} className="flex justify-between">
                        <span>{pkg.identifier}</span>
                        <span>${pkg.product.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Test Actions</h4>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleTestOfferings}
              disabled={testing || !isConfigured}
              variant="outline"
              size="sm"
            >
              {testing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Test Offerings
            </Button>
            
            <Button
              onClick={handleRestorePurchases}
              disabled={testing || !isConfigured}
              variant="outline"
              size="sm"
            >
              {testing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Restore Purchases
            </Button>
            
            <Button
              onClick={() => setShowPaywall(true)}
              disabled={!isConfigured}
              variant="default"
              size="sm"
            >
              <CreditCard className="h-4 w-4 mr-1" />
              Test Paywall
            </Button>
          </div>
        </div>

        {/* Environment Info */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold mb-2">Environment</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Public Key: {import.meta.env.VITE_REVENUECAT_PUBLIC_KEY ? '✓ Configured' : '✗ Missing'}</div>
            <div>Platform: {navigator.platform}</div>
            <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
          </div>
        </div>

      </CardContent>
      
      {/* Test Paywall Dialog */}
      <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>RevenueCat Paywall Test</DialogTitle>
          </DialogHeader>
          <RevenueCatPaywall
            onSuccess={() => {
              toast({
                title: 'Purchase Success!',
                description: 'RevenueCat integration test completed successfully',
              });
              setShowPaywall(false);
            }}
            onError={(error) => {
              toast({
                title: 'Purchase Test Failed',
                description: error,
                variant: 'destructive',
              });
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}