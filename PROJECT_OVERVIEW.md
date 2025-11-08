# SafeHouse - Elderly Safety Monitoring System

A comprehensive IoT safety monitoring system for elderly people living alone, combining hardware sensors, backend API, and mobile app.

## 🎯 Project Purpose

SafeHouse ensures the safety of elderly individuals living independently by:
- Monitoring environmental conditions (temperature, humidity, smoke, CO2)
- Detecting emergencies (falls, smoke, abnormal conditions)
- Alerting caregivers in real-time through a mobile app
- Providing historical data and analytics

## 🏗️ System Architecture

```
┌─────────────────┐
│  Hardware Base  │
│    Station      │──┐
│   + Sensors     │  │
└─────────────────┘  │
                     │
                     ├──> ┌──────────────┐      ┌─────────────┐
                     │    │   FastAPI    │      │   Mobile    │
                     └───>│   Backend    │<────>│     App     │
                          │   + SQLite   │      │             │
                          └──────────────┘      └─────────────┘
                                 │
                                 │ WebSocket
                                 │
                          ┌──────────────┐
                          │  Real-time   │
                          │   Updates    │
                          └──────────────┘
```

## 📁 Project Structure

```
NatHacks2025-SafeHouse/
├── backend/                    ✅ COMPLETED
│   ├── app/
│   │   ├── main.py            # FastAPI application
│   │   ├── database.py        # Database config
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── schemas.py         # Pydantic schemas
│   │   └── routers/
│   │       ├── sensors.py     # Sensor endpoints
│   │       ├── alerts.py      # Alert endpoints
│   │       ├── users.py       # User endpoints
│   │       ├── dashboard.py   # Dashboard endpoints
│   │       └── websocket.py   # WebSocket endpoint
│   ├── requirements.txt
│   ├── README.md
│   ├── QUICKSTART.md
│   ├── API_ENDPOINTS.md
│   ├── run.sh                 # Quick start script
│   ├── test_api.py           # Load demo data
│   └── simulate_hardware.py   # Hardware simulator
├── frontend/                   🚧 TODO
│   └── (mobile app)
└── hardware/                   🚧 TODO
    └── (base station code)
```

## ✅ Backend - COMPLETED

The backend is **fully functional** and ready to use!

### Features Implemented

✅ **Database Models:**
- Users (elderly person + caregivers)
- Sensors (9 types supported)
- Sensor Readings (time-series data)
- Alerts (with 3 severity levels)

✅ **API Endpoints:**
- Dashboard (complete & summary)
- Alerts (CRUD + filtering)
- Sensors (CRUD + readings)
- Users (CRUD)
- WebSocket (real-time updates)

✅ **Automatic Alert System:**
- Temperature monitoring (too hot/cold)
- Smoke detection (CRITICAL)
- Fall detection (CRITICAL)
- CO2 monitoring
- Extensible for more conditions

✅ **Developer Tools:**
- Interactive API docs (Swagger)
- Hardware simulator
- Demo data loader
- Quick start scripts

### Getting Started with Backend

```bash
cd backend
./run.sh
```

Then open: `http://localhost:8000/docs`

Load demo data:
```bash
python test_api.py
```

## 📱 Mobile App - TODO

### Recommended Tech Stack

**React Native (Expo):**
- ✅ Cross-platform (iOS + Android)
- ✅ Fast development
- ✅ Great for hackathons
- ✅ Easy WebSocket integration

**Flutter:**
- ✅ Beautiful UI
- ✅ Great performance
- ✅ Single codebase

### Required Screens

1. **Dashboard/Home**
   - Current status overview
   - Active alerts count
   - Sensor status
   - Quick actions

2. **Alerts List**
   - Filter by status (active/resolved)
   - Filter by severity
   - Tap to view details
   - Swipe to resolve

3. **Alert Detail**
   - Full alert information
   - Related sensor data
   - Location
   - Timeline
   - Resolve button

4. **Sensors View**
   - List all sensors
   - Current readings
   - Status (online/offline)
   - Historical data (charts)

5. **User Profile**
   - Elderly person info
   - Caregiver contacts
   - Settings

### API Integration

```javascript
// Example: Fetch dashboard
const response = await fetch('http://YOUR_IP:8000/api/dashboard/summary');
const data = await response.json();

// Example: WebSocket for real-time updates
const ws = new WebSocket('ws://YOUR_IP:8000/api/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'alert') {
    // Show notification
  }
};
```

### UI/UX Recommendations

- 🎨 Use a calming color palette
- 🔴 Red for critical alerts
- 🟡 Yellow for warnings
- 🟢 Green for all good
- 📊 Charts for historical data (use Chart.js or Victory)
- 🔔 Push notifications for critical alerts
- 👵 Large text/buttons for accessibility

## 🔧 Hardware - TODO

### Recommended Hardware

**Base Station:**
- Raspberry Pi 4 / ESP32
- WiFi/Ethernet connectivity
- USB ports for sensors

**Sensors to Demo:**
1. DHT22 - Temperature & Humidity
2. MQ-2 - Smoke/Gas detector
3. PIR - Motion sensor
4. MPU6050 - Accelerometer (fall detection)

