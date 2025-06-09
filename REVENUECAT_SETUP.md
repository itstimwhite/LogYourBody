# RevenueCat Setup Instructions

## 1. Create RevenueCat Account

1. Go to [revenuecat.com](https://www.revenuecat.com)
2. Sign up for a free account
3. Create a new project: "LogYourBody"

## 2. Configure App in RevenueCat Dashboard

### Add Your App
1. In RevenueCat dashboard, click "Add App"
2. Select "Web" platform
3. App name: "LogYourBody"
4. Bundle ID: "com.logyourbody.app" (or your chosen bundle ID)

### Get API Key
1. Go to Project Settings > API Keys
2. Copy the "Public Key" for Web platform
3. Add to your environment variables as `VITE_REVENUECAT_PUBLIC_KEY`

## 3. Connect Stripe Products to RevenueCat

### Pre-created Stripe Products:
The following products have already been created in Stripe and are ready to connect to RevenueCat:

1. **Monthly Subscription**
   - Stripe Product ID: `prod_ST5iisIAa5WOlT`
   - Stripe Price ID: `price_1RY9Y2RCO021kiwC8ltF2cFA`
   - Price: $9.99/month

2. **Annual Subscription**
   - Stripe Product ID: `prod_ST5jCsCdmToZ1d`
   - Stripe Price ID: `price_1RY9YJRCO021kiwCBzaxnVEU`
   - Price: $69.99/year

### Connect Stripe to RevenueCat:
1. Go to RevenueCat Dashboard > Project Settings > Integrations
2. Click "Connect" next to Stripe
3. Add your Stripe API keys (from Stripe Dashboard > Developers > API Keys)
4. Test the connection

### Create Products in RevenueCat:
1. Go to Products tab in RevenueCat
2. Click "Add Product"
3. **For Monthly Plan:**
   - Product ID: `logyourbody_monthly`
   - Type: Auto-renewable subscription
   - Connect to Stripe Price: `price_1RY9Y2RCO021kiwC8ltF2cFA`
   - Enable for Web platform

4. **For Annual Plan:**
   - Product ID: `logyourbody_annual`
   - Type: Auto-renewable subscription
   - Connect to Stripe Price: `price_1RY9YJRCO021kiwCBzaxnVEU`
   - Enable for Web platform

## 4. Create Entitlements

### Pro Features Entitlement
1. Go to Entitlements tab
2. Click "Add Entitlement"
3. Identifier: `pro_features`
4. Display name: "Pro Features"
5. Attach both products (monthly and annual)

## 5. Create Offerings

### Default Offering
1. Go to Offerings tab
2. Click "Add Offering"
3. Identifier: `default`
4. Display name: "LogYourBody Pro"
5. Add packages:
   - **Monthly Package**: `monthly` → `logyourbody_monthly`
   - **Annual Package**: `annual` → `logyourbody_annual`

## 6. Configure Environment Variables

Add to your `.env` file:
```env
VITE_REVENUECAT_PUBLIC_KEY=your_public_key_here
```

## 7. Test the Integration

1. Start your development server: `npm run dev`
2. Trigger the paywall (after trial expires)
3. Test both monthly and annual purchase flows
4. Verify purchases appear in RevenueCat dashboard

## 8. Production Setup

### For Web App Deployment:
1. Add production domain to RevenueCat dashboard
2. Configure webhook endpoints for purchase events
3. Set up server-side receipt validation
4. Add production environment variables

### Webhook Configuration:
- URL: `https://yourdomain.com/api/revenuecat-webhook`
- Events: Purchase, Cancellation, Renewal
- Secret: Generate and store securely

## 9. App Store Connect / Google Play Console

### For Mobile App (Future):
1. Create products in App Store Connect (iOS)
2. Create products in Google Play Console (Android)
3. Match product IDs with RevenueCat configuration
4. Submit for review and approval

### Product Configuration:
- **iOS**: In-App Purchase → Auto-Renewable Subscriptions
- **Android**: Google Play Billing → Subscriptions

## 10. Features Included

✅ **Current Implementation:**
- Web-based subscription payments
- Monthly and annual plans
- Trial period support
- Purchase restoration
- Subscription status checking
- Automatic paywall integration

🚧 **Future Enhancements:**
- Mobile app integration (iOS/Android)
- Promotional offers and discounts
- Subscription management portal
- Analytics and revenue tracking
- Custom webhook handling

## 11. Testing

### Test Mode:
- RevenueCat provides sandbox environment
- Use test payment methods
- Verify purchase flows without actual charges

### Production Testing:
- Use real payment methods with small amounts
- Test subscription lifecycle (purchase → renewal → cancellation)
- Verify webhook delivery and processing

## 12. Pricing Strategy

### Current Pricing:
- **Monthly**: $9.99/month = $119.88/year
- **Annual**: $69.99/year (42% savings)
- **Free Trial**: 3 days (configured in app logic)

### Revenue Optimization:
- A/B testing different price points
- Promotional offers for new users
- Win-back campaigns for cancelled users
- Analytics on conversion rates

## 13. Support & Documentation

- [RevenueCat Documentation](https://docs.revenuecat.com)
- [Web SDK Guide](https://docs.revenuecat.com/docs/web)
- [Testing Guide](https://docs.revenuecat.com/docs/testing)
- [Webhook Documentation](https://docs.revenuecat.com/docs/webhooks)

## 14. Next Steps

1. Set up webhook handling for subscription events
2. Implement subscription management in user settings
3. Add analytics tracking for conversion metrics
4. Configure promotional offers and discounts
5. Set up automated dunning management
6. Implement subscription pause/resume functionality