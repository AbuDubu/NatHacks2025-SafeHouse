# HealthKit Integration Guide

## Overview

SafeHouse integrates with Apple HealthKit to monitor vital signs from Apple Watch and iPhone Health app. This integration uses [react-native-health](https://github.com/agencyenterprise/react-native-health) library.

## Features Implemented

### 💓 Vital Signs
- **Heart Rate** - Real-time BPM from Apple Watch (last 5 minutes)
- **Heart Rate Variability (HRV)** - Cardiac health indicator (last 24 hours)
- **Blood Pressure** - Systolic/Diastolic readings
- **Oxygen Saturation (SpO2)** - Blood oxygen level percentage

### 🩺 Health Metrics
- **Blood Glucose** - Most recent glucose reading (mg/dL)
- **Body Temperature** - Recent temperature reading (°C)

### 🚶 Activity
- **Steps** - Step count (last 5 minutes)

## Setup Instructions

### 1. Install Dependencies

Already installed in this project:
```bash
npm install react-native-health
```

### 2. Configure app.json

The `app.json` has been configured with necessary permissions:

```json
{
  "ios": {
    "infoPlist": {
      "NSHealthShareUsageDescription": "SafeHouse needs access to your health data...",
      "NSHealthUpdateUsageDescription": "SafeHouse needs to save health data..."
    },
    "entitlements": {
      "com.apple.developer.healthkit": true
    }
  }
}
```

### 3. Build for Physical Device

**⚠️ IMPORTANT**: HealthKit does NOT work in Expo Go!

You must build a development build or standalone app:

```bash
# Development build
npx expo run:ios

# Or with EAS
eas build --profile development --platform ios
```

### 4. Enable in Xcode (if building manually)

1. Open `ios/` folder in Xcode
2. Select your project
3. Go to "Signing & Capabilities"
4. Click "+ Capability"
5. Add "HealthKit"

## Using the Health Service

### Initialize HealthKit

```typescript
import { healthService } from './src/services/health.service.APPLEHEALTH';

// Initialize and request permissions
const enabled = await healthService.initialize();

if (enabled) {
  // HealthKit is ready!
  console.log('HealthKit initialized');
}
```

### Get Individual Metrics

```typescript
// Heart rate (BPM)
const heartRate = await healthService.getRecentHeartRate();
console.log(`Heart Rate: ${heartRate} bpm`);

// HRV (ms)
const hrv = await healthService.getHeartRateVariability();
console.log(`HRV: ${hrv} ms`);

// Blood glucose (mg/dL)
const glucose = await healthService.getBloodGlucose();
console.log(`Glucose: ${glucose} mg/dL`);

// Blood pressure
const bp = await healthService.getBloodPressure();
console.log(`BP: ${bp.systolic}/${bp.diastolic} mmHg`);

// Oxygen saturation (%)
const o2 = await healthService.getOxygenSaturation();
console.log(`SpO2: ${o2}%`);

// Body temperature (°C)
const temp = await healthService.getBodyTemperature();
console.log(`Temperature: ${temp}°C`);

// Steps
const steps = await healthService.getRecentSteps();
console.log(`Steps: ${steps}`);
```

### Get All Metrics at Once

```typescript
const allMetrics = await healthService.getAllHealthMetrics();

console.log('All health data:', {
  heartRate: allMetrics.heartRate,
  hrv: allMetrics.hrv,
  steps: allMetrics.steps,
  glucose: allMetrics.glucose,
  bloodPressure: allMetrics.bloodPressure,
  oxygenSaturation: allMetrics.oxygenSaturation,
  bodyTemperature: allMetrics.bodyTemperature,
});
```

## Using the Health Dashboard Screen

The `HealthDashboard.tsx` screen displays all metrics in a beautiful UI:

```typescript
import HealthDashboard from './src/screens/HealthDashboard';

// Use in your navigator
<Stack.Screen name="Health" component={HealthDashboard} />
```

Features:
- ✅ Auto-initializes HealthKit
- ✅ Requests permissions on first use
- ✅ Pull-to-refresh to update data
- ✅ Shows "No data" for missing metrics
- ✅ Beautiful card-based UI
- ✅ Real-time timestamps

## Permissions

The app requests **READ** permissions for:
- ✅ Heart Rate
- ✅ Heart Rate Variability
- ✅ Resting Heart Rate
- ✅ Steps
- ✅ Step Count
- ✅ Blood Glucose
- ✅ Blood Pressure
- ✅ Oxygen Saturation
- ✅ Body Temperature
- ✅ Respiratory Rate

No WRITE permissions are requested (read-only access).

## Testing

### With Real Apple Watch

1. Build development build on physical iPhone
2. Ensure Apple Watch is paired and syncing
3. Open SafeHouse app
4. Grant HealthKit permissions
5. Navigate to Health Dashboard
6. Pull to refresh to load latest data

### Generating Test Data

Use the Apple Health app on iPhone to add manual entries:

1. Open **Health** app
2. Tap **Browse** → Select metric (e.g., Heart Rate)
3. Tap **Add Data** in top right
4. Enter test values
5. Refresh SafeHouse app

### Using Health App in Simulator

❌ **HealthKit does NOT work in iOS Simulator**

You must use a physical device.

## Troubleshooting

### "No Data" Showing

**Possible causes:**
1. No recent health data in Health app
2. Permissions not granted
3. Apple Watch not syncing
4. Time window too narrow

**Solutions:**
- Check Health app has data for the metric
- Go to Settings > Health > Data Access & Devices > SafeHouse
- Ensure Apple Watch is paired and syncing
- Add manual data in Health app for testing

### "HealthKit Unavailable"

**Cause:** Running in Expo Go or Simulator

**Solution:** Build a development build:
```bash
npx expo run:ios
```

### Permission Denied

**Cause:** User declined permissions or app not in Health settings

**Solution:**
1. Go to Settings > Health
2. Tap Data Access & Devices
3. Find SafeHouse
4. Enable all required permissions

### Old Data Showing

**Cause:** Health app hasn't synced recently

**Solutions:**
- Open Health app to trigger sync
- Open Watch app and sync manually
- Pull to refresh in SafeHouse
- Wait for Apple Watch to sync (happens automatically every ~15 min)

## API Reference

### HealthService Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `initialize()` | `Promise<boolean>` | Initialize HealthKit and request permissions |
| `isAvailable()` | `boolean` | Check if HealthKit is ready |
| `getRecentHeartRate()` | `Promise<number \| null>` | Get heart rate from last 5 minutes |
| `getHeartRateVariability()` | `Promise<number \| null>` | Get HRV from last 24 hours |
| `getRecentSteps()` | `Promise<number \| null>` | Get steps from last 5 minutes |
| `getBloodGlucose()` | `Promise<number \| null>` | Get most recent glucose reading |
| `getBloodPressure()` | `Promise<{systolic, diastolic} \| null>` | Get most recent BP reading |
| `getOxygenSaturation()` | `Promise<number \| null>` | Get most recent SpO2 reading |
| `getBodyTemperature()` | `Promise<number \| null>` | Get most recent temperature |
| `getAllHealthMetrics()` | `Promise<HealthMetrics>` | Get all metrics at once |
| `getVitalSnapshot(elderId)` | `Promise<VitalSnapshot>` | Get vital snapshot for alerts |

## Integration with Alerts

When a heat alert is triggered, the system automatically:

1. Checks for recent health data
2. Submits vitals to backend
3. Uses data to assess severity
4. Includes in alert timeline

See `src/services/api.service.ts` for vital submission.

## Privacy & Security

- ✅ **Read-only access** - App cannot modify Health data
- ✅ **User controlled** - Users can revoke permissions anytime
- ✅ **On-device processing** - Health data stays on device unless alert triggered
- ✅ **Minimal data** - Only sends vitals during active alerts
- ✅ **Transparent** - Clear usage descriptions in permissions

## Data Freshness

| Metric | Freshness | Source |
|--------|-----------|--------|
| Heart Rate | Last 5 minutes | Apple Watch continuous monitoring |
| HRV | Last 24 hours | Apple Watch (measured during sleep) |
| Steps | Last 5 minutes | Apple Watch + iPhone motion processor |
| Blood Glucose | Last 24 hours | Manual entry or CGM if configured |
| Blood Pressure | Last 24 hours | Manual entry or connected device |
| SpO2 | Last 24 hours | Apple Watch (Series 6+) |
| Temperature | Last 24 hours | Apple Watch (Series 8+) or manual |

## Apple Watch Models

### Supported Features by Model

| Feature | Watch SE | Series 6+ | Series 8+ | Ultra |
|---------|----------|-----------|-----------|-------|
| Heart Rate | ✅ | ✅ | ✅ | ✅ |
| HRV | ✅ | ✅ | ✅ | ✅ |
| Steps | ✅ | ✅ | ✅ | ✅ |
| SpO2 | ❌ | ✅ | ✅ | ✅ |
| Temperature | ❌ | ❌ | ✅ | ✅ |

## Resources

- [react-native-health Documentation](https://github.com/agencyenterprise/react-native-health)
- [Apple HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
- [Health Data Types](https://developer.apple.com/documentation/healthkit/data_types)

## Future Enhancements

Potential additions:
- [ ] Background observers for real-time monitoring
- [ ] Workout session tracking
- [ ] Sleep analysis
- [ ] Respiratory rate
- [ ] VO2 Max
- [ ] Resting heart rate trends
- [ ] ECG data (if available)
- [ ] Fall detection integration

## Support

For issues with HealthKit integration:
1. Check this guide's Troubleshooting section
2. Verify you're on a physical device (not simulator)
3. Check iOS Settings > Health > Data Access
4. Review the react-native-health GitHub issues

---

**Built with ❤️ for SafeHouse Heat Safety Monitoring**