### Code Structure

```python
# Example: Send readings from hardware
import requests
import time

BASE_URL = "http://YOUR_API_IP:8000/api"
DEVICE_ID = "base-station-001"

def send_readings(temp, humidity, motion):
    data = {
        "device_id": DEVICE_ID,
        "readings": [
            {"sensor_type": "temperature", "value": temp, "unit": "°C"},
            {"sensor_type": "humidity", "value": humidity, "unit": "%"},
            {"sensor_type": "motion", "value": motion, "unit": "detected"}
        ]
    }
    requests.post(f"{BASE_URL}/sensors/readings/bulk", json=data)

while True:
    # Read from sensors
    temp = read_temperature()
    humidity = read_humidity()
    motion = read_motion()
    
    # Send to API
    send_readings(temp, humidity, motion)
    
    time.sleep(5)  # Send every 5 seconds
```

## 🎯 Hackathon Demo Strategy

### Setup (Before Demo)

1. **Backend Running:**
   ```bash
   cd backend
   ./run.sh
   python test_api.py  # Load demo data
   ```

2. **Simulator Running (backup):**
   ```bash
   python simulate_hardware.py  # In case hardware fails
   ```

3. **Mobile App Connected:**
   - Update API URL to your laptop's IP
   - Test all screens
   - Enable push notifications

### Demo Flow (5 minutes)

**Minute 1:** Introduce the problem
- Elderly people living alone
- Delayed emergency response
- Peace of mind for families

**Minute 2:** Show the mobile app
- Dashboard with sensor status
- Current readings
- Historical charts

**Minute 3:** Trigger an alert
- Create smoke/fall event
- Show real-time alert on mobile
- Demonstrate notification

**Minute 4:** Show resolution
- Caregiver acknowledges alert
- System updates in real-time
- Show data logging

**Minute 5:** Technical overview
- Show API docs (impressive!)
- Mention scalability
- Discuss future features

### Pro Tips

1. **Use 2 phones:**
   - One as "caregiver"
   - One as "demo device"
   - Show simultaneous updates

2. **Have backup plan:**
   - Use simulator if hardware fails
   - Pre-recorded video as backup
   - Screenshots ready

3. **Emphasize real-time:**
   - WebSocket is impressive
   - Show instant updates
   - Compare to polling

4. **Mention future features:**
   - Machine learning for patterns
   - Predictive alerts
   - Integration with smart home
   - Voice assistant integration

## 🚀 Next Steps

### Immediate (Next 2-4 hours)
- [ ] Set up mobile app project
- [ ] Create basic UI screens
- [ ] Connect to backend API
- [ ] Test data flow

### Soon (Next 4-8 hours)
- [ ] Hardware setup
- [ ] Sensor integration
- [ ] Real-time testing
- [ ] Polish UI/UX

### Before Demo
- [ ] End-to-end testing
- [ ] Prepare demo script
- [ ] Practice presentation
- [ ] Backup plans ready

## 📚 Resources

### Backend (Done!)
- API Docs: `http://localhost:8000/docs`
- Endpoints: See `backend/API_ENDPOINTS.md`
- Quick Start: See `backend/QUICKSTART.md`

### Mobile App
- React Native: https://reactnative.dev/
- Expo: https://expo.dev/
- WebSocket: https://github.com/react-native-community/react-native-webview

### Hardware
- Raspberry Pi: https://www.raspberrypi.org/
- ESP32: https://www.espressif.com/
- Python Requests: https://requests.readthedocs.io/

## 🆘 Troubleshooting

### Backend Issues
```bash
# Reset database
rm backend/safehouse.db
python -m app.main

# Reload demo data
python test_api.py
```

### Can't Connect from Mobile
```bash
# Find your IP
ifconfig | grep "inet "

# Make sure firewall allows port 8000
# Update mobile app to use: http://YOUR_IP:8000
```

### Hardware Issues
```bash
# Use simulator instead
python simulate_hardware.py
```

## 🏆 What Makes This Project Great

1. **Solves Real Problem:** Elderly safety is a growing concern
2. **Full Stack:** Hardware + Backend + Mobile
3. **Modern Tech:** FastAPI, WebSocket, Real-time updates
4. **Scalable:** Can handle multiple devices & users
5. **Extensible:** Easy to add new sensor types
6. **Production Ready:** Proper error handling, logging, validation
7. **Well Documented:** API docs, README, guides

## 💡 Future Enhancements

- 🤖 ML for behavior pattern analysis
- 🔮 Predictive alerts (unusual inactivity)
- 🏥 Integration with emergency services
- 👨‍⚕️ Telemedicine integration
- 📱 Family portal web app
- 🔐 Authentication & authorization
- ☁️ Cloud deployment (AWS/GCP/Azure)
- 📊 Advanced analytics dashboard

---

## 👥 Team Roles Suggestion

If you have a team:
- **Person A:** Mobile app development
- **Person B:** Hardware & sensors
- **Person C:** Backend tweaks & integration
- **Everyone:** Testing & demo prep

Good luck with your hackathon! 🚀

---

Built with ❤️ for NatHacks 2025

