# SafeHouse Mobile App

React Native + Expo mobile application for heat safety monitoring.

## Overview

The SafeHouse mobile app allows elders and caregivers to:
- Monitor real-time temperature and humidity
- Receive and acknowledge heat-related alerts
- Share health data from Apple Health during emergencies
- Manage emergency contacts
- Pair caregivers with elders

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- For iOS: Mac with Xcode 14+
- For Android: Android Studio with Android SDK

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_ENV=development
```

**Note:** For physical devices, replace `localhost` with your computer's IP address.

## Running the App

```bash
# Start Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser (limited functionality)
npm run web
```

## Project Structure

```
mobile/
├── src/
│   ├── screens/          # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── AlertScreen.tsx
│   │   ├── AlertDetailScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── PairingScreen.tsx
│   │
│   ├── components/       # Reusable components (to be added)
│   │
│   ├── navigation/       # Navigation configuration
│   │   └── AppNavigator.tsx
│   │
│   ├── services/         # External services
│   │   ├── api.service.ts        # Backend API calls
│   │   └── health.service.ts     # HealthKit integration
│   │
│   ├── contexts/         # React Context for state
│   │   ├── AuthContext.tsx       # Authentication state
│   │   └── AlertContext.tsx      # Alert state
│   │
│   ├── hooks/            # Custom React hooks
│   │
│   └── config/           # Configuration
│       └── api.ts                # API client setup
│
├── App.tsx               # Main app entry point
├── app.json              # Expo configuration
└── package.json
```

## Screens

### Login Screen
- Phone number authentication
- SMS code verification
- Handles login state via AuthContext

### Home Screen
- Real-time temperature, humidity, heat index display
- Active alert banner with "I'm OK" button
- Device connection status
- HealthKit integration status
- Pull to refresh

### Alert Screen
- List of all alerts (active and historical)
- Visual risk level indicators
- Quick navigation to alert details
- Auto-refresh every 5 seconds

### Alert Detail Screen
- Complete alert timeline
- All escalation steps with timestamps
- Action results (call answered, no answer, etc.)
- Acknowledgment button for active alerts

### Profile Screen
- User account information
- HealthKit authorization controls
- Notification settings
- Emergency contacts (caregiver role)
- Logout

### Pairing Screen
- For caregivers to pair with elder accounts
- Invite code entry
- Instructions for obtaining codes

## Key Features

### Authentication
Uses token-based authentication stored in AsyncStorage:
- Phone number + SMS code login
- Token automatically attached to API requests
- Auto-logout on 401 responses

### Alert Monitoring
AlertContext provides:
- Real-time active alerts
- Auto-refresh every 5 seconds
- Alert acknowledgment function
- Background update capability

### HealthKit Integration
HealthService provides:
- Authorization request flow
- Heart rate (last 5 minutes)
- Heart rate variability
- Step count (last 5 minutes)
- Fall detection status
- On-demand vital snapshot generation

**Important:** HealthKit only works on physical iOS devices with the proper entitlements.

### Push Notifications
Configured for Expo push notifications:
- Permissions requested on app launch
- Push token obtained and ready to send to backend
- Notification handler configured
- Badge, sound, and alert support

## API Service

The app communicates with the backend via `apiService`:

```typescript
import { apiService } from './services/api.service';

// Get active alerts
const response = await apiService.getActiveAlerts();

// Acknowledge an alert
await apiService.acknowledgeAlert(alertId);

// Submit health vitals
await apiService.submitVitals(elderId, vitalsData);
```

See `src/services/api.service.ts` for all available methods.

## Health Service

Access HealthKit data via `healthService`:

```typescript
import { healthService } from './services/health.service';

// Initialize HealthKit
await healthService.initialize();

// Get recent heart rate
const hr = await healthService.getRecentHeartRate();

