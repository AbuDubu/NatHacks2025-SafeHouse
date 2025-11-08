# Testing HealthKit Without an Apple Watch

## 🎯 Good News!

You **CAN** test most of the HealthKit functionality without an Apple Watch! The iPhone Health app allows you to manually add data for testing.

## 📱 What You Need

1. **Physical iPhone** (HealthKit doesn't work in simulator)
2. **Development Build** (not Expo Go)
3. **Health app** (built into iOS)

## 🚀 Quick Start

### 1. Build the App on Your iPhone

```bash
cd /Users/mehmoodahmad/NatHacks2025-SafeHouse-1/frontend/mobile
npx expo run:ios
```

This will:
- Build the app
- Install on your connected iPhone
- Launch it

### 2. Add Test Data to Health App

Open the **Health** app on your iPhone and add manual entries:

## 📊 How to Add Each Metric

### ❤️ Heart Rate

1. Open **Health** app
2. Tap **Browse** (bottom right)
3. Tap **Heart** → **Heart Rate**
4. Tap **Add Data** (top right)
5. Enter:
   - **BPM**: `75` (or any value 60-100)
   - **Date**: Today
   - **Time**: Current time
6. Tap **Add**

### 💓 Heart Rate Variability (HRV)

1. **Browse** → **Heart** → **Heart Rate Variability**
2. Tap **Add Data**
3. Enter:
   - **HRV**: `50` ms (or any value 20-200)
   - **Date**: Today
   - **Time**: Current time
4. Tap **Add**

### 🩸 Blood Glucose

1. **Browse** → **Body Measurements** → **Blood Glucose**
2. Tap **Add Data**
3. Enter:
   - **Blood Glucose**: `95` mg/dL (normal range: 70-140)
   - **Date**: Today
   - **Time**: Current time
4. Tap **Add**

### 🫀 Blood Pressure

1. **Browse** → **Heart** → **Blood Pressure**
2. Tap **Add Data**
3. Enter:
   - **Systolic**: `120` mmHg
   - **Diastolic**: `80` mmHg
   - **Date**: Today
   - **Time**: Current time
4. Tap **Add**

### 🫁 Oxygen Saturation

1. **Browse** → **Respiratory** → **Oxygen Saturation**
2. Tap **Add Data**
3. Enter:
   - **Oxygen Saturation**: `98` % (normal: 95-100%)
   - **Date**: Today
   - **Time**: Current time
4. Tap **Add**

### 🌡️ Body Temperature

1. **Browse** → **Body Measurements** → **Body Temperature**
2. Tap **Add Data**
3. Enter:
   - **Temperature**: `37.0` °C (or `98.6` °F)
   - **Date**: Today
   - **Time**: Current time
4. Tap **Add**

### 🚶 Steps

1. **Browse** → **Activity** → **Steps**
2. Tap **Add Data**
3. Enter:
   - **Steps**: `150` (for 5-minute window)
   - **Date**: Today
   - **Start Time**: 5 minutes ago
   - **End Time**: Now
4. Tap **Add**

## 🧪 Complete Test Scenario

Here's a full test dataset to add:

```
✅ Heart Rate: 72 bpm (current time)
✅ HRV: 55 ms (current time)
✅ Blood Glucose: 105 mg/dL (current time)
✅ Blood Pressure: 118/76 mmHg (current time)
✅ Oxygen Saturation: 97% (current time)
✅ Body Temperature: 37.2°C (current time)
✅ Steps: 200 (last 5 minutes)
```

## 🔄 Testing Flow

### Step 1: Add Data to Health App
Follow the steps above to add at least 3-4 metrics

### Step 2: Open SafeHouse App
Launch your development build on iPhone

### Step 3: Navigate to Health Dashboard
(If you've added it to your navigation)

### Step 4: Grant Permissions
- App will request HealthKit permissions
- Tap **Allow** for all requested data types

### Step 5: View Data
- Dashboard should show the data you added
- Pull down to refresh if needed

### Step 6: Verify Display
Check that each metric shows:
- ✅ Correct value
- ✅ Correct unit
- ✅ Recent timestamp
- ✅ "No data" for metrics you didn't add

## 🎨 Alternative: Quick Test Component

If you want to test without building the full dashboard, create a simple test screen:

```typescript
// TestHealthKit.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import { healthService } from './src/services/health.service.APPLEHEALTH';

export default function TestHealthKit() {
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState('Not initialized');

  const init = async () => {
    setStatus('Initializing...');
    const success = await healthService.initialize();
    setStatus(success ? 'Initialized ✅' : 'Failed ❌');
  };

  const fetchData = async () => {
    setStatus('Fetching...');
    const metrics = await healthService.getAllHealthMetrics();
    setData(metrics);
    setStatus('Data loaded ✅');
  };

  return (
    <ScrollView style={{ padding: 20, paddingTop: 60 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>HealthKit Test</Text>
      <Text>Status: {status}</Text>
      
      <Button title="Initialize HealthKit" onPress={init} />
      <Button title="Fetch All Data" onPress={fetchData} />
      
      {data && (
        <View style={{ marginTop: 20 }}>
          <Text>Heart Rate: {data.heartRate || 'No data'}</Text>
          <Text>HRV: {data.hrv || 'No data'}</Text>
          <Text>Steps: {data.steps || 'No data'}</Text>
          <Text>Glucose: {data.glucose || 'No data'}</Text>
          <Text>BP: {data.bloodPressure ? 
            `${data.bloodPressure.systolic}/${data.bloodPressure.diastolic}` : 
            'No data'}</Text>
          <Text>SpO2: {data.oxygenSaturation || 'No data'}</Text>
          <Text>Temp: {data.bodyTemperature || 'No data'}</Text>
        </View>
      )}
    </ScrollView>
  );
}
```

## ⚠️ What WON'T Work Without Apple Watch

Without an Apple Watch, these limitations apply:

| Feature | Works? | Notes |
|---------|--------|-------|
| Manual data entry | ✅ Yes | Can add all metrics manually |
| Real-time heart rate | ❌ No | Requires Watch for continuous monitoring |
| Automatic HRV | ❌ No | Watch measures during sleep |
| Automatic SpO2 | ❌ No | Requires Watch Series 6+ |
| Automatic steps | ⚠️ Partial | iPhone tracks steps, but less accurate |
| Blood glucose | ✅ Yes | Manual entry or CGM |
| Blood pressure | ✅ Yes | Manual entry or connected device |
| Body temperature | ✅ Yes | Manual entry |

## 🎭 Simulating Different Scenarios

### Scenario 1: Healthy Elder
```
Heart Rate: 72 bpm
HRV: 55 ms
BP: 120/80 mmHg
SpO2: 98%
Glucose: 95 mg/dL
Temp: 37.0°C
```

### Scenario 2: Heat Stress Warning
```
Heart Rate: 95 bpm (elevated)
BP: 135/88 mmHg (high)
SpO2: 96% (slightly low)
Temp: 37.8°C (elevated)
```

### Scenario 3: Critical Alert
```
Heart Rate: 115 bpm (very high)
BP: 145/95 mmHg (very high)
SpO2: 92% (low)
Temp: 38.5°C (fever)
```

## 🔍 Debugging Tips

### Check Console Logs

The service logs everything:

```
✅ "HealthKit initialized successfully"
✅ "Heart Rate: 72 bpm"
✅ "Fetching blood glucose..."
❌ "Error fetching HRV: [error details]"
```

### Check Permissions

1. Go to **Settings** → **Health** → **Data Access & Devices**
2. Find **SafeHouse**
3. Verify all permissions are ON

### Common Issues

**"No data" showing:**
- Make sure you added data with TODAY's date
- Check the time is within the last 5 mins (for heart rate/steps) or 24 hours (others)
- Pull to refresh in the app

**"HealthKit Unavailable":**
- Make sure you're on a physical device (not simulator)
- Build with `npx expo run:ios`, not Expo Go

**Permissions denied:**
- Go to Settings → Health → Data Access & Devices → SafeHouse
- Toggle permissions ON

## 🎯 Quick Testing Checklist

- [ ] Build app on physical iPhone
- [ ] Add test data to Health app (at least 3 metrics)
- [ ] Open SafeHouse app
- [ ] Grant HealthKit permissions when prompted
- [ ] Navigate to Health Dashboard
- [ ] Verify data displays correctly
- [ ] Pull to refresh
- [ ] Check console logs for errors

## 💡 Pro Tips

1. **Use Recent Timestamps**: Add data with current time for best results
2. **Test "No Data"**: Don't add all metrics to test the "No data" state
3. **Test Multiple Values**: Add 2-3 entries for same metric to see latest one selected
4. **Test Time Windows**: Add one entry from yesterday (won't show) and one from today (will show)
5. **Use Realistic Values**: Stick to normal ranges for demo purposes

## 📱 Demo for NatHacks

For your demo/presentation, you can:

1. **Pre-populate Health data** before the demo
2. **Show the Dashboard screen** with real data
3. **Pull to refresh** to show live sync
4. **Add a new entry** in Health app mid-demo
5. **Refresh SafeHouse** to show it updates

This will demonstrate that the HealthKit integration is fully working, even without an Apple Watch!

## 🚀 When You DO Get an Apple Watch

If you later test with an Apple Watch:
- Heart rate will auto-update continuously
- HRV will be measured during sleep
- Steps will be more accurate
- SpO2 will auto-measure (Series 6+)
- Temperature will auto-measure (Series 8+)

But for now, manual entry works perfectly for testing and demo purposes!

## 🆘 Need Help?

If you run into issues:
1. Check `frontend/mobile/HEALTHKIT_INTEGRATION.md` for detailed docs
2. Review console logs for specific errors
3. Verify Health app has the data you added
4. Ensure permissions are granted in Settings

---

**Happy Testing! 🎉**

You can fully test and demo the HealthKit integration without an Apple Watch by using manual Health app entries.

