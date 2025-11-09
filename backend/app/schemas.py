from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.models import SensorType, AlertLevel


# ============= User Schemas =============

class UserBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    is_primary: bool = True


class UserCreate(UserBase):
    pass


class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============= Sensor Schemas =============

class SensorBase(BaseModel):
    device_id: str
    name: str
    sensor_type: SensorType
    location: Optional[str] = None
    is_active: bool = True


class SensorCreate(SensorBase):
    pass


class SensorUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    is_active: Optional[bool] = None


class Sensor(SensorBase):
    id: int
    last_seen: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ============= Sensor Reading Schemas =============

class SensorReadingBase(BaseModel):
    value: float
    unit: Optional[str] = None


class SensorReadingCreate(SensorReadingBase):
    sensor_id: int


class SensorReadingBulkCreate(BaseModel):
    """For hardware to send multiple readings at once"""
    device_id: str
    readings: list[dict]  # [{"sensor_type": "temperature", "value": 22.5, "unit": "°C"}]


class SensorReading(SensorReadingBase):
    id: int
    sensor_id: int
    timestamp: datetime

    class Config:
        from_attributes = True


class SensorReadingWithSensor(SensorReading):
    """Reading with sensor details for mobile app"""
    sensor: Sensor


# ============= Alert Schemas =============

class AlertBase(BaseModel):
    title: str
    message: str
    alert_level: AlertLevel
    sensor_type: Optional[SensorType] = None


class AlertCreate(AlertBase):
    user_id: int


class AlertUpdate(BaseModel):
    is_resolved: Optional[bool] = None


class Alert(AlertBase):
    id: int
    user_id: int
    is_resolved: bool
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============= Response Schemas =============

class HealthCheck(BaseModel):
    status: str
    timestamp: datetime
    version: str = "1.0.0"


class DataResponse(BaseModel):
    """Generic response with data"""
    success: bool = True
    message: str
    data: Optional[dict] = None


class SensorStatusResponse(BaseModel):
    """Response for sensor status"""
    total_sensors: int
    active_sensors: int
    inactive_sensors: int
    sensors: list[Sensor]


class DashboardResponse(BaseModel):
    """Dashboard data for mobile app"""
    user: User
    active_alerts: list[Alert]
    recent_readings: list[SensorReadingWithSensor]
    sensor_status: SensorStatusResponse

