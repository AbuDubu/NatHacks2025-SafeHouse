#!/usr/bin/env python3
"""
Hardware Simulator for SafeHouse
Simulates a base station sending sensor readings to the API
Use this for testing without actual hardware
"""

import requests
import random
import time
from datetime import datetime

BASE_URL = "http://localhost:8000/api"
DEVICE_ID = "base-station-001"


def simulate_readings():
    """Simulate realistic sensor readings"""

    # Simulate temperature (18-28°C normal range)
    temperature = round(random.uniform(18, 28), 1)

    # Simulate humidity (40-70%)
    humidity = round(random.uniform(40, 70), 1)

    # Simulate motion (0 or 1)
    motion = random.choice([0, 1])

    # Simulate smoke (normally 0, rarely triggers)
    smoke = 0 if random.random() > 0.01 else round(random.uniform(0.5, 1.0), 2)

    # Simulate CO2 (400-800 ppm normal)
    co2 = round(random.uniform(400, 800), 0)

    return {
        "device_id": DEVICE_ID,
        "readings": [
            {"sensor_type": "temperature", "value": temperature, "unit": "°C"},
            {"sensor_type": "humidity", "value": humidity, "unit": "%"},
            {"sensor_type": "motion", "value": motion, "unit": "detected"},
            {"sensor_type": "smoke", "value": smoke, "unit": "level"},
            {"sensor_type": "co2", "value": co2, "unit": "ppm"},
        ],
    }


def send_readings(readings):
    """Send readings to API"""
    try:
        response = requests.post(
            f"{BASE_URL}/sensors/readings/bulk", json=readings, timeout=5
        )

        timestamp = datetime.now().strftime("%H:%M:%S")

        if response.status_code == 200:
            print(f"[{timestamp}] ✅ Sent readings:")
            for reading in readings["readings"]:
                value = reading["value"]
                unit = reading.get("unit", "")
                sensor = reading["sensor_type"]

                # Color code based on sensor type
                if sensor == "temperature":
                    print(f"  🌡️  {sensor}: {value}{unit}")
                elif sensor == "humidity":
                    print(f"  💧 {sensor}: {value}{unit}")
                elif sensor == "motion":
                    status = "🟢 Detected" if value > 0 else "⚪ None"
                    print(f"  🚶 {sensor}: {status}")
                elif sensor == "smoke":
                    if value > 0.5:
                        print(f"  🔥 {sensor}: ⚠️  {value}{unit} - ALERT!")
                    else:
                        print(f"  💨 {sensor}: {value}{unit}")
                elif sensor == "co2":
                    print(f"  🫁 {sensor}: {value}{unit}")
            print()
        else:
            print(f"[{timestamp}] ❌ Error: {response.status_code}")
            print(f"  {response.text}\n")

    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API. Make sure the server is running!")
        print("   Run: python -m app.main")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

    return True


def main():
    print("🏠 SafeHouse Hardware Simulator")
    print("=" * 50)
    print(f"📡 Sending readings to: {BASE_URL}")
    print(f"🔧 Device ID: {DEVICE_ID}")
    print("=" * 50)
    print("\n⏱️  Sending readings every 5 seconds...")
    print("Press Ctrl+C to stop\n")

    interval = 5  # seconds between readings

    try:
        while True:
            readings = simulate_readings()
            if not send_readings(readings):
                break
            time.sleep(interval)

    except KeyboardInterrupt:
        print("\n\n👋 Stopping simulator...")
        print("✅ Done!")


if __name__ == "__main__":
    main()
