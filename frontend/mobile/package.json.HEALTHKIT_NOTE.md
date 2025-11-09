# HealthKit Package Note

## react-native-health

The `react-native-health` package is installed but currently **disabled** in the code because it causes errors in Expo Go.

### Current Status

- ✅ Package installed in package.json
- ⏸️ Import commented out in screens
- ⏸️ All HealthKit calls disabled
- ✅ Will work in production/development builds

### Why Disabled?

The library tries to initialize native modules that don't exist in Expo Go, causing:
```
TypeError: expected dynamic type 'boolean', but had type 'string'
```

### To Re-enable

When building a development build or standalone app:

1. **Uncomment imports** in:
   - `src/screens/HomeScreen.tsx`
   - `src/screens/ProfileScreen.tsx`

2. **Uncomment initialization** in:
   - `src/screens/HomeScreen.tsx` - `initializeHealthKit()`

3. **Uncomment vital submission** in:
   - `src/screens/HomeScreen.tsx` - `handleAcknowledgeAlert()`

4. **Build and run**:
   ```bash
   npx expo run:ios
   # or
   eas build --profile development --platform ios
   ```

### Alternative: Use a Different Library

Consider `react-native-healthkit` or `@kingstinct/react-native-healthkit` which may have better Expo support.

### For Now

The app works perfectly without HealthKit. Mock health data is available in `mock-api.service.ts` for testing the UI.

