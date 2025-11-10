# Download the helper library from https://www.twilio.com/docs/python/install
import os
from twilio.rest import Client
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import Response
import uvicorn
import threading
import time
from datetime import datetime
from sqlalchemy.orm import Session
import statistics

# Database imports
from app.database import SessionLocal, init_db
from app.models import Sensor, SensorReading, SensorType

load_dotenv()

app = FastAPI()

NGROK_URL = os.getenv("NGROK_URL", "").rstrip("/")

# Initialize Twilio client at module level
account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
client = Client(account_sid, auth_token) if account_sid and auth_token else None

# Temperature thresholds
TEMPERATURE_THRESHOLD = 100.0  # Danger threshold - trigger calls
WARNING_THRESHOLD = 98.0  # Warning threshold - send SMS

# Track last processed reading ID to avoid duplicate alerts
last_processed_reading_id = None

# Track last processed anomaly reading ID to avoid duplicate anomaly alerts
last_processed_anomaly_reading_id = None

# Track if user confirmed OK (pressed 1) during call
user_confirmed_ok = False
@app.get("/voice")
@app.post("/voice")
def voice():
    return Response(
        content=f'''<Response>
  <Say voice="alice">Press 1 to continue.</Say>
  <Gather input="dtmf" numDigits="1" action="{NGROK_URL}/gather" method="POST" timeout="10">
    <Say>Press 1 now.</Say>
  </Gather>
  <Say>No input received. Goodbye.</Say>
  <Hangup/>
</Response>''',
        media_type="application/xml"
    )

@app.get("/emergency")
@app.post("/emergency")
def emergency():
    return Response(
        content='<Response><Say voice="alice">This is an emergency call from SafeHouse. The user has triggered an emergency alert. Please check on them immediately.</Say><Hangup/></Response>',
        media_type="application/xml"
    )

@app.get("/temperature-alert")
@app.post("/temperature-alert")
def temperature_alert():
    """Temperature alert call - asks user to press 1 if OK, or 2 for emergency"""
    return Response(
        content=f'''<Response>
  <Say voice="alice">Alert from SafeHouse. Your home temperature is dangerously high. This may indicate a heatwave or fire.</Say>
  <Gather input="dtmf" numDigits="1" action="{NGROK_URL}/temperature-response" method="POST" timeout="10">
    <Say voice="alice">Press 1 if everything is okay, or press 2 if you need emergency assistance.</Say>
  </Gather>
  <Say voice="alice">No response received. Escalating to emergency contact.</Say>
  <Hangup/>
</Response>''',
        media_type="application/xml"
    )

@app.get("/temperature-response")
@app.post("/temperature-response")
async def temperature_response(request: Request):
    """Handle DTMF response from temperature alert call"""
    global user_confirmed_ok
    
    digits = ""
    if request.method == "POST":
        form_data = await request.form()
        digits = form_data.get("Digits", "")
    else:
        digits = request.query_params.get("Digits", "")
    
    if digits == "1":
        # User pressed 1 - everything is OK
        user_confirmed_ok = True
        print("User confirmed everything is OK (pressed 1) - setting flag")
        return Response(
            content='<Response><Say voice="alice">Thank you for confirming. We will continue monitoring. Stay safe.</Say><Hangup/></Response>',
            media_type="application/xml"
        )
    elif digits == "2":
        # User pressed 2 - needs emergency assistance
        print("User requested emergency assistance (pressed 2)")
        # Trigger emergency call to Abu in background
        def call_emergency():
            if client:
                try:
                    emergency_call = client.calls.create(
                        url=f"{NGROK_URL}/emergency",
                        to=os.getenv("ABUS_NUMBER"),
                        from_=os.getenv("TWILIO_PHONE_NUMBER")
                    )
                    print(f"Emergency call to Abu initiated: {emergency_call.sid}")
                except Exception as e:
                    print(f"Error calling emergency number: {e}")
        
        threading.Thread(target=call_emergency, daemon=True).start()
        
        return Response(
            content='<Response><Say voice="alice">Emergency assistance has been requested. We are calling your emergency contact now. Help is on the way.</Say><Hangup/></Response>',
            media_type="application/xml"
        )
    else:
        # No valid input or timeout
        print("No valid response from user - will escalate after call check")
        return Response(
            content='<Response><Say voice="alice">No response received. We will check back with you shortly.</Say><Hangup/></Response>',
            media_type="application/xml"
        )

