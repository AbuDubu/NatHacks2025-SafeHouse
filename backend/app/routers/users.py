from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User as UserModel
from app.schemas import UserCreate, User as UserSchema, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user (elderly person or caregiver)"""
    # Check if email already exists
    existing = db.query(UserModel).filter(UserModel.email == user.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    db_user = UserModel(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.get("/", response_model=List[UserSchema])
def get_users(db: Session = Depends(get_db)):
    """Get all users"""
    return db.query(UserModel).all()


@router.get("/primary", response_model=UserSchema)
def get_primary_user(db: Session = Depends(get_db)):
    """Get the primary user (elderly person being monitored)"""
    user = db.query(UserModel).filter(UserModel.is_primary == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No primary user found"
        )
    return user


@router.get("/{user_id}", response_model=UserSchema)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get a specific user"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.get("/guardian/default", response_model=UserSchema)
def get_default_guardian(db: Session = Depends(get_db)):
    """Get the default guardian (first non-primary user)"""
    guardian = db.query(UserModel).filter(UserModel.is_primary == False).first()
    if not guardian:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No guardian found"
        )
    return guardian


@router.patch("/{user_id}", response_model=UserSchema)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    """Update a user's information"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    return user


@router.get("/guardian/{guardian_id}/residents", response_model=List[UserSchema])
def get_guardian_residents(guardian_id: int, db: Session = Depends(get_db)):
    """Get all residents under a specific guardian's care"""
    # Verify guardian exists
    guardian = db.query(UserModel).filter(UserModel.id == guardian_id).first()
    if not guardian:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guardian not found"
        )
    
    # Get all residents (primary users) under this guardian's care
    residents = db.query(UserModel).filter(
        UserModel.guardian_id == guardian_id,
        UserModel.is_primary == True
    ).all()
    
    return residents

