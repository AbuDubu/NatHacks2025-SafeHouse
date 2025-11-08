# Expected Warnings & Errors - SafeHouse Mobile App

## ✅ App is Running Successfully!

The warnings and errors you're seeing are **expected** during development without a backend. Here's what each one means:

---

## 1. ⚠️ expo-notifications Warning

```
WARN expo-notifications: Android Push notifications (remote notifications) functionality 
provided by expo-notifications was removed from Expo Go with the release of SDK 53.
```

**What it means:** Push notifications don't work in Expo Go app.

**Is it a problem?** ❌ No - this is normal for Expo Go.

**Solutions:**
- **For now:** Just ignore this warning. Push notifications aren't essential for testing UI and features.
- **For production:** Build a standalone app (not Expo Go) where notifications will work.

**How to fix later:**
```bash
# Build a development build (instead of using Expo Go)
npx expo run:ios
npx expo run:android
```

---

## 2. ❌ HostFunction Error (Boolean/String Type)

```
ERROR [Error: Exception in HostFunction: TypeError: expected dynamic type 'boolean', 
but had type 'string']
```

**What it means:** This is likely from the HealthKit integration expecting a specific data type.

**Is it a problem?** ⚠️ Minor - the app still works, but HealthKit might not.

**Quick Fix:**

Update `src/services/health.service.ts` to handle this better:

```typescript
// Add better error handling
async initialize(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    console.warn('HealthKit is only available on iOS');
    return false;
  }

  return new Promise((resolve) => {
    try {
      AppleHealthKit.initHealthKit(permissions, (error: string) => {
        if (error) {
          console.error('Error initializing HealthKit:', error);
          resolve(false);
        } else {
          this.initialized = true;
          resolve(true);
        }
      });
    } catch (err) {
      console.error('HealthKit initialization exception:', err);
      resolve(false);
    }
  });
}
```

**Or just disable HealthKit for now** in `src/screens/HomeScreen.tsx`:

```typescript
// Comment out HealthKit initialization
useEffect(() => {
  loadDashboardData();
  // initializeHealthKit(); // Disable for now
}, []);
```

---

## 3. ❌ API 404 Error

```
ERROR Error fetching alerts: [AxiosError: Request failed with status code 404]
```

**What it means:** The backend API is not running at `http://localhost:3000/api`.

**Is it a problem?** ⚠️ Expected - you need either a backend or mock data.

**Solution A: Use Mock Data (Easiest)**

Update `src/services/api.service.ts` to return mock data:

```typescript
export const apiService = {
  // Mock active alerts
  async getActiveAlerts(): Promise<ApiResponse<Alert[]>> {
    // Return mock data instead of real API call
    return {
      success: true,
      data: [],
    };
  },

  // Mock dashboard data
  async getDashboardData(elderId: string): Promise<ApiResponse<DashboardData>> {
    return {
      success: true,
      data: {
        elder: {
          id: elderId,
          userId: elderId,
          address: '123 Main St',
          timezone: 'America/Los_Angeles',
          consentFlags: {
            healthDataSharing: true,
            emergencyContact: true,
            locationSharing: true,
          },
          appleDeviceLinked: false,
          user: {
            id: elderId,
            role: 'elder',
            name: 'Demo User',
            phone: '+1234567890',
            email: 'demo@example.com',
          },
        },
        currentTelemetry: {
          id: '1',
          deviceId: 'device-1',
          timestamp: new Date(),
          tempC: 25,
          humidity: 60,
          heatIndexC: 27,
          riskLevel: 'normal',
        },
        device: {
          id: 'device-1',
          elderId: elderId,
          hardwareId: 'ESP32-001',
          firmwareVersion: '1.0.0',
          lastSeenAt: new Date(),
          status: 'online',
        },
        activeAlerts: [],
        recentVitals: null,
      },
    };
  },
};
```

**Solution B: Start the Backend**

If you have the backend ready:

```bash
cd backend
npm install
npm start
```

**Solution C: Use a Different API URL**

If testing against a deployed backend, update `.env`:

```env
EXPO_PUBLIC_API_URL=https://your-api.example.com/api
```

---

## 4. ⚠️ Push Notification Permissions Warning

```
WARN Failed to get push notification permissions
```

**What it means:** Can't request push notification permissions (related to warning #1).

**Is it a problem?** ❌ No - this is expected in Expo Go.