@app.get("/")
def home():
    """Simple web interface to simulate ESP32 temperature input"""
    return Response(
        content='''
<!DOCTYPE html>
<html>
<head>
    <title>SafeHouse Temperature Monitor</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
        }
        .form-group {
            margin: 20px 0;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }
        input[type="number"] {
            width: 100%;
            padding: 12px;
            font-size: 18px;
            border: 2px solid #ddd;
            border-radius: 5px;
            box-sizing: border-box;
        }
        button {
            width: 100%;
            padding: 12px;
            font-size: 18px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
        }
        button:hover {
            background: #45a049;
        }
        .alert {
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            display: none;
        }
        .alert.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .alert.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .info {
            background: #e7f3ff;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #2196F3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>SafeHouse Temperature Monitor</h1>
        <div class="info">
            <strong>Warning Threshold:</strong> 98°F (SMS alerts)<br>
            <strong>Danger Threshold:</strong> 100°F (Emergency calls)<br>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>98-99.9°F: SMS sent to you and emergency contact</li>
                <li>100°F+: Emergency calls initiated</li>
            </ul>
        </div>
        <form id="tempForm">
            <div class="form-group">
                <label for="temperature">Enter Temperature (°F):</label>
                <input type="number" id="temperature" name="temperature" step="0.1" placeholder="e.g., 105" required>
            </div>
            <button type="submit">Submit Temperature</button>
        </form>
        <div id="alert" class="alert"></div>
    </div>
    <script>
        document.getElementById('tempForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const temp = document.getElementById('temperature').value;
            const alertDiv = document.getElementById('alert');
            
            try {
                const response = await fetch('/update-temperature?temperature=' + temp, {
                    method: 'GET'
                });
                const data = await response.json();
                
                alertDiv.style.display = 'block';
                if (data.status === 'alert_triggered') {
                    alertDiv.className = 'alert error';
                    alertDiv.textContent = 'DANGER! Temperature ' + temp + '°F exceeds threshold. Emergency calls are being initiated...';
                } else if (data.status === 'warning_sent') {
                    alertDiv.className = 'alert success';
                    alertDiv.textContent = 'WARNING! Temperature ' + temp + '°F is near threshold. SMS alerts sent to you and emergency contact.';
                } else {
                    alertDiv.className = 'alert success';
                    alertDiv.textContent = 'Temperature ' + temp + '°F recorded. No alert needed.';
                }
            } catch (error) {
                alertDiv.style.display = 'block';
                alertDiv.className = 'alert error';
                alertDiv.textContent = 'Error: ' + error.message;
            }
        });
    </script>
</body>
</html>
        ''',
        media_type="text/html"
    )

def get_or_create_temperature_sensor(db: Session) -> Sensor:
    """Get or create a temperature sensor for phone_call monitoring"""
    # Try to find an existing temperature sensor
    sensor = db.query(Sensor).filter(
        Sensor.sensor_type == SensorType.TEMPERATURE,
        Sensor.device_id == "phone-call-monitor"
    ).first()
    
    if not sensor:
        # Create a new sensor for phone_call monitoring
        sensor = Sensor(
            device_id="phone-call-monitor",
            name="Phone Call Temperature Monitor",
            sensor_type=SensorType.TEMPERATURE,
            location="Home",
            is_active=True
        )
        db.add(sensor)
        db.commit()
        db.refresh(sensor)
        print(f"Created temperature sensor: {sensor.id}")
    
    return sensor

def save_temperature_to_db(temperature: float, unit: str = "°F"):
    """Save temperature reading to database. Returns reading_id if successful, None otherwise"""
    db = SessionLocal()
    try:
        sensor = get_or_create_temperature_sensor(db)
        
        reading = SensorReading(
            sensor_id=sensor.id,
            value=temperature,
            unit=unit,
            timestamp=datetime.utcnow()
        )
        db.add(reading)
        sensor.last_seen = datetime.utcnow()
        db.commit()
        db.refresh(reading)
        print(f"Saved temperature {temperature}{unit} to database (reading_id: {reading.id})")
        return reading.id
    except Exception as e:
        print(f"Error saving temperature to database: {e}")
        db.rollback()
        return None
    finally:
        db.close()

