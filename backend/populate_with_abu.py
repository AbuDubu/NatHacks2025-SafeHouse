#!/usr/bin/env python3
"""
Populate database with extensive sample data
Creates lots of users, sensors, readings, and alerts for demo purposes

Schema Compliance:
- Sensor types must match SensorType enum: temperature, humidity, motion, smoke, co2,
  heart_rate, fall_detection, door, water_leak
- Sensor creation does NOT include user_id (removed from schema)
- Bulk readings do NOT include user_id (removed from schema)
- All sensor types must be lowercase to match enum values
"""

import requests
import random
from datetime import datetime, timedelta, timezone
import time

API_BASE = "http://localhost:8000/api"

def create_user(name, email, phone, is_primary=True, guardian_id=None):
    """Create a user"""
    user_data = {
        "name": name,
        "email": email,
        "phone": phone,
        "is_primary": is_primary
    }
    if guardian_id is not None:
        user_data["guardian_id"] = guardian_id
    
    response = requests.post(
        f"{API_BASE}/users",
        json=user_data
    )
    if response.status_code in [200, 201]:
        return response.json()
    elif "already exists" in response.text.lower():
        # Try to get existing user and update guardian_id if needed
        if guardian_id is not None:
            users_response = requests.get(f"{API_BASE}/users")
            if users_response.status_code == 200:
                users = users_response.json()
                existing_user = next((u for u in users if u["email"] == email), None)
                if existing_user and existing_user.get("guardian_id") != guardian_id:
                    # Update guardian_id via PATCH if endpoint exists, or skip
                    pass
        return None  # Already exists, skip
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
        return response.json()
    elif "already exists" in response.text.lower():
        return None  # Already exists, skip
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
    print("🌱 Populating database with extensive sample data...\n")
    
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
    
    # Create multiple users
    print("👥 Creating users...")
    
    # First, create guardians (non-primary users)
    guardians = [
        ("Abubakar Mir", "emergency@example.com", "+17808079943", False),
        ("Jane Smith", "jane@example.com", "+0987654321", False),
        ("Dr. Sarah Johnson", "sarah@example.com", "+1222333444", False),
        ("Neighbor Bob", "bob@example.com", "+1555666777", False),
    ]
    
    guardian_map = {}  # Map email to guardian_id
    created_users = 0
    
    # Create guardians first
    for name, email, phone, is_primary in guardians:
        user = create_user(name, email, phone, is_primary)
        if user:
            guardian_map[email] = user["id"]
            created_users += 1
            print(f"  ✅ Created guardian: {name}")
        else:
            # Try to get existing user
            users_response = requests.get(f"{API_BASE}/users")
            if users_response.status_code == 200:
                users = users_response.json()
                existing_user = next((u for u in users if u["email"] == email), None)
                if existing_user:
                    guardian_map[email] = existing_user["id"]
                    print(f"  ℹ️  Using existing guardian: {name}")
    
    # Now create residents (primary users) with guardian links
    residents = [
        ("Hrishi Shah", "hrishi@example.com", "+17807427447", True, "emergency@example.com"),  # Under Abubakar's care
    ]
    
    for name, email, phone, is_primary, guardian_email in residents:
        guardian_id = guardian_map.get(guardian_email)
        user = create_user(name, email, phone, is_primary, guardian_id)
        if user:
            created_users += 1
            guardian_name = next((g[0] for g in guardians if g[1] == guardian_email), "Unknown")
            print(f"  ✅ Created resident: {name} (under {guardian_name}'s care)")
        else:
            # Try to update existing user's guardian_id
            users_response = requests.get(f"{API_BASE}/users")
            if users_response.status_code == 200:
                users = users_response.json()
                existing_user = next((u for u in users if u["email"] == email), None)
                if existing_user and guardian_id and existing_user.get("guardian_id") != guardian_id:
                    # Update guardian_id via PATCH
                    update_response = requests.patch(
                        f"{API_BASE}/users/{existing_user['id']}",
                        json={"guardian_id": guardian_id}
                    )
                    if update_response.status_code == 200:
                        guardian_name = next((g[0] for g in guardians if g[1] == guardian_email), "Unknown")
                        print(f"  ✅ Updated resident: {name} (now under {guardian_name}'s care)")
                    else:
                        guardian_name = next((g[0] for g in guardians if g[1] == guardian_email), "Unknown")
                        print(f"  ℹ️  Resident {name} exists (should be under {guardian_name}'s care)")
                elif existing_user:
                    guardian_name = next((g[0] for g in guardians if g[1] == guardian_email), "Unknown")
                    print(f"  ℹ️  Using existing resident: {name} (under {guardian_name}'s care)")
    
    print(f"  📊 Created/updated {created_users} new users\n")
    
    # Create many sensors across different locations
    # NOTE: Only using valid SensorType enum values (no STEP_COUNT, GLUCOSE, SLEEP, etc.)
    print("📡 Creating sensors...")
    locations = ["Living Room", "Bedroom"]
    sensor_types = [
        ("temperature", "°C", 18, 25),
        ("humidity", "%", 30, 70),
        ("motion", "", 0, 1),
        ("smoke", "", 0, 0.5),
        ("co2", "ppm", 400, 1000),
        ("heart_rate", "bpm", 60, 100),
        ("fall_detection", "", 0, 0),
        ("door", "", 0, 1),
        ("water_leak", "", 0, 0),
    ]
    
    sensors_created = 0
    sensor_list = []
    
    for location in locations:
        for sensor_type, unit, min_val, max_val in sensor_types:
            device_id = f"{sensor_type}-{location.lower().replace(' ', '-')}-{random.randint(100, 999)}"
            name = f"{location} {sensor_type.title()}"
            
            if create_sensor(device_id, name, sensor_type, location):
                sensors_created += 1
                sensor_list.append((device_id, sensor_type, unit, min_val, max_val))
                print(f"  ✅ Created: {name} in {location}")
    
    print(f"  📊 Created {sensors_created} new sensors\n")
    
    # Generate 7 days of historical data (one reading per hour)
    print("📊 Creating 7 days of historical sensor readings...")
    total_readings = 0
    
    for day in range(7, 0, -1):  # Last 7 days
        for hour in range(24, 0, -1):  # 24 hours per day
            hours_ago = (day * 24) + hour
            
            for device_id, sensor_type, unit, min_val, max_val in sensor_list:
                # Generate realistic values with some variation
                if sensor_type == "temperature":
                    # Temperature varies by time of day
                    base_temp = 20 + 3 * (1 - abs(hour - 12) / 12)  # Warmer at midday
                    value = base_temp + random.uniform(-2, 2)
                elif sensor_type == "humidity":
                    value = random.uniform(min_val, max_val)
                elif sensor_type in ["motion", "door"]:
                    # More motion during day (6am-10pm)
                    if 6 <= hour <= 22:
                        value = 1 if random.random() > 0.3 else 0
                    else:
                        value = 1 if random.random() > 0.9 else 0
                elif sensor_type == "smoke":
                    value = random.uniform(min_val, max_val) if random.random() > 0.98 else 0
                elif sensor_type == "co2":
                    value = random.uniform(min_val, max_val)
                elif sensor_type == "heart_rate":
                    value = random.uniform(min_val, max_val)
                elif sensor_type in ["fall_detection", "water_leak"]:
                    value = 1 if random.random() > 0.99 else 0  # Rare events
                else:
                    value = random.uniform(min_val, max_val)
                
                create_reading(device_id, sensor_type, round(value, 2), unit, hours_ago)
                total_readings += 1
            
            if hour % 6 == 0:  # Progress update every 6 hours
                print(f"  ⏳ Processed {total_readings} readings...")
    
    print(f"  ✅ Created {total_readings} historical readings\n")
    
    # Create some alert-triggering readings (recent)
    print("🚨 Creating recent alert-triggering readings...")
    alerts_created = 0
    
    # High temperature alert
    temp_sensors = [s for s in sensor_list if s[1] == "temperature"]
    if temp_sensors:
        device_id, _, unit, _, _ = random.choice(temp_sensors)
        create_reading(device_id, "temperature", 36.5, unit, hours_ago=0.5)
        alerts_created += 1
        print(f"  🔥 High temperature reading created")
    
    # Smoke alert
    smoke_sensors = [s for s in sensor_list if s[1] == "smoke"]
    if smoke_sensors:
        device_id, _, unit, _, _ = random.choice(smoke_sensors)
        create_reading(device_id, "smoke", 0.8, unit, hours_ago=0.3)
        alerts_created += 1
        print(f"  💨 Smoke detection reading created")
    
    # High CO2 alert
    co2_sensors = [s for s in sensor_list if s[1] == "co2"]
    if co2_sensors:
        device_id, _, unit, _, _ = random.choice(co2_sensors)
        create_reading(device_id, "co2", 1200.0, unit, hours_ago=0.2)
        alerts_created += 1
        print(f"  ⚠️  High CO2 reading created")
    
    # Fall detection alert
    fall_sensors = [s for s in sensor_list if s[1] == "fall_detection"]
    if fall_sensors:
        device_id, _, unit, _, _ = random.choice(fall_sensors)
        create_reading(device_id, "fall_detection", 1, unit, hours_ago=0.1)
        alerts_created += 1
        print(f"  🚨 Fall detection reading created")
    
    print(f"  ✅ Created {alerts_created} alert-triggering readings\n")
    
    print("=" * 60)
    print("✅ Database population complete!")
    print("=" * 60)
    print(f"\n📊 Summary:")
    total_users = len(guardians) + len(residents)
    print(f"   - Users: {total_users} total ({len(guardians)} guardians, {len(residents)} residents)")
    print(f"   - Sensors: {len(sensor_list)} total")
    print(f"   - Historical readings: {total_readings}")
    print(f"   - Alert-triggering readings: {alerts_created}")
    print(f"\n🔗 Check your data:")
    print(f"   - Dashboard: http://localhost:8000/api/dashboard")
    print(f"   - Alerts: http://localhost:8000/api/alerts/active")
    print(f"   - Sensors: http://localhost:8000/api/sensors")
    print(f"   - API Docs: http://localhost:8000/docs")

if __name__ == "__main__":
    main()

