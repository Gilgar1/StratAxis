from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from src.config.database import get_session
from src.models.user import User, UserRole
from src.schemas.user import UserCreate, UserRead, Token
from src.utils.supabase import supabase
from src.dependencies.auth import get_current_user
from src.utils.logger import logger

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: Session = Depends(get_session)
):
    try:
        # Register user in Supabase
        auth_response = await supabase.sign_up({
            "email": user_in.email,
            "password": user_in.password,
            "options": {
                "data": {
                    "first_name": user_in.first_name,
                    "last_name": user_in.last_name,
                    "phone": user_in.phone
                }
            }
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=400, 
                detail="Registration failed with Supabase"
            )
            
        sb_user = auth_response.user
        
        # Check if user already exists in local DB (race condition or partial failure retry)
        existing_user = db.get(User, sb_user.id)
        if existing_user:
            return existing_user

        # Create new user locally
        db_obj = User(
            id=sb_user.id,
            email=user_in.email,
            password="supabase_managed", # Password is managed by Supabase
            first_name=user_in.first_name,
            last_name=user_in.last_name,
            phone=user_in.phone,
            role=UserRole.FREE_USER, # Default role
            is_active=True, 
            created_at=datetime.utcnow()
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        error_msg = str(e)
        if "User already registered" in error_msg or "already registered" in error_msg:
             raise HTTPException(
                status_code=409,
                detail="The user with this email already exists."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg.replace("Signup failed: ", "")
        )

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_session)
):
    try:
        # Login with Supabase
        auth_response = await supabase.sign_in_with_password({
            "email": form_data.username,
            "password": form_data.password
        })
        
        if not auth_response.session:
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )
            
        # Check and sync user locally
        user_id = auth_response.user.id
        user = db.get(User, user_id)
        
        if not user:
            # Sync user if missing (should not happen if registered via /register, but good for safety)
            user = User(
                id=user_id,
                email=auth_response.user.email,
                role=UserRole.FREE_USER,
                is_active=True,
                password="supabase_managed"
            )
            # Try to populate metadata
            meta = auth_response.user.user_metadata
            if meta:
                user.first_name = meta.get('first_name')
                user.last_name = meta.get('last_name')
                
            db.add(user)
            db.commit()
        
        return {
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token,
            "token_type": "bearer",
        }
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        error_msg = str(e)
        status_code = status.HTTP_401_UNAUTHORIZED
        
        if "Email not confirmed" in error_msg:
             status_code = status.HTTP_403_FORBIDDEN
             
        raise HTTPException(
            status_code=status_code,
            detail=error_msg.replace("Login failed: ", ""),
        )

@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
):
    try:
        # Refresh session with Supabase
        auth_response = await supabase.refresh_session(refresh_token)
        
        if not auth_response.session:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
            
        return {
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token,
            "token_type": "bearer",
        }
    except Exception as e:
        logger.error(f"Refresh error: {e}")
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    try:
        await supabase.sign_out()
    except:
        pass # Ignore error if already signed out
    return {"message": "Logged out"}

@router.post("/forgot-password")
async def forgot_password(email: str):
    try:
        await supabase.reset_password_email(email)
        return {"message": "Password reset email sent"}
    except Exception as e:
        logger.error(f"Forgot password error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
