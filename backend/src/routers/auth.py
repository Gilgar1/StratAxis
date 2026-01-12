from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from src.config.database import get_session
from src.config.env import settings
from src.models.user import User, UserRole
from src.schemas.user import UserCreate, UserRead, Token
from src.utils.security import create_access_token, create_refresh_token, get_password_hash, verify_password
from src.dependencies.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: Session = Depends(get_session)
):
    # Check if user exists
    user = db.exec(select(User).where(User.email == user_in.email)).first()
    if user:
        raise HTTPException(
            status_code=409,
            detail="The user with this email already exists in the system.",
        )
    
    # Create new user
    db_obj = User(
        email=user_in.email,
        password=get_password_hash(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        phone=user_in.phone,
        role=UserRole.FREE_USER,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_session)
):
    user = db.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "refresh_token": create_refresh_token(user.id),
        "token_type": "bearer",
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_session)
):
    # In a real app, verify the refresh token against the database/whitelist
    # For MVP, we decode and verify expiration
    from src.utils.security import decode_token
    payload = decode_token(refresh_token, settings.JWT_REFRESH_SECRET)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user_id = payload.get("sub")
    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid user")
        
    return {
        "access_token": create_access_token(user.id),
        "refresh_token": create_refresh_token(user.id),
        "token_type": "bearer",
    }

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    # In practice, with stateless JWT, logout is often handled client-side by deleting the token.
    # Optionally, blacklist the token in Redis.
    return {"message": "Logged out"}

@router.post("/forgot-password")
async def forgot_password(email: str):
    # Mocking email sending
    return {"message": "Password reset email sent"}

@router.post("/reset-password")
async def reset_password(token: str, new_password: str):
    # Mocking password reset
    return {"message": "Password reset successful"}
