# SafeHaven Mobile App

A React Native Expo mobile application implementing the SafeHaven design for elderly safety monitoring.

## Features

- **Landing Screen**: Mode selection (Guardian/Resident)
- **Connection Screen**: Secure code-based pairing between guardians and residents
- **Resident Dashboard**: Real-time vital signs monitoring with emergency button
- **Guardian Dashboard**: Multi-resident monitoring with alerts and trends
- **Emergency Flow**: Automated emergency response system
- **Trend Analytics**: 7-day health trend visualization

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Emulator

### Installation

```bash
cd frontend
npm install
```

### Running the App

```bash
# Start the Expo development server
npm start

# Or run on specific platform
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web browser
```

Scan the QR code with the Expo Go app on your phone, or press `i` for iOS simulator or `a` for Android emulator.

## Project Structure

```
frontend/
├── App.tsx                    # Main app entry point
├── app.json                   # Expo configuration
├── package.json
├── components/
│   ├── LandingScreen.tsx
│   ├── ConnectionScreen.tsx
│   ├── ResidentDashboard.tsx
│   ├── GuardianDashboard.tsx
│   ├── GuardianTrends.tsx
│   └── EmergencyFlow.tsx
└── lib/
    └── api.ts                 # API client
```

## API Integration

The app connects to the backend API at `http://localhost:8000/api` by default. Update the API URL in `lib/api.ts` or use environment variables.

## Design

The UI matches the Figma design with:
- Modern, clean interface
- Blue gradient backgrounds
- Responsive card-based layouts
- Smooth animations
- Accessible color schemes

## Technologies

- **Expo**: React Native framework
- **React Native**: Mobile UI framework
- **TypeScript**: Type safety
- **React Native Chart Kit**: Data visualization
- **Expo Vector Icons**: Icon library
- **Expo Linear Gradient**: Gradient backgrounds

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure your project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## License

MIT
