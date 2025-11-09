# Mobile App Troubleshooting

## Common Issues and Solutions

### Module Resolution Error: "Unable to resolve ../../../shared/..."

**Error:**
```
Unable to resolve module ../../../shared/constants from .../AlertContext.tsx
```

**Solution:**

1. **Clear the Metro bundler cache:**
```bash
npm start -- --clear
# or
npx expo start -c
```

2. **If that doesn't work, reset everything:**
```bash
# Delete cache and node_modules
rm -rf node_modules
rm -rf .expo
rm -rf .expo-shared

# Reinstall
npm install

# Start with clear cache
npm start -- --clear
```

3. **Verify metro.config.js exists** in the project root with the shared folder configuration.

4. **Make sure the shared folder has index.ts files** that export the constants and types.

### Asset Resolution Error: "Unable to resolve asset"

**Error:**
```
Unable to resolve asset "./assets/splash.png"
```

**Solution:**

The app.json has been updated to not require specific asset files. If you see this error:

1. **Clear cache:**
```bash
npm start -- --clear
```

2. **If you want to add proper assets:**
   - Create `assets/icon.png` (1024x1024)
   - Create `assets/splash.png` (1284x2778)
   - Or run `npx expo prebuild --clean` to generate defaults

### HealthKit Not Working

**Issue:** HealthKit methods return null or errors

**Solution:**
- HealthKit ONLY works on physical iOS devices
- iOS Simulator does NOT support HealthKit
- Ensure you've granted permissions in Settings > Health
- Check that entitlements are properly set in app.json

### API Connection Failed

**Error:**
```
Network request failed / Cannot connect to API
```

**Solution:**

1. **Check your .env file** has the correct API URL:
   - iOS Simulator: `http://localhost:3000/api`
   - Android Emulator: `http://10.0.2.2:3000/api`
   - Physical Device: `http://YOUR_COMPUTER_IP:3000/api`

2. **Find your computer's IP:**
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

3. **Update .env:**
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
   ```

4. **Restart the app** after changing .env:
   ```bash
   # Stop the server (Ctrl+C)
   # Clear cache and restart
   npm start -- --clear
   ```

### TypeScript Errors

**Error:**
```
Cannot find module '@shared/types' or its corresponding type declarations
```

**Solution:**

1. **Check tsconfig.json includes the shared folder**
2. **Reload VS Code TypeScript server:**
   - Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
   - Type "TypeScript: Restart TS Server"
   - Press Enter

### Build Errors

**Error:**
```
Build failed / Compilation error
```

**Solution:**

```bash
# Full reset
rm -rf node_modules
rm -rf .expo
rm -rf ios
rm -rf android
npm install
npm start -- --clear
```

### Expo Go Connection Issues

**Issue:** Can't connect to development server

**Solution:**

1. **Ensure device and computer are on same WiFi**
2. **Disable VPN** if you have one running
3. **Check firewall** isn't blocking port 19000
4. **Try tunnel mode:**
   ```bash
   npm start -- --tunnel
   ```

### Navigation Errors

**Error:**
```
The action 'NAVIGATE' with payload... was not handled
```

**Solution:**

1. **Check screen names** match the navigation types
2. **Verify all screens are registered** in AppNavigator.tsx
3. **Restart the app**

## Development Tips

### Quick Restart
```bash
# In the Expo DevTools terminal
r # Reload app
Ctrl+C # Stop server
npm start -- --clear # Restart with clear cache
```

### Debugging

1. **Enable Chrome DevTools:**
   - Press `Cmd+D` (iOS) or `Cmd+M` (Android) in simulator
   - Select "Debug with Chrome"

2. **View logs:**
   ```bash
   # iOS logs
   npx expo run:ios --device

   # Android logs
   npx expo run:android --device
   ```

3. **React Native Debugger:**
   - Install: https://github.com/jhen0409/react-native-debugger
   - More powerful than Chrome DevTools

### Performance Issues

**App is slow or laggy:**

1. **Use production build:**
   ```bash
   npm run ios -- --configuration Release
   npm run android -- --variant=release
   ```

2. **Check for console.log statements** - they slow down the app

3. **Reduce polling intervals** in shared/constants if needed

## Still Having Issues?

1. **Check the main README.md** for more detailed setup instructions
2. **Review the error message carefully** - it usually points to the exact issue
3. **Make sure backend is running** if testing API calls
4. **Try on a different device/simulator** to isolate the issue
5. **Check Expo documentation:** https://docs.expo.dev/

## Quick Command Reference

```bash
# Start development server
npm start

# Clear cache and start
npm start -- --clear

# Full reset
rm -rf node_modules .expo && npm install && npm start -- --clear

# Run on specific platform
npm run ios
npm run android

# Type check
npx tsc --noEmit

# View all options
npm start -- --help
```

## Metro Bundler Configuration

The `metro.config.js` file is configured to watch the shared folder. If you modify it, restart the server:

```bash
# Stop server (Ctrl+C)
# Delete cache
rm -rf .expo
# Restart
npm start -- --clear
```

## Environment Variables

Remember: Changes to `.env` require a full restart:

```bash
# Stop server
Ctrl+C

# Clear cache
npm start -- --clear
```

The `EXPO_PUBLIC_` prefix is required for Expo to expose the variable to the app.

