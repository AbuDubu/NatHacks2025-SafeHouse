from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Boolean,
    ForeignKey,
    Enum as SQLEnum,
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class SensorType(str, enum.Enum):
    """Types of sensors supported"""

    TEMPERATURE = "temperature"
    HUMIDITY = "humidity"
    MOTION = "motion"
    SMOKE = "smoke"
    CO2 = "co2"
    HEART_RATE = "heart_rate"
    FALL_DETECTION = "fall_detection"
    DOOR = "door"
    WATER_LEAK = "water_leak"


class AlertLevel(str, enum.Enum):
    """Alert severity levels"""

    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class User(Base):
    """User model for elderly person and their caregivers"""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    is_primary = Column(
        Boolean, default=True
    )  # Primary user (elderly person) vs caregiver
    guardian_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Link to guardian user
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    alerts = relationship("Alert", back_populates="user")
    guardian = relationship("User", remote_side=[id], foreign_keys=[guardian_id], backref="residents")


class Sensor(Base):
    """Sensor model for hardware devices"""

    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    sensor_type = Column(SQLEnum(SensorType), nullable=False)
    location = Column(String)  # e.g., "Living Room", "Bedroom", "Kitchen"
    is_active = Column(Boolean, default=True)
    last_seen = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    readings = relationship(
        "SensorReading", back_populates="sensor", cascade="all, delete-orphan"
    )


class SensorReading(Base):
    """Sensor reading model for time-series data"""

    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(Integer, ForeignKey("sensors.id"), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String)  # e.g., "°C", "%", "bpm"
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    sensor = relationship("Sensor", back_populates="readings")


class Alert(Base):
    """Alert model for safety notifications"""

    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    alert_level = Column(SQLEnum(AlertLevel), nullable=False)
    sensor_type = Column(SQLEnum(SensorType))
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    resolved_at = Column(DateTime)

    # Relationships
    user = relationship("User", back_populates="alerts")
