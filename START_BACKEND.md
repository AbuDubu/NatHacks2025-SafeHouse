# 🚀 How to Start the Backend

## Quick Start (Easiest Way)

### Step 1: Start the Backend Server

Open a terminal and run:

```bash
cd backend
source venv/bin/activate
python -m app.main
```

The server will start at **http://localhost:8000**

You should see:
```
🏠 Starting SafeHouse API...
✅ Database initialized
📡 API running on http://0.0.0.0:8000
📚 API docs available at http://localhost:8000/docs
```

### Step 2: Load Demo Data (Optional but Recommended)

Open a **NEW terminal** (keep the server running in the first one):

```bash
cd backend
source venv/bin/activate
python test_api.py
```

This will create:
- Sample users
- Sample sensors
- Sample sensor readings
- Sample alerts

## Alternative: Use the Run Script

```bash
cd backend
chmod +x run.sh
./run.sh
```

## Verify It's Working

1. **Check API Health:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **View API Documentation:**
   Open in browser: http://localhost:8000/docs

3. **Test an Endpoint:**
   ```bash
   curl http://localhost:8000/api/users/primary
   ```

## Troubleshooting

### Port 8000 Already in Use?

```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9

# Then start again
python -m app.main
```

### Virtual Environment Not Found?

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Database Issues?

```bash
cd backend
rm safehouse.db
python -m app.main  # This will recreate it
```

## For Mobile App Connection

- **iOS Simulator:** Uses `http://localhost:8000/api` ✅ (Already configured)
- **Android Emulator:** Uses `http://10.0.2.2:8000/api` ✅ (Already configured)
- **Physical Device:** You need your computer's IP address

To find your IP:
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

Then update `frontend/lib/api.ts` with your IP address.

