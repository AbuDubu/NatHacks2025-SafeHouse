# SafeHouse Frontend

Frontend applications for the SafeHouse heat safety monitoring system.

## Structure

This directory contains two frontend applications:

### 📱 Mobile App (`/mobile`)
React Native + Expo application for elders and caregivers.

**Features:**
- Real-time temperature and humidity monitoring
- Active alert notifications and acknowledgment
- Health data integration (HealthKit on iOS)
- Caregiver pairing via invite codes
- Push notifications for alerts

**Tech Stack:**
- React Native
- Expo
- TypeScript
- React Navigation
- HealthKit integration

### 🖥️ Web Dashboard (`/web`)
Next.js web application for caregivers and administrators.

**Features:**
- Real-time monitoring dashboard
- Alert timeline and history
- Device status monitoring
- Contact management (planned)
- Alert acknowledgment and management

**Tech Stack:**
- Next.js 15 (App Router)
- React
- TypeScript
- Tailwind CSS

### 📦 Shared (`/shared`)
Shared TypeScript types, constants, and utilities used across both applications.

## Quick Start

### Mobile App Setup

```bash
cd mobile
npm install

# For iOS (requires Mac + Xcode)
npm run ios

# For Android (requires Android Studio)
npm run android

# For web preview
npm run web
```

### Web Dashboard Setup

```bash
cd web
npm install
npm run dev
```

The dashboard will be available at http://localhost:3000

## Environment Configuration

### Mobile App
Create a `.env` file in `/mobile`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_ENV=development
```

### Web Dashboard
Create a `.env.local` file in `/web`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NODE_ENV=development
```

## Project Structure

```
frontend/
├── mobile/                    # React Native mobile app
│   ├── src/
│   │   ├── screens/          # Screen components
│   │   ├── components/       # Reusable UI components
│   │   ├── navigation/       # Navigation setup
│   │   ├── services/         # API and health services
│   │   ├── contexts/         # React contexts for state
│   │   ├── hooks/            # Custom React hooks
│   │   └── config/           # App configuration
│   ├── App.tsx               # Main app entry point
│   ├── app.json              # Expo configuration
│   └── package.json
│
├── web/                      # Next.js web dashboard
│   ├── app/                  # Next.js App Router pages
│   │   ├── dashboard/        # Dashboard page
│   │   ├── alerts/           # Alerts pages
│   │   └── page.tsx          # Home page
│   ├── components/           # React components
│   │   ├── dashboard/        # Dashboard components
│   │   └── alerts/           # Alert components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and API client
│   └── package.json
│
└── shared/                   # Shared code
    ├── types/                # TypeScript type definitions
    ├── constants/            # Shared constants
    └── utils/                # Shared utilities
```

## Mobile App Screens

### 1. Login Screen
- Phone number authentication
- SMS verification code input

### 2. Home Screen
- Current temperature, humidity, heat index
- Active alert banner with "I'm OK" button
- Device status
- Health data integration status

### 3. Alert Screen
- List of all alerts (active and historical)
- Risk level indicators
- Navigation to detailed alert view

### 4. Alert Detail Screen
- Complete alert timeline
- All escalation steps with timestamps
- Acknowledgment option

### 5. Profile Screen
- User account information
- HealthKit settings
- Notification preferences
- Emergency contacts management
- Logout

### 6. Pairing Screen
- Caregiver pairing with invite code
- Instructions for generating codes

## Web Dashboard Pages

### 1. Home Page (`/`)
- Landing page with navigation
- Feature overview

### 2. Dashboard (`/dashboard`)
- Real-time status cards
- Temperature, humidity, heat index
- Device connection status
- Recent health vitals
- Active and recent alerts

### 3. Alerts List (`/alerts`)
- All alerts with filtering
- Active alerts section
- Resolved alerts history
- Quick acknowledgment

### 4. Alert Detail (`/alerts/[id]`)
- Complete alert timeline
- All escalation steps
- Resolution information
- Acknowledgment option

## Key Features

### Real-time Updates
Both apps poll for updates at configurable intervals:
- Telemetry: 30 seconds
- Alerts: 5 seconds
- Dashboard: 15 seconds

### Health Integration
Mobile app integrates with HealthKit to monitor:
- Heart rate
- Heart rate variability (HRV)
- Steps (5-minute window)
- Fall detection status