**Solution:** Ignore for now. Will work in production builds.

---

## 🎯 Quick Testing Setup (No Backend Needed)

To test the app UI without a backend:

### Step 1: Disable API Calls Temporarily

Create `src/services/mock-api.service.ts`:

```typescript
import type { Alert, DashboardData, ApiResponse } from '../../../shared/types';

export const mockApiService = {
  async getActiveAlerts(): Promise<ApiResponse<Alert[]>> {
    return { success: true, data: [] };
  },

  async getDashboardData(elderId: string): Promise<ApiResponse<DashboardData>> {
    return {
      success: true,
      data: {
        elder: {
          id: elderId,
          userId: elderId,
          address: '123 Test St, San Francisco, CA',
          timezone: 'America/Los_Angeles',
          consentFlags: {
            healthDataSharing: true,
            emergencyContact: true,
            locationSharing: true,
          },
          appleDeviceLinked: false,
          user: {
            id: elderId,
            role: 'elder',
            name: 'Demo Elder',
            phone: '+1 (555) 123-4567',
            email: 'elder@example.com',
          },
        },
        currentTelemetry: {
          id: '1',
          deviceId: 'mock-device',
          timestamp: new Date(),
          tempC: 28.5,
          humidity: 65,
          heatIndexC: 32.1,
          riskLevel: 'warning',
        },
        device: {
          id: 'mock-device',
          elderId: elderId,
          hardwareId: 'ESP32-MOCK',
          firmwareVersion: '1.0.0',
          lastSeenAt: new Date(),
          status: 'online',
        },
        activeAlerts: [],
        recentVitals: null,
      },
    };
  },

  async acknowledgeAlert(alertId: string): Promise<ApiResponse<Alert>> {
    return { success: true, data: {} as Alert };
  },

  async getUserProfile() {
    return {
      success: true,
      data: {
        id: 'demo-user',
        role: 'elder' as const,
        name: 'Demo Elder',
        phone: '+1 (555) 123-4567',
        email: 'elder@example.com',
      },
    };
  },

  async login(phone: string, code: string) {
    return {
      success: true,
      data: {
        token: 'mock-token',
        user: {
          id: 'demo-user',
          role: 'elder' as const,
          name: 'Demo Elder',
          phone: phone,
          email: 'elder@example.com',
        },
      },
    };
  },
};
```

### Step 2: Use Mock Service in Contexts

In `src/contexts/AuthContext.tsx`, import the mock service:

```typescript
// At the top of the file
const USE_MOCK_DATA = true; // Toggle this

import { apiService } from '../services/api.service';
import { mockApiService } from '../services/mock-api.service';

const api = USE_MOCK_DATA ? mockApiService : apiService;
```

---

## 📊 Summary

| Warning/Error | Critical? | Action |
|---------------|-----------|--------|
| expo-notifications warning | ❌ No | Ignore - works in production builds |
| HostFunction error | ⚠️ Minor | Disable HealthKit or add try/catch |
| API 404 error | ⚠️ Expected | Use mock data or start backend |
| Push permissions warning | ❌ No | Ignore - works in production builds |

---

## ✅ What's Working

Even with these warnings, your app should:
- ✅ Launch successfully
- ✅ Show the login screen
- ✅ Navigate between screens
- ✅ Display UI components
- ✅ Accept user input

---

## 🚀 Next Steps

### For Development (Right Now)

1. **Add mock data** so you can test the UI without a backend
2. **Comment out HealthKit** initialization to remove the HostFunction error
3. **Ignore the warnings** - they're expected

### For Production (Later)

1. **Build standalone apps** instead of using Expo Go
2. **Connect to real backend** API
3. **Test on physical devices** for HealthKit
4. **Set up push notifications** properly

---

## 💡 Testing Without Backend

You can fully test the UI and navigation without any backend:

1. Mock the API responses
2. Test all screens and navigation
3. Verify the design and user flow
4. Make sure all buttons and interactions work

Then when the backend is ready, just swap in the real API service!

---

## 🆘 Still Seeing Issues?

If the app crashes or won't load:

1. **Clear cache completely:**
   ```bash
   cd frontend/mobile
   rm -rf .expo node_modules/.cache
   npm start -- --clear
   ```

2. **Check the terminal** for actual errors (not just warnings)

3. **Review TROUBLESHOOTING.md** for more solutions

---

**Your app is running! These are just development warnings. Happy coding! 🎉**

