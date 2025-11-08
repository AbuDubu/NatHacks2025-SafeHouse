from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
from app.database import get_db
from app.models import Sensor, SensorReading, Alert, User, AlertLevel
from app.schemas import (
    SensorCreate, Sensor as SensorSchema, SensorUpdate,
    SensorReadingCreate, SensorReading as SensorReadingSchema,
    SensorReadingBulkCreate, DataResponse, SensorStatusResponse
)

router = APIRouter(prefix="/sensors", tags=["sensors"])


# ============= Sensor Management =============

@router.post("/", response_model=SensorSchema, status_code=status.HTTP_201_CREATED)
def create_sensor(sensor: SensorCreate, db: Session = Depends(get_db)):
    """Register a new sensor device"""
    # Check if sensor with device_id already exists
    existing = db.query(Sensor).filter(Sensor.device_id == sensor.device_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sensor with this device_id already exists"
        )
    
    db_sensor = Sensor(**sensor.model_dump())
    db.add(db_sensor)
    db.commit()
    db.refresh(db_sensor)
    return db_sensor


@router.get("/", response_model=List[SensorSchema])
def get_sensors(
    is_active: Optional[bool] = None,
    sensor_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all sensors with optional filters"""
    query = db.query(Sensor)
    
    if is_active is not None:
        query = query.filter(Sensor.is_active == is_active)
    
    if sensor_type:
        query = query.filter(Sensor.sensor_type == sensor_type)
    
    return query.all()


@router.get("/status", response_model=SensorStatusResponse)
def get_sensor_status(db: Session = Depends(get_db)):
    """Get overview of sensor status"""
    sensors = db.query(Sensor).all()
    active = sum(1 for s in sensors if s.is_active)
    
    return {
        "total_sensors": len(sensors),
        "active_sensors": active,
        "inactive_sensors": len(sensors) - active,
        "sensors": sensors
    }


@router.get("/{sensor_id}", response_model=SensorSchema)
def get_sensor(sensor_id: int, db: Session = Depends(get_db)):
    """Get a specific sensor by ID"""
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )
    return sensor


@router.patch("/{sensor_id}", response_model=SensorSchema)
def update_sensor(
    sensor_id: int,
    sensor_update: SensorUpdate,
    db: Session = Depends(get_db)
):
    """Update sensor information"""
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )
    
    update_data = sensor_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(sensor, key, value)
    
    db.commit()
    db.refresh(sensor)
    return sensor


# ============= Sensor Readings (Hardware endpoint) =============

@router.post("/readings", response_model=SensorReadingSchema, status_code=status.HTTP_201_CREATED)
def create_reading(reading: SensorReadingCreate, db: Session = Depends(get_db)):
    """Create a single sensor reading"""
    # Verify sensor exists
    sensor = db.query(Sensor).filter(Sensor.id == reading.sensor_id).first()
    if not sensor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )
    
    # Update sensor last_seen
    sensor.last_seen = datetime.utcnow()
    
    # Create reading
    db_reading = SensorReading(**reading.model_dump())
    db.add(db_reading)
    db.commit()
    db.refresh(db_reading)
    
    # Check for alerts
    _check_and_create_alerts(sensor, db_reading.value, db)
    
    return db_reading


@router.post("/readings/bulk", response_model=DataResponse)
def create_bulk_readings(bulk_data: SensorReadingBulkCreate, db: Session = Depends(get_db)):
    """Hardware endpoint: Send multiple readings at once"""
    # Find all sensors for this device
    sensors = db.query(Sensor).filter(Sensor.device_id == bulk_data.device_id).all()
    
    if not sensors:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No sensors found for device_id: {bulk_data.device_id}"
        )
    
    # Create a map of sensor_type to sensor
    sensor_map = {s.sensor_type: s for s in sensors}
    
    readings_created = 0
    for reading_data in bulk_data.readings:
        sensor_type = reading_data.get("sensor_type")
        if sensor_type not in sensor_map:
            continue
        
        sensor = sensor_map[sensor_type]
        sensor.last_seen = datetime.utcnow()
        
        db_reading = SensorReading(
            sensor_id=sensor.id,
            value=reading_data.get("value"),
            unit=reading_data.get("unit"),
            timestamp=datetime.utcnow()
        )
        db.add(db_reading)
        readings_created += 1
        
        # Check for alerts
        _check_and_create_alerts(sensor, db_reading.value, db)
    
    db.commit()
    
    return {
        "success": True,
        "message": f"Created {readings_created} readings",
        "data": {"readings_created": readings_created}
    }


@router.get("/{sensor_id}/readings", response_model=List[SensorReadingSchema])
def get_sensor_readings(
    sensor_id: int,
    limit: int = 100,
    hours: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get readings for a specific sensor"""
    query = db.query(SensorReading).filter(SensorReading.sensor_id == sensor_id)
    
    if hours:
        since = datetime.utcnow() - timedelta(hours=hours)
        query = query.filter(SensorReading.timestamp >= since)
    
    query = query.order_by(SensorReading.timestamp.desc()).limit(limit)
    return query.all()


# ============= Helper Functions =============

def _check_and_create_alerts(sensor: Sensor, value: float, db: Session):
    """Check sensor reading and create alerts if needed"""
    alert = None
    
    # Get primary user
    user = db.query(User).filter(User.is_primary == True).first()
    if not user:
        return
    
    # Define alert conditions
    if sensor.sensor_type == "temperature":
        if value > 35:  # Too hot
            alert = Alert(
                user_id=user.id,
                title="High Temperature Alert",
                message=f"Temperature in {sensor.location or 'unknown location'} is {value}°C",
                alert_level=AlertLevel.WARNING,
                sensor_type=sensor.sensor_type
            )
        elif value < 10:  # Too cold
            alert = Alert(
                user_id=user.id,
                title="Low Temperature Alert",
                message=f"Temperature in {sensor.location or 'unknown location'} is {value}°C",
                alert_level=AlertLevel.WARNING,
                sensor_type=sensor.sensor_type
            )
    
    elif sensor.sensor_type == "smoke" and value > 0.5:
        alert = Alert(
            user_id=user.id,
            title="Smoke Detected!",
            message=f"Smoke detected in {sensor.location or 'unknown location'}",
            alert_level=AlertLevel.CRITICAL,
            sensor_type=sensor.sensor_type
        )
    
    elif sensor.sensor_type == "fall_detection" and value > 0:
        alert = Alert(
            user_id=user.id,
            title="Fall Detected!",
            message=f"Fall detected in {sensor.location or 'unknown location'}",
            alert_level=AlertLevel.CRITICAL,
            sensor_type=sensor.sensor_type
        )
    
    elif sensor.sensor_type == "co2" and value > 1000:
        alert = Alert(
            user_id=user.id,
            title="High CO2 Level",
            message=f"CO2 level in {sensor.location or 'unknown location'} is {value} ppm",
            alert_level=AlertLevel.WARNING,
            sensor_type=sensor.sensor_type
        )
    
    if alert:
        db.add(alert)
        db.commit()