Data is only shared during active alerts.

### Alert Acknowledgment
Multiple ways to acknowledge an alert:
- Mobile: "I'm OK" button
- Web: Acknowledge button
- Phone: DTMF tone 1 during call (backend)

## API Integration

Both apps communicate with the backend API. Key endpoints used:

- `GET /api/elders/:id/dashboard` - Dashboard data
- `GET /api/alerts` - List alerts
- `GET /api/alerts/:id` - Alert details
- `POST /api/alerts/:id/ack` - Acknowledge alert
- `POST /api/commands/vitalsCallback` - Submit health vitals
- `GET /api/elders/:id/contacts` - Get contacts

## Development

### Mobile App Development

```bash
cd mobile

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Type checking
npx tsc --noEmit

# Clear cache
npm start -- --clear
```

### Web Dashboard Development

```bash
cd web

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Lint code
npm run lint
```

## Styling

### Mobile App
Uses React Native StyleSheet with inline styles. Theme colors:
- Primary: `#EF4444` (red)
- Background: `#F9FAFB` (light gray)
- Text: `#111827` (dark gray)

### Web Dashboard
Uses Tailwind CSS. Configure in `tailwind.config.js`.

## TypeScript

Both apps are fully typed with TypeScript. Shared types are in `/shared/types`.

Key types:
- `User` - User account
- `Alert` - Alert with status and steps
- `Telemetry` - Sensor readings
- `VitalSnapshot` - Health data
- `Contact` - Emergency contact

## Push Notifications (Mobile)

The mobile app is configured for Expo push notifications:

1. Requests permissions on app launch
2. Obtains push token
3. Token should be sent to backend for alert notifications

Configure in `app.json`:
```json
{
  "plugins": [
    ["expo-notifications", {
      "icon": "./assets/notification-icon.png",
      "color": "#EF4444"
    }]
  ]
}
```

## iOS HealthKit Setup

Required entitlements in `app.json`:
```json
{
  "ios": {
    "infoPlist": {
      "NSHealthShareUsageDescription": "This app needs access to your health data...",
      "NSHealthUpdateUsageDescription": "This app needs to update your health data."
    },
    "entitlements": {
      "com.apple.developer.healthkit": true
    }
  }
}
```

## Building for Production

### Mobile App

```bash
cd mobile

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

Requires Expo EAS account. Configure in `eas.json`.

### Web Dashboard

```bash
cd web

# Build static site
npm run build

# Deploy to Vercel
vercel deploy
```

## Troubleshooting

### Mobile App

**Issue: HealthKit not working**
- Ensure you're on a physical iOS device (simulator doesn't support HealthKit)
- Check entitlements in `app.json`
- Verify permissions in iOS Settings

**Issue: API connection failed**
- Check `EXPO_PUBLIC_API_URL` in `.env`
- For iOS simulator, use `http://localhost:3000`
- For Android emulator, use `http://10.0.2.2:3000`
- For physical device, use your computer's IP address

### Web Dashboard

**Issue: Type errors**
- Run `npm install` to ensure dependencies are up to date
- Check that `/shared/types` path is correct
- Clear Next.js cache: `rm -rf .next`

**Issue: Tailwind styles not working**
- Ensure `tailwind.config.js` includes all content paths
- Restart dev server after config changes

## Next Steps

### Planned Features

**Mobile:**
- [ ] Biometric authentication
- [ ] Offline mode support
- [ ] Voice acknowledgment
- [ ] Emergency contact calling from app

**Web:**
- [ ] Contact management UI
- [ ] Threshold configuration
- [ ] Alert history analytics
- [ ] Multi-elder monitoring
- [ ] User administration

### Integration Required

Both apps are frontend-only and require:
1. Backend API running (see `/backend`)
2. PostgreSQL database
3. Redis for queues
4. Twilio for telephony (or mock provider)

## Contributing

When adding new features:
1. Add types to `/shared/types/index.ts`
2. Add constants to `/shared/constants/index.ts`
3. Update both mobile and web if applicable
4. Maintain consistent styling and UX patterns

## License

See main project README.

## Support

For issues or questions:
- Check main project documentation
- Review API documentation
- Contact development team

