# iOS App Setup with Capacitor

This document explains how to set up and run the LogYourBody iOS app using Capacitor.

## Prerequisites

1. **macOS** - Required for iOS development
2. **Xcode** - Install from the Mac App Store
3. **Xcode Command Line Tools** - Run: `xcode-select --install`
4. **iOS Simulator** - Included with Xcode
5. **Apple Developer Account** - For device testing and App Store distribution

## Project Structure

```
ios/
├── App/
│   ├── App.xcodeproj/          # Xcode project file
│   ├── App.xcworkspace/        # Xcode workspace (use this to open)
│   ├── App/                    # iOS app source code
│   │   ├── public/             # Web assets copied from dist/
│   │   ├── Info.plist          # iOS app configuration
│   │   └── Assets.xcassets/    # App icons and splash screens
│   └── Podfile                 # CocoaPods dependencies
```

## Development Workflow

### 1. Build and Copy Web Assets

```bash
# Build the web app and copy to iOS
npm run ios:build

# Or run individually:
npm run build
npx cap copy ios
```

### 2. Open in Xcode

```bash
# Opens the iOS project in Xcode
npm run ios:open

# Or manually:
npx cap open ios
```

### 3. Run in Simulator

1. Open the project in Xcode using `App.xcworkspace` (not .xcodeproj)
2. Select a simulator device (iPhone 15, iPad, etc.)
3. Click the "Run" button or press Cmd+R

### 4. Run on Physical Device

1. Connect your iOS device via USB
2. Select your device in Xcode
3. Ensure you have a valid Apple Developer account
4. Click "Run" to install and launch the app

## Configuration

### App Configuration

The app is configured in `capacitor.config.ts`:

- **App ID**: `com.logyourbody.app`
- **App Name**: `LogYourBody`
- **Scheme**: `LogYourBody`

### iOS-Specific Settings

- **Background Color**: Black (`#000000`)
- **Status Bar**: Dark style
- **Splash Screen**: 2-second duration with LogYourBody branding

## Available Scripts

```bash
# Build web app and copy to iOS
npm run ios:build

# Open iOS project in Xcode
npm run ios:open

# Build and open in one command
npm run ios:run
```

## Native Features

The app includes these Capacitor plugins:

- **StatusBar**: Control status bar appearance
- **SplashScreen**: Native splash screen management
- **HealthKit**: Read/write health data (height, weight, body composition)
- **Core**: Basic device and platform APIs

### HealthKit Integration

The app automatically prompts users to connect Apple Health on iOS:

- **Auto-fill Profile**: Height, weight, and birthday from Health app
- **Weight History Sync**: Import existing weight data from Health app
- **Bi-directional Sync**: Write body composition data back to Health app
- **Privacy Protected**: Users control what data is shared

## Development vs Production

### Development Mode

- Connects to `http://localhost:8080` when dev server is running
- Allows live reload during development
- Use `npm run dev` + `npm run ios:open`

### Production Mode

- Uses built assets from `dist/` folder
- Optimized and bundled code
- Use `npm run ios:build` before opening Xcode

## Troubleshooting

### Common Issues

1. **"xcode-select: error: tool 'xcodebuild' requires Xcode"**

   - Install Xcode from Mac App Store
   - Run: `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`

2. **Pod install failures**

   - Run: `cd ios/App && pod install --repo-update`
   - Ensure you have the latest CocoaPods: `sudo gem install cocoapods`

3. **Web assets not updating**

   - Run: `npm run build && npx cap copy ios`
   - Clean build in Xcode: Product → Clean Build Folder

4. **App not loading properly**
   - Check the Safari Web Inspector while app is running
   - Verify `capacitor.config.ts` server settings

### Debugging

1. **Web Inspector**: Safari → Develop → [Device] → LogYourBody
2. **Console Logs**: View in Xcode console while app is running
3. **Network Issues**: Check if development server is running on localhost:8080

## App Store Deployment

1. **Archive the app**: Product → Archive in Xcode
2. **Upload to App Store Connect**: Use Xcode Organizer
3. **Configure App Store listing**: In App Store Connect dashboard
4. **Submit for review**: Follow Apple's review process

## Next Steps

1. **Add App Icons**: Replace default icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
2. **Customize Splash Screen**: Update images in `ios/App/App/Assets.xcassets/Splash.imageset/`
3. **Configure App Permissions**: Update `Info.plist` for camera, notifications, etc.
4. **Add Push Notifications**: Install `@capacitor/push-notifications` plugin
5. **App Store Optimization**: Add screenshots, descriptions, and metadata
