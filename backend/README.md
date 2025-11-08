# SafeHouse Backend API

Backend API for SafeHouse - An elderly safety monitoring system that collects environmental data from sensors to ensure the safety of elderly people living alone.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env if needed (optional for demo)
```

### 3. Run the Server

```bash
# Using Python
python -m app.main

# OR using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Base URL:** `http://localhost:8000`
- **Interactive Docs (Swagger):** `http://localhost:8000/docs`
- **Alternative Docs (ReDoc):** `http://localhost:8000/redoc`

## 📱 API Endpoints

### For Mobile App

#### Dashboard
- `GET /api/dashboard/` - Get complete dashboard data
- `GET /api/dashboard/summary` - Get quick summary for home screen

#### Alerts
- `GET /api/alerts/active` - Get all active alerts
- `GET /api/alerts/critical` - Get critical alerts
- `POST /api/alerts/{alert_id}/resolve` - Mark alert as resolved

#### Sensors
- `GET /api/sensors/` - Get all sensors
- `GET /api/sensors/status` - Get sensor status overview
- `GET /api/sensors/{sensor_id}/readings` - Get readings for a sensor

#### Real-time Updates
- `WS /api/ws` - WebSocket connection for real-time updates

### For Hardware Base Station

#### Send Sensor Data
- `POST /api/sensors/readings/bulk` - Send multiple readings at once

Example payload:
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

#### Register New Sensor
- `POST /api/sensors/` - Register a new sensor

```json
{
  "device_id": "base-station-001",
  "name": "Living Room Temp Sensor",
  "sensor_type": "temperature",
  "location": "Living Room"
}
```

## 🗄️ Database Models

### Sensor Types Supported
- `temperature` - Temperature sensors
- `humidity` - Humidity sensors
- `motion` - Motion detection
- `smoke` - Smoke detectors
- `co2` - CO2 level sensors
- `heart_rate` - Heart rate monitors
- `fall_detection` - Fall detection sensors
- `door` - Door open/close sensors
- `water_leak` - Water leak detectors

### Alert Levels
- `info` - Informational
- `warning` - Warning level
- `critical` - Critical - immediate attention required

## 🧪 Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:8000/health

# Create a user
curl -X POST http://localhost:8000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "is_primary": true
  }'

# Register a sensor
curl -X POST http://localhost:8000/api/sensors/ \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "base-station-001",
    "name": "Living Room Temp",
    "sensor_type": "temperature",
    "location": "Living Room"
  }'

# Send sensor readings
curl -X POST http://localhost:8000/api/sensors/readings/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "base-station-001",
    "readings": [
      {"sensor_type": "temperature", "value": 22.5, "unit": "°C"},
      {"sensor_type": "humidity", "value": 65, "unit": "%"}
    ]
  }'

# Get dashboard data
curl http://localhost:8000/api/dashboard/
```

### Using the Interactive Docs

1. Start the server
2. Open `http://localhost:8000/docs` in your browser
3. Click "Try it out" on any endpoint
4. Fill in the parameters and click "Execute"

## 🔌 WebSocket Real-time Updates

Connect to `ws://localhost:8000/api/ws` to receive real-time updates about:
- New alerts
- Sensor readings
- System status changes

Example using JavaScript:
```javascript
const ws = new WebSocket('ws://localhost:8000/api/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
  
  if (data.type === 'alert') {
    // Handle new alert
    console.log('New alert:', data.data);
  }
};
```

## 📦 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app initialization
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   └── routers/
│       ├── sensors.py       # Sensor endpoints
│       ├── alerts.py        # Alert endpoints
│       ├── users.py         # User endpoints
│       ├── dashboard.py     # Dashboard endpoints
│       └── websocket.py     # WebSocket endpoint
├── requirements.txt
├── .env.example
└── README.md
```

## 🎯 Alert Conditions

The API automatically creates alerts based on sensor readings:

- **Temperature:**
  - > 35°C: High temperature warning
  - < 10°C: Low temperature warning

- **Smoke:**
  - > 0.5: Smoke detected (CRITICAL)

- **Fall Detection:**
  - > 0: Fall detected (CRITICAL)

- **CO2:**
  - > 1000 ppm: High CO2 warning

## 🔧 Development

### Adding New Sensor Types

1. Add to `SensorType` enum in `models.py`
2. Add alert logic in `sensors.py` (`_check_and_create_alerts` function)
3. Update documentation

### Database Migrations

For production, consider using Alembic for migrations:
```bash
pip install alembic
alembic init migrations
```

For hackathon/demo, the database auto-creates on startup.

## 📝 Notes

- SQLite database is used for easy setup (no external DB required)
- CORS is open for development - restrict in production
- Auto-reload is enabled for development
- Database file: `safehouse.db` (created automatically)

## 🆘 Troubleshooting

**Database errors:**
- Delete `safehouse.db` and restart the server to reset

**Port already in use:**
- Change `API_PORT` in `.env` file
- Or kill the process using port 8000

**Import errors:**
- Make sure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

## 🎉 For Your Hackathon Demo

1. Start the API server
2. Open `http://localhost:8000/docs` on a big screen
3. Create a user via the API
4. Register your sensors
5. Have your hardware send readings
6. Show real-time alerts appearing in the mobile app
7. Demo the WebSocket connection showing live updates

Good luck! 🚀