def get_latest_temperature_reading(db: Session, sensor_id: int = None):
    """Get the most recent temperature reading from temperature sensor(s) in database"""
    # If specific sensor_id provided, use that
    if sensor_id:
        reading = db.query(SensorReading).filter(
            SensorReading.sensor_id == sensor_id
        ).order_by(SensorReading.timestamp.desc()).first()
        return reading
    
    # Otherwise, get from phone-call-monitor sensor first, then any temperature sensor
    phone_monitor_sensor = db.query(Sensor).filter(
        Sensor.device_id == "phone-call-monitor",
        Sensor.sensor_type == SensorType.TEMPERATURE
    ).first()
    
    if phone_monitor_sensor:
        reading = db.query(SensorReading).filter(
            SensorReading.sensor_id == phone_monitor_sensor.id
        ).order_by(SensorReading.timestamp.desc()).first()
        if reading:
            return reading
    
    # Fallback: get from any temperature sensor
    sensors = db.query(Sensor).filter(
        Sensor.sensor_type == SensorType.TEMPERATURE
    ).all()
    
    if not sensors:
        return None
    
    sensor_ids = [s.id for s in sensors]
    reading = db.query(SensorReading).filter(
        SensorReading.sensor_id.in_(sensor_ids)
    ).order_by(SensorReading.timestamp.desc()).first()
    
    return reading

def get_recent_temperature_readings(db: Session, sensor_id: int, before_reading_id: int, count: int = 10):
    """Get recent temperature readings BEFORE a specific reading (for baseline)"""
    # Get readings that come BEFORE the specified reading_id
    # Order by timestamp desc to get most recent first, but exclude the current reading
    readings = db.query(SensorReading).filter(
        SensorReading.sensor_id == sensor_id,
        SensorReading.id < before_reading_id  # Only readings before this one
    ).order_by(SensorReading.timestamp.desc()).limit(count).all()
    
    return readings

def calculate_z_score(value: float, mean: float, std_dev: float) -> float:
    """Calculate Z-score for a value"""
    if std_dev == 0:
        return 0  # No variation, can't calculate Z-score
    return (value - mean) / std_dev

def detect_temperature_anomaly(
    current_reading: SensorReading,
    recent_readings: list,
    threshold: float = 2.5
) -> dict:
    """
    Detect if a temperature reading is anomalous using Z-score
    
    Args:
        current_reading: The reading to check
        recent_readings: List of recent readings BEFORE current (for baseline)
        threshold: Z-score threshold (default 2.5)
    
    Returns:
        dict with anomaly status and details
    """
    if len(recent_readings) < 3:
        # Need at least 3 readings to calculate meaningful stats
        return {
            "is_anomaly": False,
            "reason": f"Not enough baseline data (have {len(recent_readings)}, need 3+)"
        }
    
    # recent_readings already excludes the current reading (they're all before it)
    # Extract values from baseline readings
    values = [r.value for r in recent_readings]
    
    # Filter outliers from baseline to get a cleaner baseline
    # Use median-based filtering: remove values that are far from the median
    if len(values) >= 4:
        median = statistics.median(values)
        # Calculate median absolute deviation (MAD) for robust outlier detection
        mad_values = [abs(v - median) for v in values]
        mad = statistics.median(mad_values) if mad_values else 0
        
        if mad > 0:
            # Filter out values that are more than 3 MAD away from median
            # This is more robust than mean/std dev for outlier detection
            threshold_mad = 3.0
            filtered_values = [v for v in values if abs(v - median) <= threshold_mad * mad]
            
            # Use filtered values if we still have at least 3 values
            if len(filtered_values) >= 3:
                values = filtered_values
                print(f"   Filtered baseline: {len(recent_readings)} -> {len(values)} readings (removed outliers using MAD)")
    
    # Calculate mean and standard deviation from (possibly filtered) baseline
    mean = statistics.mean(values)
    std_dev = statistics.stdev(values) if len(values) > 1 else 0
    
    if std_dev == 0:
        return {
            "is_anomaly": False,
            "reason": "No variation in baseline data"
        }
    
    # Calculate Z-score for current reading
    z_score = calculate_z_score(current_reading.value, mean, std_dev)
    
    # Debug output
    print(f"   Stats: Mean={mean:.2f}°F, StdDev={std_dev:.2f}°F, Current={current_reading.value}°F, Z-score={z_score:.2f}, Threshold={threshold}")
    
    # Determine if anomaly
    is_anomaly = abs(z_score) > threshold
    
    # Determine severity
    if abs(z_score) > 3.0:
        severity = "critical"
    elif abs(z_score) > 2.5:
        severity = "warning"
    else:
        severity = "normal"
    
    return {
        "is_anomaly": is_anomaly,
        "z_score": round(z_score, 2),
        "current_value": current_reading.value,
        "mean": round(mean, 2),
        "std_dev": round(std_dev, 2),
        "threshold": threshold,
        "severity": severity,
        "baseline_count": len(recent_readings)
    }

