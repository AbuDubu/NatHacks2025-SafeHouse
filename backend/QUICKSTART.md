# 🚀 SafeHouse Backend - Quick Start Guide

## Get Running in 3 Steps

### Step 1: Install & Setup (2 minutes)

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install everything
pip install -r requirements.txt
```

### Step 2: Start the Server (30 seconds)

```bash
# Option A: Easy way
./run.sh

# Option B: Direct way
python -m app.main
```

Server will start at: **http://localhost:8000**

### Step 3: Load Demo Data (30 seconds)

Open a NEW terminal:

```bash
cd backend
source venv/bin/activate
python test_api.py
```

## 🎉 You're Ready!

Your API is now running with demo data!

### View the Interactive API Docs
Open in browser: **http://localhost:8000/docs**

### Test with Your Mobile App
- **API Base URL:** `http://localhost:8000/api`
- **WebSocket:** `ws://localhost:8000/api/ws`

### Simulate Hardware (Optional)

Want to see live sensor data without hardware?

```bash
python simulate_hardware.py
```

This will send sensor readings every 5 seconds!

## 📱 Key Endpoints for Your Mobile App

```
GET  /api/dashboard/           - Full dashboard data
GET  /api/dashboard/summary    - Quick summary
GET  /api/alerts/active        - Active alerts
GET  /api/alerts/critical      - Critical alerts only
POST /api/alerts/{id}/resolve  - Mark alert resolved
GET  /api/sensors/             - All sensors
GET  /api/sensors/status       - Sensor overview
WS   /api/ws                   - Real-time updates
```

## 🔧 Hardware Integration

Your base station should POST to:

```
POST /api/sensors/readings/bulk

{
  "device_id": "base-station-001",
  "readings": [
    {"sensor_type": "temperature", "value": 22.5, "unit": "°C"},
    {"sensor_type": "humidity", "value": 65, "unit": "%"}
  ]
}
```

## 🆘 Troubleshooting

**Port 8000 already in use?**
```bash
lsof -ti:8000 | xargs kill -9
```

**Database issues?**
```bash
rm safehouse.db
python -m app.main  # Recreates it
```

**Need to reset everything?**
```bash
rm safehouse.db
python test_api.py  # Reloads demo data
```

## 🎯 Demo Tips

1. **Show the Swagger Docs** - Looks professional!
2. **Use the hardware simulator** - More reliable than real hardware during demo
3. **Create a smoke alert** - Most dramatic for judges
4. **Show the WebSocket** - Real-time updates are impressive

## 📊 Available Sensor Types

- `temperature` - Temperature sensors
- `humidity` - Humidity sensors  
- `motion` - Motion detection
- `smoke` - Smoke detectors (CRITICAL alerts!)
- `co2` - CO2 level sensors
- `heart_rate` - Heart rate monitors
- `fall_detection` - Fall detection (CRITICAL alerts!)
- `door` - Door open/close sensors
- `water_leak` - Water leak detectors

## 🏆 Hackathon Pro Tips

- The database auto-creates, no migrations needed
- CORS is open for easy mobile development
- All dates are UTC timestamps
- Alerts auto-generate based on sensor thresholds
- WebSocket broadcasts to all connected clients

Good luck! 🍀

