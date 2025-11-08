# SafeHouse Frontend - Complete Structure

This document shows the complete file structure created for the SafeHouse frontend.

## 📁 Directory Tree

```
NatHacks2025-SafeHouse-1/
├── FRONTEND_OVERVIEW.md          # High-level overview for team collaboration
├── FRONTEND_SETUP.md              # Quick setup and installation guide
├── FRONTEND_STRUCTURE.md          # This file - complete structure reference
│
├── frontend/
│   ├── README.md                  # Main frontend documentation
│   │
│   ├── shared/                    # Shared code between mobile and web
│   │   ├── package.json
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript type definitions
│   │   ├── constants/
│   │   │   └── index.ts          # Shared constants and config
│   │   └── utils/                 # Shared utilities (empty, ready for use)
│   │
│   ├── mobile/                    # React Native + Expo mobile app
│   │   ├── README.md              # Mobile app documentation
│   │   ├── package.json
│   │   ├── app.json               # Expo configuration
│   │   ├── App.tsx                # Main app entry point
│   │   ├── .env.example           # Environment variables template
│   │   │
│   │   └── src/
│   │       ├── screens/           # Screen components
│   │       │   ├── LoginScreen.tsx
│   │       │   ├── HomeScreen.tsx
│   │       │   ├── AlertScreen.tsx
│   │       │   ├── AlertDetailScreen.tsx
│   │       │   ├── ProfileScreen.tsx
│   │       │   └── PairingScreen.tsx
│   │       │
│   │       ├── components/        # Reusable UI components (empty, ready for use)
│   │       │
│   │       ├── navigation/        # Navigation setup
│   │       │   └── AppNavigator.tsx
│   │       │
│   │       ├── services/          # External services
│   │       │   ├── api.service.ts     # Backend API calls
│   │       │   └── health.service.ts  # HealthKit integration
│   │       │
│   │       ├── contexts/          # React Context for state management
│   │       │   ├── AuthContext.tsx
│   │       │   └── AlertContext.tsx
│   │       │
│   │       ├── hooks/             # Custom React hooks (empty, ready for use)
│   │       │
│   │       └── config/            # App configuration
│   │           └── api.ts         # API client setup
│   │
│   └── web/                       # Next.js web dashboard
│       ├── README.md              # Web dashboard documentation
│       ├── package.json
│       ├── next.config.ts         # Next.js configuration
│       ├── tailwind.config.js     # Tailwind CSS configuration
│       ├── tsconfig.json          # TypeScript configuration
│       ├── .env.example           # Environment variables template
│       │
│       ├── app/                   # Next.js App Router
│       │   ├── page.tsx           # Home page
│       │   ├── layout.tsx         # Root layout
│       │   ├── globals.css        # Global styles
│       │   │
│       │   ├── dashboard/         # Dashboard section
│       │   │   └── page.tsx
│       │   │
│       │   └── alerts/            # Alerts section
│       │       ├── page.tsx       # Alert list
│       │       └── [id]/
│       │           └── page.tsx   # Alert detail (dynamic route)
│       │
│       ├── components/            # React components
│       │   ├── dashboard/
│       │   │   ├── StatusCard.tsx
│       │   │   ├── DeviceStatus.tsx
│       │   │   └── VitalSnapshot.tsx
│       │   └── alerts/
│       │       ├── AlertList.tsx
│       │       └── AlertTimeline.tsx
│       │
│       ├── hooks/                 # Custom React hooks
│       │   ├── useDashboard.ts
│       │   └── useAlerts.ts
│       │
│       └── lib/                   # Utilities and libraries
│           └── api/
│               └── client.ts      # API client
│
└── backend/                       # Backend (NOT IMPLEMENTED - out of scope)
    └── test.txt
```

## 📊 Statistics

### Mobile App
- **6 Screens**: Login, Home, Alert, AlertDetail, Profile, Pairing
- **2 Services**: API service, Health service
- **2 Contexts**: Auth, Alert
- **1 Navigator**: Stack + Tab navigation
- **Lines of Code**: ~1,500+