def check_and_alert_anomaly(reading: SensorReading, db: Session):
    """Check if reading is anomalous and send SMS alert if needed"""
    global last_processed_anomaly_reading_id
    
    # Skip if we've already processed this reading
    if reading.id == last_processed_anomaly_reading_id:
        return
    
    # Get the 10 readings BEFORE this one (for baseline)
    recent_readings = get_recent_temperature_readings(db, reading.sensor_id, reading.id, count=10)
    
    if len(recent_readings) > 0:
        baseline_values = [r.value for r in recent_readings]
        print(f"Checking anomaly for reading {reading.id} ({reading.value}°F). Baseline ({len(recent_readings)} readings): {baseline_values}")
    else:
        print(f"Checking anomaly for reading {reading.id} ({reading.value}°F). Baseline: {len(recent_readings)} readings (need 3+)")
    
    # Check for anomaly
    anomaly_result = detect_temperature_anomaly(reading, recent_readings, threshold=2.5)
    
    if anomaly_result.get("is_anomaly"):
        # Send SMS warning to user
        my_number = os.getenv("MY_PHONE_NUMBER")
        if my_number:
            z_score = anomaly_result["z_score"]
            current_temp = anomaly_result["current_value"]
            mean_temp = anomaly_result["mean"]
            severity = anomaly_result["severity"]
            
            if severity == "critical":
                message = f"CRITICAL ANOMALY: Temperature {current_temp}°F detected (Z-score: {z_score}). Normal range: {mean_temp}°F. Please check immediately!"
            else:
                message = f"Temperature Anomaly: {current_temp}°F detected (Z-score: {z_score}). Normal range: {mean_temp}°F. Please monitor."
            
            print(f"Sending anomaly SMS: {current_temp}°F (Z-score: {z_score}, severity: {severity})")
            threading.Thread(
                target=lambda: send_sms(my_number, message),
                daemon=True
            ).start()
            
            print(f"Anomaly SMS queued: {current_temp}°F (Z-score: {z_score}, severity: {severity})")
        else:
            print("MY_PHONE_NUMBER not set - cannot send anomaly SMS")
        
        # Mark as processed
        last_processed_anomaly_reading_id = reading.id
    else:
        reason = anomaly_result.get("reason", "Normal")
        print(f"No anomaly detected: {reason}")

def send_sms(to_number: str, message: str):
    """Send SMS using Twilio"""
    if not client:
        print("ERROR: Twilio client not initialized - cannot send SMS")
        return False
    
    try:
        twilio_number = os.getenv("TWILIO_PHONE_NUMBER")
        if not twilio_number:
            print("ERROR: TWILIO_PHONE_NUMBER not set in .env")
            return False
        
        message_obj = client.messages.create(
            body=message,
            from_=twilio_number,
            to=to_number
        )
        print(f"SMS sent to {to_number}: {message_obj.sid}")
        return True
    except Exception as e:
        print(f"Error sending SMS to {to_number}: {e}")
        return False

