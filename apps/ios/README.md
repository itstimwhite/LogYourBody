# LogYourBody iOS App

Native iOS app for LogYourBody that connects to the Next.js backend.

## Setup Instructions

1. Open Xcode
2. Create a new project:
   - Choose iOS → App
   - Product Name: `LogYourBody`
   - Team: Select your development team
   - Organization Identifier: `com.logyourbody`
   - Interface: SwiftUI
   - Language: Swift
   - Use Core Data: No
   - Include Tests: Yes

3. Save the project in the `ios-native` directory

4. Copy all the Swift files from this directory structure into the Xcode project

5. Update the backend URL in `Services/AuthManager.swift` to point to your production/staging server

## Architecture

- **SwiftUI**: Modern declarative UI framework
- **Async/Await**: For network calls
- **URLSession**: For API communication with Next.js backend
- **UserDefaults**: For storing auth tokens

## Features

- User authentication
- Weight logging
- Dashboard with statistics
- Progress photos (coming soon)
- Settings and profile management

## API Integration

The app communicates with the Next.js backend through REST APIs. Make sure to implement the following endpoints in your Next.js app:

- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify auth token
- `GET /api/weights` - Get user's weight entries
- `POST /api/weights` - Log new weight entry

## Development

1. Update `baseURL` in `AuthManager.swift` for your environment
2. Add any required API keys or configuration
3. Test on both simulator and real devices

## CI/CD

- Automated tests run on every push
- TestFlight deployment triggered on preview branch
- App Store release managed through GitHub Actions

Last updated: 2025-07-16 - Testing new App Store Connect API authentication