### Web Dashboard
- **4 Pages**: Home, Dashboard, Alerts, AlertDetail
- **5 Components**: StatusCard, DeviceStatus, VitalSnapshot, AlertList, AlertTimeline
- **2 Hooks**: useDashboard, useAlerts
- **1 API Client**: Typed API methods
- **Lines of Code**: ~1,200+

### Shared
- **50+ Types**: Complete type definitions
- **30+ Constants**: Configuration and styling
- **Lines of Code**: ~400+

## 🎯 Key Files Reference

### Essential Files to Know

#### Mobile App

| File | Purpose | Priority |
|------|---------|----------|
| `App.tsx` | App entry point, providers | 🔴 Critical |
| `src/navigation/AppNavigator.tsx` | Navigation structure | 🔴 Critical |
| `src/screens/HomeScreen.tsx` | Main dashboard screen | 🟢 High |
| `src/screens/AlertScreen.tsx` | Alert list | 🟢 High |
| `src/services/api.service.ts` | Backend communication | 🔴 Critical |
| `src/contexts/AuthContext.tsx` | Authentication state | 🔴 Critical |
| `src/contexts/AlertContext.tsx` | Alert state | 🟢 High |

#### Web Dashboard

| File | Purpose | Priority |
|------|---------|----------|
| `app/layout.tsx` | Root layout | 🔴 Critical |
| `app/dashboard/page.tsx` | Main dashboard | 🟢 High |
| `app/alerts/page.tsx` | Alert list | 🟢 High |
| `lib/api/client.ts` | Backend communication | 🔴 Critical |
| `hooks/useDashboard.ts` | Dashboard data hook | 🟢 High |
| `hooks/useAlerts.ts` | Alert data hook | 🟢 High |

#### Shared

| File | Purpose | Priority |
|------|---------|----------|
| `shared/types/index.ts` | All type definitions | 🔴 Critical |
| `shared/constants/index.ts` | Configuration | 🟢 High |

## 🔗 Dependencies

### Mobile App (`mobile/package.json`)

**Core:**
- `react-native` - UI framework
- `expo` - Development platform
- `typescript` - Type safety

**Navigation:**
- `@react-navigation/native`
- `@react-navigation/stack`
- `@react-navigation/bottom-tabs`

**Features:**
- `expo-notifications` - Push notifications
- `react-native-health` - HealthKit integration
- `@react-native-async-storage/async-storage` - Local storage
- `axios` - HTTP client

### Web Dashboard (`web/package.json`)

**Core:**
- `next` - React framework
- `react` - UI library
- `typescript` - Type safety

**Styling:**
- `tailwindcss` - Utility-first CSS
- `@tailwindcss/postcss` - PostCSS integration

**Tools:**
- `eslint` - Code linting
- `eslint-config-next` - Next.js ESLint config

## 🎨 Design System

### Colors (Consistent across both apps)

```typescript
// Risk Levels
normal:  #10B981  (green)
warning: #F59E0B  (amber)
danger:  #EF4444  (red)

// Status
open:         #EF4444  (red)
closed:       #6B7280  (gray)
acknowledged: #10B981  (green)

// UI
primary:    #EF4444  (red)
background: #F9FAFB  (light gray)
card:       #FFFFFF  (white)
text:       #111827  (dark gray)
textLight:  #6B7280  (gray)
```

### Typography

**Mobile:**
- Header: 28-32px, bold
- Title: 18-24px, semibold
- Body: 14-16px, regular
- Caption: 12px, regular

**Web:**
- H1: 48px, bold
- H2: 36px, bold
- H3: 24px, semibold
- Body: 16px, regular
- Small: 14px, regular

## 📡 API Endpoints Used

Both apps communicate with these backend endpoints:

```
Authentication:
POST   /api/auth/login

Alerts:
GET    /api/alerts/active
GET    /api/alerts/:id
POST   /api/alerts/:id/ack

Dashboard:
GET    /api/elders/:id/dashboard

Vitals:
POST   /api/commands/vitalsCallback
POST   /api/commands/requestVitals

Contacts:
GET    /api/elders/:id/contacts
POST   /api/elders/:id/contacts

Devices:
GET    /api/devices/:id/health
POST   /api/devices/pair
```

## 🔄 Data Flow

### Mobile App Flow

```
User Action
    ↓
Screen Component
    ↓
Context/Hook
    ↓
API Service
    ↓
Backend API
    ↓
API Response
    ↓
Context Updates
    ↓
UI Re-renders
```

### Web Dashboard Flow

```
Page Load
    ↓
Custom Hook (useDashboard/useAlerts)
    ↓
API Client
    ↓
Backend API
    ↓
API Response
    ↓
Hook Updates State
    ↓
Component Re-renders
    ↓
Auto-refresh (polling)
```

## 🧩 Component Relationships

### Mobile Navigation Structure

```
AppNavigator
├── Login (not authenticated)
├── Pairing (not authenticated)
└── Main (authenticated)
    ├── HomeScreen (Tab)
    ├── AlertScreen (Tab)
    ├── ProfileScreen (Tab)
    └── AlertDetailScreen (Modal/Stack)
```

### Web Page Hierarchy

```
Root Layout (app/layout.tsx)
├── Home (/)
├── Dashboard (/dashboard)
├── Alerts (/alerts)
└── Alert Detail (/alerts/[id])
```

## 📝 Type System

Key shared types used throughout:

```typescript
User           - User accounts
ElderProfile   - Elder-specific data
Alert          - Alert with status and steps
AlertStep      - Individual escalation step
Telemetry      - Sensor readings
VitalSnapshot  - Health data
Contact        - Emergency contact
SensorDevice   - Hardware sensor info
DashboardData  - Combined dashboard data
```

## 🔐 Authentication Flow

### Mobile
1. Enter phone number
2. Receive SMS code
3. Submit code
4. Get JWT token
5. Store in AsyncStorage
6. Attach to all requests

### Web
(To be implemented - currently uses direct API calls)

## 🚀 Build Process

### Mobile Development
```
npm start → Expo DevTools → Metro Bundler → Device/Simulator
```

### Mobile Production
```
eas build → Cloud Build → IPA/APK → App Store/Play Store
```

### Web Development
```
npm run dev → Next.js Dev Server → Hot Reload → Browser
```

### Web Production
```
npm run build → Static Site Generation → Deploy → CDN
```

## 📦 What's NOT Included (Out of Scope)

The following were explicitly excluded as requested:

- ❌ Backend implementation
- ❌ Database setup
- ❌ API implementation
- ❌ Authentication server
- ❌ Telephony system
- ❌ Notification service
- ❌ Hardware/firmware code
- ❌ Testing suite
- ❌ CI/CD configuration
- ❌ Docker setup

## ✅ What IS Included

- ✅ Complete mobile app structure
- ✅ Complete web dashboard structure
- ✅ Shared type system
- ✅ Navigation setup
- ✅ API service stubs
- ✅ State management
- ✅ UI components
- ✅ Styling system
- ✅ Documentation
- ✅ Setup guides

## 🎓 Learning Resources

### Mobile Development
- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)

### Web Development
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

## 📞 Quick Command Reference

```bash
# Mobile
cd frontend/mobile
npm install        # Install dependencies
npm start         # Start dev server
npm run ios       # Run iOS
npm run android   # Run Android

# Web
cd frontend/web
npm install        # Install dependencies
npm run dev       # Start dev server
npm run build     # Build for production
npm start         # Run production build

# Both
npx tsc --noEmit  # Type check
```

## 🎯 Next Steps

1. ✅ Read `FRONTEND_SETUP.md` for installation
2. ✅ Read `FRONTEND_OVERVIEW.md` for collaboration strategy
3. ✅ Review `frontend/README.md` for detailed docs
4. ✅ Start development!

---

**This structure provides a solid foundation for building the complete SafeHouse application. Good luck! 🚀**