def check_temperature_and_alert(temperature: float, reading_id: int = None):
    """Check temperature against thresholds and trigger appropriate alerts"""
    global last_processed_reading_id
    
    # Skip if we've already processed this reading (only check if reading_id is provided)
    if reading_id is not None and reading_id == last_processed_reading_id:
        return "already_processed"
    
    if temperature >= TEMPERATURE_THRESHOLD:
        # DANGER: Temperature exceeded threshold - trigger call escalation
        print(f"DANGER! Temperature {temperature}°F exceeds threshold {TEMPERATURE_THRESHOLD}°F. Triggering alert sequence...")
        threading.Thread(target=escalate_calls, daemon=True).start()
        if reading_id is not None:
            last_processed_reading_id = reading_id
        return "alert_triggered"
    elif temperature >= WARNING_THRESHOLD:
        # WARNING: Temperature is near threshold - send SMS alerts
        print(f"WARNING! Temperature {temperature}°F is near threshold (warning at {WARNING_THRESHOLD}°F). Sending SMS alerts...")
        
        my_number = os.getenv("MY_PHONE_NUMBER")
        abus_number = os.getenv("ABUS_NUMBER")
        
        warning_message = f"SafeHouse Alert: Temperature is {temperature}°F (threshold: {TEMPERATURE_THRESHOLD}°F). Please monitor your home."
        
        # Send SMS to user
        if my_number:
            threading.Thread(
                target=lambda: send_sms(my_number, warning_message),
                daemon=True
            ).start()
        
        # Send SMS to emergency contact
        if abus_number:
            emergency_message = f"SafeHouse Alert: {os.getenv('MY_PHONE_NUMBER', 'User')}'s home temperature is {temperature}°F (approaching danger threshold of {TEMPERATURE_THRESHOLD}°F). Please check on them."
            threading.Thread(
                target=lambda: send_sms(abus_number, emergency_message),
                daemon=True
            ).start()
        
        if reading_id is not None:
            last_processed_reading_id = reading_id
        return "warning_sent"
    else:
        # Normal temperature - still mark as processed if we have a reading_id
        if reading_id is not None:
            last_processed_reading_id = reading_id
        return "ok"

@app.get("/update-temperature")
@app.post("/update-temperature")
def update_temperature(temperature: float):
    """Endpoint to update temperature (for ESP32 or web interface)"""
    # Save to database and get reading_id
    reading_id = save_temperature_to_db(temperature, "°F")
    
    # Check and alert (pass reading_id to avoid duplicate alerts from database monitor)
    status = check_temperature_and_alert(temperature, reading_id)
    
    if status == "alert_triggered":
        return {
            "status": "alert_triggered",
            "temperature": temperature,
            "threshold": TEMPERATURE_THRESHOLD,
            "message": "Temperature alert triggered - calls initiated"
        }
    elif status == "warning_sent":
        return {
            "status": "warning_sent",
            "temperature": temperature,
            "threshold": TEMPERATURE_THRESHOLD,
            "warning_threshold": WARNING_THRESHOLD,
            "message": "Temperature warning - SMS alerts sent"
        }
    else:
        return {
            "status": "ok",
            "temperature": temperature,
            "threshold": TEMPERATURE_THRESHOLD,
            "message": "Temperature within normal range"
        }

@app.get("/gather")
@app.post("/gather")
async def gather(request: Request):
    digits = ""
    if request.method == "POST":
        form_data = await request.form()
        digits = form_data.get("Digits", "")
    else:
        digits = request.query_params.get("Digits", "")
    
    if digits == "1":
        # Do something when they press 1
        return Response(
            content='<Response><Say voice="alice">You pressed 1. Action completed!</Say><Hangup/></Response>',
            media_type="application/xml"
        )
    else:
        # Make emergency call in background thread
        def make_emergency_call():
            if client:
                try:
                    emergency_call = client.calls.create(
                        url=f"{NGROK_URL}/emergency",
                        to=os.getenv("ABUS_NUMBER"),
                        from_=os.getenv("TWILIO_PHONE_NUMBER")
                    )
                    print(f"Emergency call initiated: {emergency_call.sid}")
                except Exception as e:
                    print(f"Error calling emergency number: {e}")
        
        # Start emergency call in background
        threading.Thread(target=make_emergency_call, daemon=True).start()
        
        # Return hangup response immediately
        return Response(
            content='<Response><Say voice="alice">Emergency noted calling emergency number. Goodbye.</Say><Hangup/></Response>',
            media_type="application/xml"
        )

