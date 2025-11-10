#!/usr/bin/env python3
"""
Script to fill the database with arbitrary/sample data
Run this after starting the server to populate the database
"""

import requests
import random
from datetime import datetime, timedelta, timezone
import time

API_BASE = "http://localhost:8000/api"

def create_user(name, email, phone, is_primary=True):
    """Create a user"""
    response = requests.post(
        f"{API_BASE}/users",
        json={
            "name": name,
            "email": email,
            "phone": phone,
            "is_primary": is_primary
        }
    )
    if response.status_code in [200, 201]:
        print(f"✅ Created user: {name}")
        return response.json()
    elif "already exists" in response.text.lower():
        print(f"ℹ️  User {name} already exists (skipping)")
        return response.json() if response.status_code == 200 else None
    else:
        print(f"❌ Failed to create user {name}: {response.text}")
        return None

def create_sensor(device_id, name, sensor_type, location):
    """Create a sensor"""
    response = requests.post(
        f"{API_BASE}/sensors",
        json={
            "device_id": device_id,
            "name": name,
            "sensor_type": sensor_type,
            "location": location
        }
    )
    if response.status_code in [200, 201]:
        print(f"✅ Created sensor: {name} ({sensor_type}) in {location}")
        return response.json()
    elif "already exists" in response.text.lower():
        print(f"ℹ️  Sensor {name} already exists (skipping)")
        return response.json() if response.status_code == 200 else None
    else:
        print(f"❌ Failed to create sensor {name}: {response.text}")
        return None

def create_reading(device_id, sensor_type, value, unit, hours_ago=0):
    """Create a sensor reading"""
    timestamp = (datetime.now(timezone.utc) - timedelta(hours=hours_ago)).isoformat()
    response = requests.post(
        f"{API_BASE}/sensors/readings/bulk",
        json={
            "device_id": device_id,
            "readings": [
                {
                    "sensor_type": sensor_type,
                    "value": value,
                    "unit": unit,
                    "timestamp": timestamp
                }
            ]
        }
    )
    if response.status_code in [200, 201]:
        return response.json()
    return None

def main():
    print("🌱 Seeding database with sample data...\n")
    
    # Check if server is running
    try:
        response = requests.get("http://localhost:8000/health", timeout=2)
        if response.status_code != 200:
            print("❌ Server is not responding. Make sure the server is running!")
            print("   Run: python -m app.main")
            return
    except requests.exceptions.RequestException:
        print("❌ Cannot connect to server. Make sure it's running on http://localhost:8000")
        print("   Run: python -m app.main")
        return
    
    print("✅ Server is running\n")
    
    # Create users
    print("👥 Creating users...")
    user1 = create_user("John Smith", "john@example.com", "+1234567890", is_primary=True)
    user2 = create_user("Jane Smith", "jane@example.com", "+0987654321", is_primary=False)
    user3 = create_user("Emergency Contact", "emergency@example.com", "+1111111111", is_primary=False)
    print()
    
    # Create sensors
    print("📡 Creating sensors...")
    sensors = [
        create_sensor("temp-001", "Living Room Temp", "temperature", "Living Room"),
        create_sensor("temp-002", "Bedroom Temp", "temperature", "Bedroom"),
        create_sensor("humidity-001", "Living Room Humidity", "humidity", "Living Room"),
        create_sensor("smoke-001", "Kitchen Smoke Detector", "smoke", "Kitchen"),
        create_sensor("motion-001", "Hallway Motion", "motion", "Hallway"),
        create_sensor("co2-001", "Living Room CO2", "co2", "Living Room"),
        create_sensor("heart-001", "Wearable Heart Rate", "heart_rate", "On Person"),
        create_sensor("fall-001", "Fall Detection", "fall_detection", "On Person"),
        create_sensor("door-001", "Front Door", "door", "Front Entrance"),
        create_sensor("water-001", "Basement Water", "water_leak", "Basement"),
    ]
    print()
    
    # Create historical readings (last 24 hours)
    print("📊 Creating historical sensor readings...")
    sensor_configs = [
        ("temp-001", "temperature", 20.0, 25.0, "°C"),
        ("temp-002", "temperature", 18.0, 22.0, "°C"),
        ("humidity-001", "humidity", 40.0, 60.0, "%"),
        ("smoke-001", "smoke", 0.0, 0.3, ""),
        ("motion-001", "motion", 0, 1, ""),
        ("co2-001", "co2", 400.0, 800.0, "ppm"),
        ("heart-001", "heart_rate", 60.0, 80.0, "bpm"),
        ("fall-001", "fall_detection", 0, 0, ""),
        ("door-001", "door", 0, 1, ""),
        ("water-001", "water_leak", 0, 0, ""),
    ]
    
    # Create readings for last 24 hours (one per hour)
    for hours_ago in range(24, 0, -1):
        for device_id, sensor_type, min_val, max_val, unit in sensor_configs:
            # Add some randomness and variation
            if sensor_type == "temperature":
                value = random.uniform(min_val, max_val) + random.uniform(-2, 2)
            elif sensor_type in ["motion", "door", "fall_detection", "water_leak"]:
                value = random.choice([0, 1]) if random.random() > 0.7 else 0
            elif sensor_type == "smoke":
                value = random.uniform(min_val, max_val) if random.random() > 0.95 else 0
            else:
                value = random.uniform(min_val, max_val)
            
            create_reading(device_id, sensor_type, round(value, 2), unit, hours_ago)
        time.sleep(0.1)  # Small delay to avoid overwhelming the server
    
    # Create some recent readings with alerts (high temp, smoke, etc.)
    print("\n🚨 Creating alert-triggering readings...")
    create_reading("temp-001", "temperature", 36.5, "°C", hours_ago=0.5)  # High temp
    create_reading("smoke-001", "smoke", 0.8, "", hours_ago=0.3)  # Smoke detected!
    create_reading("co2-001", "co2", 1200.0, "ppm", hours_ago=0.2)  # High CO2
    
    print("\n✅ Database seeding complete!")
    print("\n📊 Check your data:")
    print("   - Dashboard: http://localhost:8000/api/dashboard")
    print("   - Alerts: http://localhost:8000/api/alerts/active")
    print("   - API Docs: http://localhost:8000/docs")

if __name__ == "__main__":
    main()

