# SafeHouse Frontend - Project Overview

This document provides a high-level overview of the SafeHouse frontend structure for team collaboration and task splitting.

## 🎯 Project Goal

Build two frontend applications for a heat safety monitoring system:
1. **Mobile App** (React Native + Expo) - For elders and caregivers
2. **Web Dashboard** (Next.js) - For caregivers and administrators

## 📁 Current Structure

```
frontend/
├── mobile/              # React Native mobile app (DONE - BASIC OUTLINE)
├── web/                 # Next.js web dashboard (DONE - BASIC OUTLINE)
└── shared/              # Shared TypeScript types and constants (DONE)
```

## ✅ What's Been Created

### ✅ Shared Code (`/shared`)
- Complete TypeScript type definitions
- Shared constants (colors, API endpoints, intervals)
- Ready to use in both mobile and web

### ✅ Mobile App (`/mobile`)
**Structure:**
- ✅ 6 screens (Login, Home, Alert, AlertDetail, Profile, Pairing)
- ✅ Navigation setup (Stack + Tab navigators)
- ✅ API service (backend communication)
- ✅ Health service (HealthKit integration)
- ✅ Auth context (authentication state)
- ✅ Alert context (alert state management)
- ✅ Basic styling (consistent design system)

**Status:** Basic structure complete, ready for enhancement

### ✅ Web Dashboard (`/web`)
**Structure:**
- ✅ 4 pages (Home, Dashboard, Alerts, AlertDetail)
- ✅ 6 components (StatusCard, DeviceStatus, VitalSnapshot, AlertList, AlertTimeline)
- ✅ API client (typed backend calls)
- ✅ Custom hooks (useDashboard, useAlerts)
- ✅ Tailwind CSS styling

**Status:** Basic structure complete, ready for enhancement

## 🔄 How to Split Work

### Strategy 1: By Application
- **Person A**: Enhance mobile app
- **Person B**: Enhance web dashboard
- **Shared**: Coordinate on types and API contracts

### Strategy 2: By Feature
- **Person A**: Alert system (mobile screens + web pages)
- **Person B**: Dashboard/monitoring (mobile home + web dashboard)
- **Shared**: User management and settings

### Strategy 3: By Layer
- **Person A**: UI components and styling
- **Person B**: Data fetching, state management, API integration
- **Shared**: Testing and documentation

## 🎨 Mobile App - Enhancement Opportunities

### High Priority
1. **Polish existing screens**
   - Add loading states
   - Improve error handling
   - Add pull-to-refresh animations
   - Enhance visual feedback

2. **Complete HealthKit integration**
   - Test on physical device
   - Add permission flow UI
   - Handle edge cases (no data, permissions denied)

3. **Push notifications**
   - Implement notification handling
   - Deep linking to alerts
   - Notification settings

### Medium Priority
4. **Contact management**
   - Add/edit/delete contacts
   - Priority ordering
   - Contact calling integration

5. **Settings screen**
   - Notification preferences
   - Threshold customization
   - App information

6. **Onboarding flow**
   - Tutorial slides
   - Permission requests
   - Role selection

### Nice to Have
7. **Biometric authentication**
8. **Offline mode support**
9. **Voice acknowledgment**
10. **Widget support (iOS 14+)**

## 🖥️ Web Dashboard - Enhancement Opportunities

### High Priority
1. **Authentication system**
   - Login page
   - Session management
   - Role-based access control

2. **Multi-elder support**
   - Elder selection dropdown
   - Switch between multiple elders
   - Elder list page

3. **Contact management**
   - CRUD interface
   - Drag-and-drop priority ordering
   - Test call functionality

### Medium Priority
4. **Configuration pages**
   - Threshold settings
   - Escalation policy
   - Notification preferences

5. **Analytics dashboard**
   - Temperature trends (charts)
   - Alert frequency
   - Response times

6. **User administration**
   - User management
   - Role assignment
   - Audit logs