def check_call_status(call_sid, max_wait=40):
    """Check if a call was answered by a human. Returns True if answered, False otherwise."""
    if not client:
        return False
    
    start_time = time.time()
    in_progress_start = None
    was_in_progress = False
    
    while time.time() - start_time < max_wait:
        try:
            call = client.calls(call_sid).fetch()
            status = call.status
            
            # Track when call goes in-progress
            if status == "in-progress":
                was_in_progress = True
                if in_progress_start is None:
                    in_progress_start = time.time()
                    print(f"Call went in-progress at {time.time() - start_time:.1f}s")
                else:
                    # Check if it's been in-progress for at least 5 seconds
                    time_in_progress = time.time() - in_progress_start
                    if time_in_progress >= 5:
                        print(f"Call has been in-progress for {time_in_progress:.1f} seconds - confirmed answered")
                        return True  # Been in progress for 5+ seconds, definitely answered
            else:
                # Status changed from in-progress, reset
                if in_progress_start is not None:
                    print(f"Call status changed from in-progress to {status}")
                in_progress_start = None
            
            # If call completed, check duration
            if status == "completed":
                duration = int(call.duration) if call.duration else 0
                answered_by = getattr(call, 'answered_by', None)
                
                print(f"Call completed. Duration: {duration}s, Answered by: {answered_by}, Was in-progress: {was_in_progress}")
                
                # If call was ever in-progress, it was answered
                if was_in_progress:
                    print("Call was in-progress - counting as answered")
                    return True
                
                # Require minimum 10 seconds duration to count as answered
                # Voicemail usually completes quickly or has shorter duration
                if duration >= 10:
                    # If answered_by is available, prefer human answers
                    if answered_by:
                        if answered_by == "human":
                            print("Answered by human")
                            return True
                        elif answered_by in ["machine", "fax"]:
                            print("Call answered by machine/fax - not counting as answered")
                            return False  # Voicemail or fax, not a real answer
                    else:
                        # No answered_by info, but duration is long enough (10+ seconds)
                        print(f"Call duration {duration}s long enough - counting as answered")
                        return True
                else:
                    # Duration too short, likely voicemail or not answered
                    print(f"Call duration {duration}s too short - not counting as answered")
                    return False
            
            # If call failed, busy, no-answer, or canceled, it wasn't answered
            if status in ["failed", "busy", "no-answer", "canceled"]:
                print(f"Call status: {status} - not answered")
                return False
            
            time.sleep(2)  # Check every 2 seconds
        except Exception as e:
            print(f"Error checking call status: {e}")
            return False
    
    # If we timeout, check if it was ever in-progress
    if was_in_progress:
        print("Timeout but call was in-progress - counting as answered")
        return True
    
    print("Call status check timed out - assuming not answered")
    return False

def escalate_calls():
    """Call user twice, if no answer both times OR user presses 2, call emergency contact"""
    global user_confirmed_ok
    
    if not client:
        print("ERROR: Twilio client not initialized")
        return
    
    my_number = os.getenv("MY_PHONE_NUMBER")
    abus_number = os.getenv("ABUS_NUMBER")
    
    if not my_number or not abus_number:
        print("ERROR: MY_PHONE_NUMBER or ABUS_NUMBER not set in .env")
        return
    
    # Reset the confirmation flag
    user_confirmed_ok = False
    
    # First call attempt
    print("Making first call attempt...")
    try:
        call1 = client.calls.create(
            url=f"{NGROK_URL}/temperature-alert",
            to=my_number,
            from_=os.getenv("TWILIO_PHONE_NUMBER")
        )
        print(f"First call SID: {call1.sid}")
        
        # Wait and check if answered (give time for user to press button)
        time.sleep(8)  # Give it more time to connect and for user to press button
        answered = check_call_status(call1.sid, max_wait=30)
        
        # Check if user confirmed OK (pressed 1)
        if user_confirmed_ok:
            print("User confirmed everything is OK (pressed 1). No escalation needed.")
            return
        
        if answered:
            print("First call was answered but no confirmation. Making second attempt...")
        else:
            print("First call not answered. Making second attempt...")
        
        # Second call attempt
        call2 = client.calls.create(
            url=f"{NGROK_URL}/temperature-alert",
            to=my_number,
            from_=os.getenv("TWILIO_PHONE_NUMBER")
        )
        print(f"Second call SID: {call2.sid}")
        
        # Wait and check if answered
        time.sleep(8)
        answered = check_call_status(call2.sid, max_wait=30)
        
        # Check if user confirmed OK (pressed 1)
        if user_confirmed_ok:
            print("User confirmed everything is OK (pressed 1). No escalation needed.")
            return
        
        if answered:
            print("Second call was answered but no confirmation. Escalating to emergency contact...")
        else:
            print("Second call not answered. Escalating to emergency contact...")
        
        # Escalate to emergency contact
        emergency_call = client.calls.create(
            url=f"{NGROK_URL}/emergency",
            to=abus_number,
            from_=os.getenv("TWILIO_PHONE_NUMBER")
        )
        print(f"Emergency call to {abus_number} initiated: {emergency_call.sid}")
        
    except Exception as e:
        print(f"Error in escalation process: {e}")

