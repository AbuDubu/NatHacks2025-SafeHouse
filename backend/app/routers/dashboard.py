from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, Alert, SensorReading, Sensor
from app.schemas import DashboardResponse, SensorReadingWithSensor

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/", response_model=DashboardResponse)
def get_dashboard(user_id: int = None, db: Session = Depends(get_db)):
    """
    Get complete dashboard data for mobile app
    - User info
    - Active alerts
    - Recent sensor readings
    - Sensor status
    """
    # Get user (primary by default)
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
    else:
        user = db.query(User).filter(User.is_primary == True).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get active alerts
    active_alerts = db.query(Alert).filter(
        Alert.user_id == user.id,
        Alert.is_resolved == False
    ).order_by(Alert.created_at.desc()).limit(10).all()
    
    # Get recent readings (last 24 hours)
    since = datetime.utcnow() - timedelta(hours=24)
    recent_readings = db.query(SensorReading).filter(
        SensorReading.timestamp >= since
    ).order_by(SensorReading.timestamp.desc()).limit(50).all()
    
    # Attach sensor info to readings
    readings_with_sensor = []
    for reading in recent_readings:
        sensor = db.query(Sensor).filter(Sensor.id == reading.sensor_id).first()
        reading_dict = {
            "id": reading.id,
            "sensor_id": reading.sensor_id,
            "value": reading.value,
            "unit": reading.unit,
            "timestamp": reading.timestamp,
            "sensor": sensor
        }
        readings_with_sensor.append(reading_dict)
    
    # Get sensor status
    sensors = db.query(Sensor).all()
    active_sensors = sum(1 for s in sensors if s.is_active)
    
    sensor_status = {
        "total_sensors": len(sensors),
        "active_sensors": active_sensors,
        "inactive_sensors": len(sensors) - active_sensors,
        "sensors": sensors
    }
    
    return {
        "user": user,
        "active_alerts": active_alerts,
        "recent_readings": readings_with_sensor,
        "sensor_status": sensor_status
    }


@router.get("/summary")
def get_dashboard_summary(user_id: int = None, db: Session = Depends(get_db)):
    """Get a quick summary for mobile app home screen"""
    # Get user
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
    else:
        user = db.query(User).filter(User.is_primary == True).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Count alerts
    total_alerts = db.query(Alert).filter(Alert.user_id == user.id).count()
    active_alerts = db.query(Alert).filter(
        Alert.user_id == user.id,
        Alert.is_resolved == False
    ).count()
    critical_alerts = db.query(Alert).filter(
        Alert.user_id == user.id,
        Alert.is_resolved == False,
        Alert.alert_level == "critical"
    ).count()
    
    # Sensor counts
    total_sensors = db.query(Sensor).count()
    active_sensors = db.query(Sensor).filter(Sensor.is_active == True).count()
    
    # Recent activity (last hour)
    since = datetime.utcnow() - timedelta(hours=1)
    recent_readings = db.query(SensorReading).filter(
        SensorReading.timestamp >= since
    ).count()
    
    return {
        "user_name": user.name,
        "alerts": {
            "total": total_alerts,
            "active": active_alerts,
            "critical": critical_alerts
        },
        "sensors": {
            "total": total_sensors,
            "active": active_sensors,
            "offline": total_sensors - active_sensors
        },
        "recent_activity": {
            "readings_last_hour": recent_readings
        }
    }