### Nice to Have
7. **Real-time WebSocket updates**
8. **Alert export (PDF/CSV)**
9. **Dark mode**
10. **Mobile responsive enhancements**

## 🔧 Technical Stack

### Mobile
- **Framework**: React Native (Expo)
- **Navigation**: React Navigation v6
- **State**: React Context + Hooks
- **Storage**: AsyncStorage
- **Health**: react-native-health
- **Notifications**: expo-notifications
- **HTTP**: axios

### Web
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **State**: React Hooks (custom hooks)
- **HTTP**: fetch API
- **Build**: Turbopack

### Shared
- **Language**: TypeScript
- **Types**: Comprehensive type definitions
- **Constants**: Centralized configuration

## 📋 Development Checklist

### Before Starting
- [ ] Clone repository
- [ ] Install dependencies (`npm install` in mobile and web folders)
- [ ] Set up environment variables (`.env` files)
- [ ] Ensure backend is running (or use mock data)
- [ ] Review shared types in `/shared/types`

### Mobile Development
- [ ] Run `npm start` in `/frontend/mobile`
- [ ] Test on iOS simulator or device
- [ ] Test on Android emulator or device
- [ ] Check HealthKit on physical iOS device
- [ ] Test push notifications

### Web Development
- [ ] Run `npm run dev` in `/frontend/web`
- [ ] Open http://localhost:3000
- [ ] Test on multiple browsers
- [ ] Check responsive design
- [ ] Test real-time updates

## 🤝 Coordination Points

### Shared Responsibilities
1. **Types**: Update `/shared/types/index.ts` when adding new features
2. **Constants**: Update `/shared/constants/index.ts` for config
3. **API contract**: Coordinate on endpoint changes
4. **Design system**: Maintain consistent colors and styling

### Communication
- Discuss major architectural changes
- Review each other's PRs
- Share design mockups before implementation
- Coordinate on API endpoint usage

## 🎯 Quick Start Guide

### Person Working on Mobile
```bash
cd frontend/mobile
npm install
npm start

# Then press 'i' for iOS or 'a' for Android
```

**Key files to edit:**
- `src/screens/*.tsx` - Screen components
- `src/components/` - Reusable UI components
- `src/services/api.service.ts` - API calls
- `src/contexts/*.tsx` - Global state

### Person Working on Web
```bash
cd frontend/web
npm install
npm run dev

# Open http://localhost:3000
```

**Key files to edit:**
- `app/*/page.tsx` - Page components
- `components/` - Reusable UI components
- `lib/api/client.ts` - API calls
- `hooks/` - Custom React hooks

## 📚 Documentation

All detailed documentation is available in:
- `frontend/README.md` - Overall frontend docs
- `frontend/mobile/README.md` - Mobile app docs
- `frontend/web/README.md` - Web dashboard docs

## 🐛 Common Issues & Solutions

### Mobile
**Issue**: HealthKit not working
- **Solution**: Must use physical iOS device, check entitlements

**Issue**: API connection failed
- **Solution**: Update `EXPO_PUBLIC_API_URL` with correct IP address

### Web
**Issue**: Type errors from shared folder
- **Solution**: Check import paths, ensure `/shared` is at correct relative path

**Issue**: Tailwind styles not applying
- **Solution**: Check `tailwind.config.js` content paths, restart dev server

## 🚀 Next Steps

1. **Review**: Go through the existing code structure
2. **Decide**: Choose work split strategy
3. **Plan**: Prioritize features to implement
4. **Communicate**: Set up regular sync meetings
5. **Build**: Start enhancing the applications!

## 📞 Getting Help

- Review the README files for detailed documentation
- Check the backend API documentation
- Review shared types for data structures
- Test with mock data if backend isn't ready

---

**Remember**: This is a basic outline. The goal is to provide a starting point that you can enhance and customize based on your specific needs. Good luck! 🎉