def monitor_database_temperature():
    """Continuously monitor database for new temperature readings and trigger alerts"""
    global last_processed_reading_id
    
    print("Starting database temperature monitor (checking every 30 seconds)...")
    
    while True:
        try:
            db = SessionLocal()
            try:
                reading = get_latest_temperature_reading(db)
                
                if reading:
                    temperature = reading.value
                    reading_id = reading.id
                    
                    # Always check for anomalies (uses separate tracking)
                    check_and_alert_anomaly(reading, db)
                    
                    # Check threshold-based alerts (only if not already processed)
                    if reading_id != last_processed_reading_id:
                        print(f"Checking latest temperature reading: {temperature}°F (ID: {reading_id})")
                        
                        status = check_temperature_and_alert(temperature, reading_id)
                        
                        if status == "alert_triggered":
                            print(f"Alert triggered for reading {reading_id}")
                        elif status == "warning_sent":
                            print(f"Warning sent for reading {reading_id}")
                        elif status == "already_processed":
                            print(f"Reading {reading_id} already processed")
                        else:
                            print(f"Temperature {temperature}°F is normal")
                    else:
                        print(f"Reading {reading.id} already processed for thresholds, skipping threshold check")
                else:
                    print("No temperature readings found in database")
                
            finally:
                db.close()
            
            # Wait 30 seconds before next check
            time.sleep(30)
            
        except Exception as e:
            print(f"Error in database monitor: {e}")
            time.sleep(30)  # Wait before retrying

if __name__ == "__main__":
    if not NGROK_URL:
        print("ERROR: NGROK_URL is not set in your .env file!")
        print("Make sure you have NGROK_URL=https://your-ngrok-url.ngrok-free.dev in your .env")
        exit(1)
    
    # Initialize database
    print("Initializing database...")
    init_db()
    print("Database initialized")
    
    # Start server
    print("Starting FastAPI server on port 8001...")
    threading.Thread(target=lambda: uvicorn.run(app, host="0.0.0.0", port=8001), daemon=True).start()
    time.sleep(2)
    print("Server started")
    
    # Check Twilio credentials
    if not client:
        print("ERROR: Twilio credentials not set!")
        exit(1)
    
    # Start database monitoring in background
    print("Starting database temperature monitor...")
    threading.Thread(target=monitor_database_temperature, daemon=True).start()
    
    print("\n" + "="*60)
    print("SafeHouse Phone Call System Running")
    print("="*60)
    print(f"Server: http://0.0.0.0:8001")
    print(f"Web Interface: {NGROK_URL}/")
    print(f"Monitoring database every 30 seconds")
    print(f"Z-Score Anomaly Detection: Enabled (threshold: 2.5)")
    print(f"Warning threshold: {WARNING_THRESHOLD}°F (SMS)")
    print(f"Danger threshold: {TEMPERATURE_THRESHOLD}°F (Calls)")
    print("="*60 + "\n")
    
    # Keep server running
    while True:
        time.sleep(1)