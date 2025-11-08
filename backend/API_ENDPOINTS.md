# SafeHouse API Endpoints Reference

Quick reference for all API endpoints - perfect for mobile app development!

## Base URL
```
http://localhost:8000/api
```

---

## 📱 Mobile App Endpoints

### Dashboard

#### Get Complete Dashboard
```http
GET /api/dashboard/
```
**Query Params:** `user_id` (optional, defaults to primary user)

**Response:**
```json
{
  "user": {...},
  "active_alerts": [...],
  "recent_readings": [...],
  "sensor_status": {...}
}
```

#### Get Dashboard Summary
```http
GET /api/dashboard/summary
```
**Query Params:** `user_id` (optional)

**Response:**
```json
{
  "user_name": "Margaret Smith",
  "alerts": {
    "total": 5,
    "active": 2,
    "critical": 1
  },
  "sensors": {
    "total": 8,
    "active": 7,
    "offline": 1
  },
  "recent_activity": {
    "readings_last_hour": 120
  }
}
```

---

### Alerts

#### Get Active Alerts
```http
GET /api/alerts/active
```
**Query Params:** `user_id` (optional)

#### Get Critical Alerts Only
```http
GET /api/alerts/critical
```
**Query Params:** `user_id` (optional)

#### Get All Alerts (with filters)
```http
GET /api/alerts/
```
**Query Params:**
- `user_id` (optional)
- `is_resolved` (optional, true/false)
- `hours` (optional, last N hours)
- `limit` (optional, default 100)

#### Get Specific Alert
```http
GET /api/alerts/{alert_id}
```

#### Resolve an Alert
```http
POST /api/alerts/{alert_id}/resolve
```

**Response:** Updated alert object

#### Update Alert
```http
PATCH /api/alerts/{alert_id}
```
**Body:**
```json
{
  "is_resolved": true
}
```

---

### Sensors

#### Get All Sensors
```http
GET /api/sensors/
```
**Query Params:**
- `is_active` (optional, true/false)
- `sensor_type` (optional, e.g., "temperature")

#### Get Sensor Status Overview
```http
GET /api/sensors/status
```

**Response:**
```json
{
  "total_sensors": 8,
  "active_sensors": 7,
  "inactive_sensors": 1,
  "sensors": [...]
}
```

#### Get Specific Sensor
```http
GET /api/sensors/{sensor_id}
```

#### Get Sensor Readings
```http
GET /api/sensors/{sensor_id}/readings
```
**Query Params:**
- `limit` (optional, default 100)
- `hours` (optional, last N hours)

---

### Users

#### Get Primary User
```http
GET /api/users/primary
```

#### Get All Users
```http
GET /api/users/
```

#### Get Specific User
```http
GET /api/users/{user_id}
```

---

### WebSocket (Real-time Updates)

#### Connect to WebSocket
```
ws://localhost:8000/api/ws
```

**Messages received:**
```json
// Alert
{
  "type": "alert",
  "data": {...},
  "timestamp": "2025-11-08T12:34:56"
}

// Reading
{
  "type": "reading",
  "data": {...},
  "timestamp": "2025-11-08T12:34:56"
}

// Pong (response to ping)
{
  "type": "pong",
  "timestamp": "2025-11-08T12:34:56"
}
```

**Send ping:**
```json
{
  "type": "ping"
}
```

---

## 🔧 Hardware Endpoints

### Register a Sensor
```http
POST /api/sensors/
```
**Body:**
```json
{
  "device_id": "base-station-001",
  "name": "Living Room Temperature",
  "sensor_type": "temperature",
  "location": "Living Room",
  "is_active": true
}
```

### Send Single Reading
```http
POST /api/sensors/readings
```
**Body:**
```json
{
  "sensor_id": 1,
  "value": 22.5,
  "unit": "°C"
}
```

### Send Bulk Readings (Recommended)
```http
POST /api/sensors/readings/bulk
```
**Body:**
```json
{
  "device_id": "base-station-001",
  "readings": [
    {
      "sensor_type": "temperature",
      "value": 22.5,
      "unit": "°C"
    },
    {
      "sensor_type": "humidity",
      "value": 65,
      "unit": "%"
    }
  ]
}
```

### Update Sensor
```http
PATCH /api/sensors/{sensor_id}
```
**Body:**
```json
{
  "name": "New Name",
  "location": "New Location",
  "is_active": false
}
```

---

## 👤 User Management

### Create User
```http
POST /api/users/
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "is_primary": true
}
```

---

## 🏥 Health Check

### API Status
```http
GET /
```
or
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-08T12:34:56.789012",
  "version": "1.0.0"
}
```

---

## 📊 Sensor Types

- `temperature` - Temperature in °C
- `humidity` - Humidity in %
- `motion` - Motion detected (0 or 1)
- `smoke` - Smoke level (0-1)
- `co2` - CO2 in ppm
- `heart_rate` - Heart rate in bpm
- `fall_detection` - Fall detected (0 or 1)
- `door` - Door status (0=closed, 1=open)
- `water_leak` - Water leak detected (0 or 1)

## ⚠️ Alert Levels

- `info` - Informational
- `warning` - Warning (needs attention)
- `critical` - Critical (immediate action required)

## 🔔 Automatic Alerts

Alerts are automatically created for:

| Condition | Trigger | Level |
|-----------|---------|-------|
| Temperature > 35°C | High temperature | WARNING |
| Temperature < 10°C | Low temperature | WARNING |
| Smoke > 0.5 | Smoke detected | CRITICAL |
| Fall Detection > 0 | Fall detected | CRITICAL |
| CO2 > 1000 ppm | High CO2 | WARNING |

---

## 🧪 Testing

Use the interactive documentation at `http://localhost:8000/docs` to test all endpoints!

Or use cURL:
```bash
curl http://localhost:8000/api/dashboard/summary
```

