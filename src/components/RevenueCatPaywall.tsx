import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Loader2 } from 'lucide-react';
import { useRevenueCat, hasProFeatures } from '@/hooks/use-revenuecat';
import { toast } from '@/hooks/use-toast';
import { PurchasesPackage } from '@revenuecat/purchases-js';

interface RevenueCatPaywallProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function RevenueCatPaywall({ onSuccess, onError }: RevenueCatPaywallProps) {
  const {
    isConfigured,
    isLoading,
    customerInfo,
    offerings,
    error,
    purchasePackage,
    getOfferings,
  } = useRevenueCat();

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (isConfigured && !offerings) {
      getOfferings().catch(console.error);
    }
  }, [isConfigured, offerings, getOfferings]);

  // Check if user already has pro features
  useEffect(() => {
    if (customerInfo && hasProFeatures(customerInfo)) {
      onSuccess?.();
    }
  }, [customerInfo, onSuccess]);

  const handlePurchase = async (packageToPurchase: PurchasesPackage) => {
    if (purchasing) return;

    setPurchasing(true);
    try {
      const updatedCustomerInfo = await purchasePackage(packageToPurchase);
      
      if (hasProFeatures(updatedCustomerInfo)) {
        toast({
          title: 'Purchase Successful!',
          description: 'Welcome to LogYourBody Pro! Enjoy all premium features.',
        });
        onSuccess?.();
      } else {
        throw new Error('Purchase completed but pro features not activated');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Purchase failed';
      console.error('Purchase error:', err);
      
      toast({
        title: 'Purchase Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      onError?.(errorMessage);
    } finally {
      setPurchasing(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Payment System Unavailable</h3>
          <p className="text-muted-foreground">
            {error || 'RevenueCat is not configured. Please contact support.'}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || !offerings) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading payment options...</p>
        </div>
      </div>
    );
  }

  const defaultOffering = offerings.find(o => o.identifier === 'default') || offerings[0];
  
  if (!defaultOffering) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">No Plans Available</h3>
          <p className="text-muted-foreground">
            No subscription plans are currently available. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const monthlyPackage = defaultOffering.availablePackages.find(p => 
    p.identifier === 'monthly' || p.rcBillingPeriod?.unit === 'month'
  );
  
  const annualPackage = defaultOffering.availablePackages.find(p => 
    p.identifier === 'annual' || p.rcBillingPeriod?.unit === 'year'
  );

  const selectedPackage = selectedPlan === 'annual' ? annualPackage : monthlyPackage;

  const features = [
    'Unlimited body measurements',
    'Advanced analytics & trends',
    'Progress photo tracking', 
    'Health app synchronization',
    'Data export capabilities',
    'Priority customer support',
    'Detailed progress insights',
    'FFMI calculations',
  ];

  // Calculate savings for annual plan
  const monthlyCost = monthlyPackage?.product.price || 9.99;
  const annualCost = annualPackage?.product.price || 69.99;
  const annualMonthlyCost = annualCost / 12;
  const savings = monthlyCost - annualMonthlyCost;
  const savingsPercent = Math.round((savings / monthlyCost) * 100);

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Upgrade to Pro</h2>
        <p className="text-muted-foreground">
          Unlock all features and get the most out of your body composition tracking
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-8" role="group">
        <span className={`text-sm font-medium ${selectedPlan === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
          Monthly
        </span>
        <Switch
          checked={selectedPlan === 'annual'}
          onCheckedChange={(checked) => setSelectedPlan(checked ? 'annual' : 'monthly')}
          className="data-[state=checked]:bg-primary"
        />
        <span className={`text-sm font-medium ${selectedPlan === 'annual' ? 'text-foreground' : 'text-muted-foreground'}`}>
          Annual
        </span>
        {selectedPlan === 'annual' && (
          <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
            Save {savingsPercent}%
          </Badge>
        )}
      </div>

      {/* Pricing Card */}
      <Card className="mb-6 ring-2 ring-primary">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">LogYourBody Pro</CardTitle>
          <div className="mt-4">
            <span className="text-3xl font-bold">
              ${selectedPackage?.product.price || (selectedPlan === 'annual' ? '69.99' : '9.99')}
            </span>
            <span className="text-muted-foreground">
              /{selectedPlan === 'annual' ? 'year' : 'month'}
            </span>
          </div>
          {selectedPlan === 'annual' && (
            <div className="mt-2">
              <span className="text-sm text-muted-foreground">
                ${annualMonthlyCost.toFixed(2)}/month when billed annually
              </span>
              <div className="text-sm text-green-600 font-medium">
                Save ${(savings * 12).toFixed(2)} vs monthly billing
              </div>
            </div>
          )}
          <CardDescription className="text-base mt-4">
            Professional body composition tracking with advanced analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <Check className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          
          <Button 
            className="w-full" 
            onClick={() => selectedPackage && handlePurchase(selectedPackage)}
            disabled={purchasing || !selectedPackage}
          >
            {purchasing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              `Start ${selectedPlan === 'annual' ? 'Annual' : 'Monthly'} Plan`
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center mt-3">
            Secure payment • Cancel anytime • No hidden fees
          </p>
        </CardContent>
      </Card>

      {error && (
        <div className="text-center text-sm text-destructive mb-4">
          {error}
        </div>
      )}
    </div>
  );
}