# RevenueCat Cross-Platform Setup Guide

This guide explains how to set up RevenueCat for both iOS (Apple In-App Purchases) and Web (Stripe) payments in the LogYourBody app.

## Overview

- **iOS App**: Uses Apple In-App Purchases via RevenueCat iOS SDK
- **Web App**: Uses Stripe via RevenueCat Web SDK
- **Backend**: RevenueCat handles subscription management across platforms

## RevenueCat Dashboard Setup

### 1. Create Products

In RevenueCat dashboard, create your subscription products:

```
- monthly_premium ($9.99/month)
- yearly_premium ($89.99/year) 
- lifetime_premium ($299.99 one-time)
```

### 2. Configure App Platforms

#### iOS Configuration
1. Add iOS app with bundle ID: `com.logyourbody.app`
2. Add Apple API key (from App Store Connect)
3. Configure in-app purchases in App Store Connect
4. Map RevenueCat products to Apple product IDs

#### Web Configuration  
1. Add Web app 
2. Configure Stripe integration
3. Add Stripe API keys
4. Create Stripe products and map to RevenueCat

### 3. API Keys

You'll have different API keys for each platform:
- iOS Public Key: `appl_xxxxxxxxxxxxx`
- Web Public Key: `web_xxxxxxxxxxxxx` 
- Backend Secret Key: `sk_xxxxxxxxxxxxx`

## iOS Implementation

### Swift Code (iOS App)

```swift
// RevenueCatManager.swift
import RevenueCat

class RevenueCatManager: ObservableObject {
    static let shared = RevenueCatManager()
    
    @Published var isPremium = false
    @Published var offerings: Offerings?
    
    init() {
        Purchases.logLevel = .debug
        Purchases.configure(withAPIKey: "appl_xxxxxxxxxxxxx")
        
        // Check subscription status
        checkSubscriptionStatus()
        
        // Listen for updates
        Purchases.shared.delegate = self
    }
    
    func purchase(package: Package) async throws {
        let (transaction, customerInfo, userCancelled) = try await Purchases.shared.purchase(package: package)
        
        if !userCancelled {
            self.isPremium = customerInfo.entitlements["premium"]?.isActive == true
        }
    }
    
    func checkSubscriptionStatus() {
        Task {
            do {
                let customerInfo = try await Purchases.shared.customerInfo()
                await MainActor.run {
                    self.isPremium = customerInfo.entitlements["premium"]?.isActive == true
                }
            } catch {
                print("Error fetching customer info: \(error)")
            }
        }
    }
}

extension RevenueCatManager: PurchasesDelegate {
    func purchases(_ purchases: Purchases, receivedUpdated customerInfo: CustomerInfo) {
        self.isPremium = customerInfo.entitlements["premium"]?.isActive == true
    }
}
```

## Web Implementation

### Next.js Code (Web App)

```typescript
// lib/revenuecat.ts
import { Purchases } from '@revenuecat/purchases-js';

class RevenueCatWeb {
  private static instance: RevenueCatWeb;
  private purchases: Purchases | null = null;

  static getInstance(): RevenueCatWeb {
    if (!RevenueCatWeb.instance) {
      RevenueCatWeb.instance = new RevenueCatWeb();
    }
    return RevenueCatWeb.instance;
  }

  async initialize(userId: string) {
    if (!this.purchases) {
      this.purchases = Purchases.configure({
        apiKey: process.env.NEXT_PUBLIC_REVENUECAT_WEB_KEY!,
        appUserID: userId,
      });
    }
  }

  async purchasePackage(packageId: string) {
    if (!this.purchases) throw new Error('RevenueCat not initialized');
    
    const offerings = await this.purchases.getOfferings();
    const targetPackage = offerings.current?.availablePackages.find(
      pkg => pkg.identifier === packageId
    );
    
    if (!targetPackage) throw new Error('Package not found');
    
    // This will redirect to Stripe Checkout
    const { customerInfo } = await this.purchases.purchasePackage(targetPackage);
    return customerInfo;
  }

  async getCustomerInfo() {
    if (!this.purchases) throw new Error('RevenueCat not initialized');
    return await this.purchases.getCustomerInfo();
  }

  async restorePurchases() {
    if (!this.purchases) throw new Error('RevenueCat not initialized');
    return await this.purchases.restorePurchases();
  }
}

export default RevenueCatWeb.getInstance();
```

### React Component

```typescript
// components/SubscriptionPlans.tsx
import { useState, useEffect } from 'react';
import revenueCat from '@/lib/revenuecat';

export function SubscriptionPlans() {
  const [offerings, setOfferings] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    const offerings = await revenueCat.getOfferings();
    setOfferings(offerings);
  };

  const handlePurchase = async (packageId: string) => {
    setIsPurchasing(true);
    try {
      await revenueCat.purchasePackage(packageId);
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    // Render subscription options
  );
}
```

## Backend Webhooks

### Next.js API Route

```typescript
// app/api/webhooks/revenuecat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // Verify webhook signature
  const signature = req.headers.get('X-RevenueCat-Signature');
  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const { event } = body;
  const supabase = createClient();

  switch (event.type) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
      // Update user's subscription status
      await supabase
        .from('profiles')
        .update({ 
          subscription_status: 'active',
          subscription_tier: event.product_id,
          subscription_expires_at: event.expiration_at
        })
        .eq('id', event.app_user_id);
      break;
      
    case 'CANCELLATION':
    case 'EXPIRATION':
      // Update subscription status
      await supabase
        .from('profiles')
        .update({ 
          subscription_status: 'inactive',
          subscription_tier: null
        })
        .eq('id', event.app_user_id);
      break;
  }

  return NextResponse.json({ received: true });
}
```

## Shared Subscription Logic

Both platforms share the same subscription tiers and user benefits:

1. **Free Tier**
   - Basic tracking
   - 10 photos/month
   - Basic analytics

2. **Premium Tier**
   - Unlimited tracking
   - Unlimited photos
   - Advanced analytics
   - Export data
   - Priority support

## Testing

### iOS Testing
1. Use sandbox App Store accounts
2. Test in TestFlight
3. Verify receipt validation

### Web Testing
1. Use Stripe test mode
2. Test cards: 4242 4242 4242 4242
3. Verify webhook delivery

## Important Notes

1. **User ID Consistency**: Always use Supabase user ID as RevenueCat app user ID
2. **Cross-Platform Restore**: Users can restore purchases on any platform
3. **Subscription Management**: Direct users to platform-specific management:
   - iOS: Settings > Subscriptions
   - Web: Stripe Customer Portal
4. **Price Parity**: Keep prices consistent across platforms (accounting for app store fees)