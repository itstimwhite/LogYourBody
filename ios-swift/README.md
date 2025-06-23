# LogYourBody iOS App

Native iOS app for LogYourBody built with Swift and SwiftUI.

## Architecture

- **Frontend**: SwiftUI for native iOS UI
- **Backend**: Next.js API hosted on Vercel
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: RevenueCat (Apple In-App Purchases)
- **Storage**: Supabase Storage

## Features

### Core Features (Shared with Web)
- User authentication
- Body metrics tracking
- DEXA scan import
- Progress photos
- Dashboard with trends
- Goal setting

### iOS-Exclusive Features
- HealthKit integration
- Apple Watch companion app
- Widget support
- Live Activities
- Push notifications
- Face ID/Touch ID
- Shortcuts integration
- Offline support with sync

## Setup

1. Open `LogYourBody.xcodeproj` in Xcode
2. Update bundle identifier and team
3. Add your RevenueCat API keys
4. Configure Supabase credentials
5. Build and run

## API Integration

The app communicates with the Next.js backend hosted on Vercel:

- Base URL: `https://logyourbody.vercel.app/api`
- Authentication: Supabase JWT tokens
- All API calls use the existing Next.js endpoints

## RevenueCat Setup

1. Configure products in App Store Connect
2. Add RevenueCat SDK
3. Initialize with iOS-specific API key
4. Handle purchase flows with Apple's payment system