from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
from app.database import get_db
from app.models import Alert
from app.schemas import Alert as AlertSchema, AlertUpdate

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/", response_model=List[AlertSchema])
def get_alerts(
    user_id: Optional[int] = None,
    is_resolved: Optional[bool] = None,
    hours: Optional[int] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get alerts with optional filters - for mobile app"""
    query = db.query(Alert)
    
    if user_id:
        query = query.filter(Alert.user_id == user_id)
    
    if is_resolved is not None:
        query = query.filter(Alert.is_resolved == is_resolved)
    
    if hours:
        since = datetime.utcnow() - timedelta(hours=hours)
        query = query.filter(Alert.created_at >= since)
    
    query = query.order_by(Alert.created_at.desc()).limit(limit)
    return query.all()


@router.get("/active", response_model=List[AlertSchema])
def get_active_alerts(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Get all unresolved alerts - mobile app endpoint"""
    query = db.query(Alert).filter(Alert.is_resolved == False)
    
    if user_id:
        query = query.filter(Alert.user_id == user_id)
    
    query = query.order_by(Alert.created_at.desc())
    return query.all()


@router.get("/critical", response_model=List[AlertSchema])
def get_critical_alerts(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Get all critical unresolved alerts - mobile app endpoint"""
    query = db.query(Alert).filter(
        Alert.is_resolved == False,
        Alert.alert_level == "critical"
    )
    
    if user_id:
        query = query.filter(Alert.user_id == user_id)
    
    query = query.order_by(Alert.created_at.desc())
    return query.all()


@router.get("/{alert_id}", response_model=AlertSchema)
def get_alert(alert_id: int, db: Session = Depends(get_db)):
    """Get a specific alert"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    return alert


@router.patch("/{alert_id}", response_model=AlertSchema)
def update_alert(
    alert_id: int,
    alert_update: AlertUpdate,
    db: Session = Depends(get_db)
):
    """Update alert (e.g., mark as resolved) - mobile app endpoint"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    if alert_update.is_resolved is not None:
        alert.is_resolved = alert_update.is_resolved
        if alert_update.is_resolved:
            alert.resolved_at = datetime.utcnow()
        else:
            alert.resolved_at = None
    
    db.commit()
    db.refresh(alert)
    return alert


@router.post("/{alert_id}/resolve", response_model=AlertSchema)
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    """Quick endpoint to resolve an alert - mobile app"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    alert.is_resolved = True
    alert.resolved_at = datetime.utcnow()
    
    db.commit()
    db.refresh(alert)
    return alert