// Get comprehensive snapshot
const vitals = await healthService.getVitalSnapshot(elderId);
```

## Styling

The app uses React Native StyleSheet with a consistent design:

**Colors:**
- Primary: `#EF4444` (red)
- Background: `#F9FAFB`
- Card Background: `#FFFFFF`
- Text Primary: `#111827`
- Text Secondary: `#6B7280`

**Components:**
- Cards: white background, rounded-lg, shadow
- Buttons: primary red, rounded-lg
- Status badges: colored background with white text

## Navigation

Uses React Navigation v6:
- Stack Navigator for main flow
- Bottom Tab Navigator for authenticated users
- Type-safe navigation with TypeScript

```typescript
// Navigate to screen
navigation.navigate('AlertDetail', { alertId: '123' });

// Go back
navigation.goBack();
```

## State Management

### AuthContext
Provides authentication state:
```typescript
const { user, isAuthenticated, login, logout } = useAuth();
```

### AlertContext
Provides alert state:
```typescript
const { activeAlerts, refreshAlerts, acknowledgeAlert } = useAlerts();
```

## iOS-Specific Setup

### HealthKit Entitlements

Required in `app.json`:
```json
{
  "ios": {
    "bundleIdentifier": "com.safehouse.mobile",
    "infoPlist": {
      "NSHealthShareUsageDescription": "This app needs access to your health data to monitor your wellbeing during heat alerts.",
      "NSHealthUpdateUsageDescription": "This app needs to update your health data."
    },
    "entitlements": {
      "com.apple.developer.healthkit": true,
      "com.apple.developer.healthkit.access": []
    }
  }
}
```

### Testing HealthKit
1. Must use a physical iOS device
2. Ensure Health app has sample data
3. Grant permissions when prompted
4. Check Health app > Sources to verify permissions

## Android-Specific Setup

### Permissions

Permissions are automatically added via `app.json`:
```json
{
  "android": {
    "package": "com.safehouse.mobile",
    "permissions": [
      "android.permission.RECEIVE_BOOT_COMPLETED",
      "android.permission.VIBRATE"
    ]
  }
}
```

## Building for Production

### Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Local Build

```bash
# iOS (requires Mac)
npm run ios --configuration Release

# Android
npm run android --variant=release
```

## Troubleshooting

### HealthKit Not Working
- ✅ Using physical device (not simulator)
- ✅ HealthKit entitlements in app.json
- ✅ Health app has sample data
- ✅ Permissions granted in Settings > Health

### API Connection Failed
- Check `EXPO_PUBLIC_API_URL` in `.env`
- iOS Simulator: `http://localhost:3000`
- Android Emulator: `http://10.0.2.2:3000`
- Physical Device: Use your computer's IP address

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm start -- --clear
```

### Build Errors
```bash
# Clear all caches
npm start -- --clear
expo r -c
npx expo prebuild --clean
```

## Testing

```bash
# Type checking
npx tsc --noEmit

# Run tests (when added)
npm test
```

## Performance Optimization

The app implements:
- Polling intervals (configurable in shared/constants)
- AsyncStorage for offline data
- Optimistic UI updates
- Background task management

## Security

- Auth tokens stored securely in AsyncStorage
- API requests use HTTPS (production)
- Sensitive health data only sent during active alerts
- Proper permission handling for HealthKit

## Known Limitations

- HealthKit only available on iOS
- Background location not implemented
- Offline mode limited

## Future Enhancements

- [ ] Biometric authentication (Face ID / Touch ID)
- [ ] Voice acknowledgment via speech recognition
- [ ] Offline alert queue
- [ ] Enhanced vital trend visualization
- [ ] Direct caregiver calling from app
- [ ] Multi-language support

## Contributing

When adding new screens or features:
1. Create screen component in `src/screens/`
2. Add to navigation in `src/navigation/AppNavigator.tsx`
3. Update TypeScript navigation types
4. Follow existing styling patterns
5. Use shared types from `/shared/types`

## Support

For issues:
- Check main project README
- Review backend API documentation
- Ensure backend is running and accessible

## License

See main project LICENSE file.

