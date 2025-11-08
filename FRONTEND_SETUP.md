# SafeHouse Frontend - Quick Setup Guide

This guide will help you get the SafeHouse frontend applications running quickly.

## 📋 Prerequisites

Before you start, ensure you have:

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** for version control

### For Mobile Development
- **iOS**: Mac with Xcode 14+ installed
- **Android**: Android Studio with Android SDK
- **Expo CLI**: Will be installed automatically

### For Web Development
- Any modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Initial Setup

### 1. Clone and Navigate

```bash
cd NatHacks2025-SafeHouse-1/frontend
```

### 2. Install Dependencies

#### Mobile App
```bash
cd mobile
npm install
cd ..
```

#### Web Dashboard
```bash
cd web
npm install
cd ..
```

## ⚙️ Configuration

### Mobile App Environment

Create `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_ENV=development
```

**Important Notes:**
- For **iOS Simulator**: Use `http://localhost:3000/api`
- For **Android Emulator**: Use `http://10.0.2.2:3000/api`
- For **Physical Device**: Use your computer's IP address (e.g., `http://192.168.1.100:3000/api`)

To find your IP address:
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

### Web Dashboard Environment

Create `web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NODE_ENV=development
```

## 🏃 Running the Applications

### Mobile App

```bash
cd mobile
npm start
```

After the Expo DevTools open:
- Press **`i`** to open iOS Simulator
- Press **`a`** to open Android Emulator
- Scan QR code with Expo Go app on your phone

**First Time Setup:**
- iOS: Xcode must be installed and simulator configured
- Android: Android Studio must be installed with emulator created

### Web Dashboard

```bash
cd web
npm run dev
```

Open your browser to: **http://localhost:3000**

## 📱 Testing on Physical Devices

### iOS (iPhone/iPad)

1. Install **Expo Go** app from the App Store
2. Ensure your phone is on the same WiFi as your computer
3. Scan the QR code from the terminal
4. Update `.env` with your computer's IP address

### Android

1. Install **Expo Go** app from the Play Store
2. Ensure your phone is on the same WiFi as your computer
3. Scan the QR code from the terminal
4. Update `.env` with your computer's IP address

## 🔍 Verifying Setup

### Mobile App Checklist
- [ ] App launches without errors
- [ ] Login screen appears
- [ ] Navigation works (try switching tabs)
- [ ] No console errors in terminal

### Web Dashboard Checklist
- [ ] Website loads at http://localhost:3000
- [ ] Home page displays properly
- [ ] Can navigate to /dashboard and /alerts
- [ ] No console errors in browser DevTools

## 🧪 Mock Data Mode (No Backend Required)

If you don't have the backend running, you can test with mock data:

### Mobile
Edit `mobile/src/services/api.service.ts` and add mock responses:

```typescript
// Example: Mock getActiveAlerts
async getActiveAlerts(): Promise<ApiResponse<Alert[]>> {
  // Return mock data
  return {
    success: true,
    data: [/* mock alert data */]
  };
}
```

### Web
Edit `web/lib/api/client.ts` similarly to return mock data.

## 🐛 Troubleshooting

### Mobile App Issues

#### "Unable to resolve module"
```bash
cd mobile
rm -rf node_modules
npm install
npm start -- --clear
```

#### iOS Simulator not opening
- Open Xcode
- Go to Xcode > Preferences > Locations
- Ensure Command Line Tools is selected
- Try: `npx expo run:ios`

#### Android Emulator not opening
- Open Android Studio
- Tools > Device Manager
- Create a new virtual device
- Start the emulator manually

#### HealthKit not working
- HealthKit ONLY works on physical iOS devices
- Simulator will not show health data
- Must grant permissions in Settings > Health

### Web Dashboard Issues

#### Port 3000 already in use
```bash
# Use a different port
npm run dev -- -p 3001
```

#### Tailwind styles not working
```bash
rm -rf .next
npm run dev
```

#### Type errors from shared folder
- Check that paths in imports are correct
- Shared folder should be at `../../../shared/types`

### API Connection Issues

#### Cannot connect to backend
1. Verify backend is running
2. Check API URL in `.env` files
3. For physical devices, use computer's IP address
4. Disable any VPN that might block local network

#### CORS errors (web only)
- Backend must allow requests from `http://localhost:3000`
- Check backend CORS configuration

## 📚 Next Steps

After successful setup:

1. **Explore the code:**
   - Mobile: `frontend/mobile/src/screens/`
   - Web: `frontend/web/app/`

2. **Read the documentation:**
   - `FRONTEND_OVERVIEW.md` - High-level overview
   - `frontend/README.md` - Detailed docs
   - `frontend/mobile/README.md` - Mobile-specific
   - `frontend/web/README.md` - Web-specific

3. **Start developing:**
   - Pick a feature from the enhancement list
   - Create a new branch
   - Start coding!

## 🔧 Development Tools

### Recommended VS Code Extensions

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **ES7+ React/Redux/React-Native snippets** - Code snippets
- **Tailwind CSS IntelliSense** - Tailwind autocomplete (for web)
- **React Native Tools** - React Native debugging

### Browser Extensions

- **React Developer Tools** - Debug React components
- **Redux DevTools** - If you add Redux later

## 📝 Common Development Commands

### Mobile
```bash
cd mobile

# Start dev server
npm start

# Clear cache
npm start -- --clear

# Run on specific platform
npm run ios
npm run android

# Type checking
npx tsc --noEmit
```

### Web
```bash
cd web

# Start dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Type checking
npm run type-check

# Lint code
npm run lint
```

## 🎯 Development Workflow

1. **Start both apps** (in separate terminals):
   ```bash
   # Terminal 1
   cd frontend/mobile && npm start
   
   # Terminal 2
   cd frontend/web && npm run dev
   ```

2. **Make changes** to the code
3. **See updates** automatically (hot reload)
4. **Test** on simulators/browsers
5. **Commit** your changes

## 💡 Tips

- **Save time**: Keep both terminals running during development
- **Hot reload**: Changes appear automatically (no need to restart)
- **Console logs**: Check terminal and browser console for errors
- **Network tab**: Use browser DevTools Network tab to debug API calls
- **React DevTools**: Install browser extension to inspect components

## 🆘 Getting Help

If you're stuck:

1. Check the error message carefully
2. Look in the troubleshooting section above
3. Review the README files
4. Check if backend is running properly
5. Try clearing cache and reinstalling dependencies

## ✅ Setup Complete!

If you've reached this point successfully:
- ✅ Mobile app is running
- ✅ Web dashboard is running
- ✅ You understand the project structure
- ✅ You're ready to start developing!

**Happy coding! 🎉**

---

## 📞 Quick Reference

| Task | Mobile Command | Web Command |
|------|---------------|-------------|
| Install | `npm install` | `npm install` |
| Run | `npm start` | `npm run dev` |
| Clear cache | `npm start -- --clear` | `rm -rf .next` |
| Type check | `npx tsc --noEmit` | `npm run type-check` |
| Lint | N/A | `npm run lint` |

| URL | Location |
|-----|----------|
| Web Dashboard | http://localhost:3000 |
| Backend API (example) | http://localhost:3000/api |
| Expo DevTools | http://localhost:19002 |

