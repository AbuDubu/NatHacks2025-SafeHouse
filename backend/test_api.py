#!/usr/bin/env python3
"""
Quick test script to populate the SafeHouse API with demo data
Run this after starting the server to have data for your mobile app demo
"""

import requests
import random
import time
from datetime import datetime

BASE_URL = "http://localhost:8000/api"


def print_response(title, response):
    """Pretty print API response"""
    print(f"\n{'='*50}")
    print(f"📍 {title}")
    print(f"{'='*50}")
    if response.status_code < 300:
        print(f"✅ Status: {response.status_code}")
        print(f"📦 Response: {response.json()}")
    else:
        print(f"❌ Status: {response.status_code}")
        print(f"❌ Error: {response.text}")


def main():
    print("🏠 SafeHouse API Test Script")
    print("=" * 50)

    # 1. Create a user
    print("\n1️⃣  Creating primary user...")
    user_data = {
        "name": "Margaret Smith",
        "email": "margaret@example.com",
        "phone": "+1-555-0123",
        "is_primary": True,
    }
    response = requests.post(f"{BASE_URL}/users/", json=user_data)
    print_response("Create User", response)
    user_id = response.json().get("id") if response.status_code < 300 else None

    # 2. Create sensors
    print("\n2️⃣  Registering sensors...")
    sensors = [
        {
            "device_id": "base-station-001",
            "name": "Living Room Temperature",
            "sensor_type": "temperature",
            "location": "Living Room",
        },
        {
            "device_id": "base-station-002",
            "name": "Bedroom Temperature",
            "sensor_type": "temperature",
            "location": "Bedroom",
        },
        {
            "device_id": "base-station-003",
            "name": "Living Room Motion",
            "sensor_type": "motion",
            "location": "Living Room",
        },
        {
            "device_id": "base-station-004",
            "name": "Kitchen Smoke Detector",
            "sensor_type": "smoke",
            "location": "Kitchen",
        },
    ]

    for sensor in sensors:
        response = requests.post(f"{BASE_URL}/sensors/", json=sensor)
        print_response(f"Register {sensor['name']}", response)
        time.sleep(0.2)

    # 3. Send some sensor readings
    print("\n3️⃣  Sending sensor readings...")

    # Normal readings
    normal_readings = {
        "device_id": "base-station-001",
        "readings": [
            {"sensor_type": "temperature", "value": 22.5, "unit": "°C"},
            {"sensor_type": "motion", "value": 1, "unit": "detected"},
        ],
    }
    response = requests.post(f"{BASE_URL}/sensors/readings/bulk", json=normal_readings)
    print_response("Normal Readings", response)

    time.sleep(1)

    # Critical reading to trigger alert
    print("\n4️⃣  Triggering a critical alert...")
    alert_readings = {
        "device_id": "base-station-001",
        "readings": [
            {"sensor_type": "smoke", "value": 0.8, "unit": "level"},
        ],
    }
    response = requests.post(f"{BASE_URL}/sensors/readings/bulk", json=alert_readings)
    print_response("Critical Smoke Alert", response)

    time.sleep(0.5)

    # 5. Get active alerts
    print("\n5️⃣  Checking active alerts...")
    response = requests.get(f"{BASE_URL}/alerts/active")
    print_response("Active Alerts", response)

    # 6. Get dashboard
    print("\n6️⃣  Getting dashboard data...")
    response = requests.get(f"{BASE_URL}/dashboard/")
    print_response("Dashboard", response)

    # 7. Get sensor status
    print("\n7️⃣  Getting sensor status...")
    response = requests.get(f"{BASE_URL}/sensors/status")
    print_response("Sensor Status", response)

    print("\n" + "=" * 50)
    print("✅ Demo data loaded successfully!")
    print("=" * 50)
    print("\n📱 Your mobile app can now connect to:")
    print(f"   API: {BASE_URL}")
    print(f"   Docs: http://localhost:8000/docs")
    print(f"   WebSocket: ws://localhost:8000/api/ws")
    print("\n🎉 Ready for your hackathon demo!")


if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to API server")
        print("Make sure the server is running on http://localhost:8000")
        print("Run: python -m app.main")
    except Exception as e:
        print(f"\n❌ Error: {e}")
