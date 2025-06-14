# RevenueCat Configuration Import Guide

## Step 1: Access RevenueCat Dashboard

1. Go to [app.revenuecat.com](https://app.revenuecat.com)
2. Sign in to your account
3. Select or create the "LogYourBody" project

## Step 2: Connect Stripe Integration

### In RevenueCat Dashboard:

1. Go to **Project Settings** → **Integrations**
2. Click **Connect** next to Stripe
3. Enter your Stripe API keys:
   - **Publishable Key**: `pk_test_...` (from Stripe Dashboard)
   - **Secret Key**: `sk_test_...` (from Stripe Dashboard)
4. Click **Save** and test the connection

## Step 3: Import Products with Stripe Price IDs

### Monthly Product:

1. Go to **Products** tab
2. Click **Add Product**
3. Fill in the details:
   - **Product ID**: `logyourbody_monthly`
   - **Type**: Auto-renewable subscription
   - **Display Name**: LogYourBody Pro Monthly
   - **Platform**: Web
   - **Stripe Price ID**: `price_1RY9Y2RCO021kiwC8ltF2cFA`
4. Click **Save**

### Annual Product:

1. Click **Add Product** again
2. Fill in the details:
   - **Product ID**: `logyourbody_annual`
   - **Type**: Auto-renewable subscription
   - **Display Name**: LogYourBody Pro Annual
   - **Platform**: Web
   - **Stripe Price ID**: `price_1RY9YJRCO021kiwCBzaxnVEU`
3. Click **Save**

## Step 4: Create Entitlements

1. Go to **Entitlements** tab
2. Click **Add Entitlement**
3. Fill in:
   - **Identifier**: `pro_features`
   - **Display Name**: Pro Features
4. **Attach Products**:
   - Select `logyourbody_monthly`
   - Select `logyourbody_annual`
5. Click **Save**

## Step 5: Create Offerings

1. Go to **Offerings** tab
2. Click **Add Offering**
3. Fill in:
   - **Identifier**: `default`
   - **Display Name**: LogYourBody Pro
   - **Make Current**: ✅ (checked)

### Add Packages:

1. Click **Add Package**
2. **Monthly Package**:
   - **Package ID**: `monthly`
   - **Product**: `logyourbody_monthly`
   - **Position**: 1
3. Click **Add Package** again
4. **Annual Package**:
   - **Package ID**: `annual`
   - **Product**: `logyourbody_annual`
   - **Position**: 2
5. Click **Save Offering**

## Step 6: Configure App Settings

1. Go to **Apps** tab
2. Click **Add App** (if not already added)
3. Fill in:
   - **App Name**: LogYourBody
   - **Platform**: Web
   - **Bundle ID**: `com.logyourbody.app`
4. Click **Save**

## Step 7: Get API Keys

1. Go to **Project Settings** → **API Keys**
2. Copy the **Public API Key** for Web and iOS
3. Update your `.env` file:
   ```env
   VITE_REVENUECAT_WEB_KEY=your_web_public_key
   VITE_REVENUECAT_IOS_KEY=your_ios_public_key
   # Legacy (optional)
   VITE_REVENUECAT_PUBLIC_KEY=your_copied_public_key
   ```

## Step 8: Test Configuration

### Verify Stripe Connection:

1. In RevenueCat Dashboard, go to **Project Settings** → **Integrations**
2. Ensure Stripe shows as "Connected" with a green status

### Test Product Sync:

1. Go to **Products** tab
2. Verify both products show:
   - ✅ `logyourbody_monthly` with Stripe price `price_1RY9Y2RCO021kiwC8ltF2cFA`
   - ✅ `logyourbody_annual` with Stripe price `price_1RY9YJRCO021kiwCBzaxnVEU`

### Test Offering:

1. Go to **Offerings** tab
2. Verify "default" offering contains both packages
3. Ensure it's marked as "Current"

## Step 9: Webhook Configuration (Optional but Recommended)

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Use RevenueCat's webhook URL:
   ```
   https://api.revenuecat.com/v1/subscribers/webhooks/stripe
   ```
4. Select events:
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## Step 10: Test Integration in Your App

1. Start your development server: `npm run dev`
2. Navigate to the app and trigger the paywall
3. Test purchasing both monthly and annual plans
4. Verify purchases appear in RevenueCat **Customers** tab

## Troubleshooting

### Common Issues:

- **Products not syncing**: Check Stripe API keys are correct
- **Payment fails**: Verify webhook configuration
- **No offerings returned**: Ensure offering is marked as "Current"

### Debug Steps:

1. Check RevenueCat logs in **Customer** tab
2. Verify Stripe webhook deliveries
3. Test with Stripe test cards in sandbox mode

## Configuration Summary

Your RevenueCat should now be configured with:

- ✅ **Stripe Integration**: Connected with API keys
- ✅ **Products**:
  - Monthly ($9.99) → `price_1RY9Y2RCO021kiwC8ltF2cFA`
  - Annual ($69.99) → `price_1RY9YJRCO021kiwCBzaxnVEU`
- ✅ **Entitlements**: `pro_features`
- ✅ **Offering**: `default` with monthly and annual packages
- ✅ **App**: Web platform configured
- ✅ **API Keys**: Public key ready for your app

The integration is complete and ready for testing!
