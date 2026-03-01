from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session
from src.config.database import get_session
from src.models.user import User, UserRole
from src.utils.logger import logger
from src.utils.supabase import supabase

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(
    db: Session = Depends(get_session),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify token with Supabase
        user_response = await supabase.get_user(token)
        if not user_response.user:
            raise credentials_exception
            
        sb_user = user_response.user
        
        # Check if user exists in local DB
        user = db.get(User, sb_user.id)
        
        if not user:
            # Create user locally if not exists (Lazy provisioning)
            logger.info(f"Provisioning new user from Supabase: {sb_user.id}")
            user = User(
                id=sb_user.id,
                email=sb_user.email,
                role=UserRole.FREE_USER,
                is_active=True,
                password="supabase_managed", # Dummy value as password is managed by Supabase
                created_at=sb_user.created_at
            )
            # Try to get metadata if available
            if sb_user.user_metadata:
                user.first_name = sb_user.user_metadata.get('first_name')
                user.last_name = sb_user.user_metadata.get('last_name')
                
            db.add(user)
            db.commit()
            db.refresh(user)
            
        return user
        
    except Exception as e:
        logger.error(f"Auth error: {str(e)}")
        raise credentials_exception

async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_optional_user(
    db: Session = Depends(get_session),
    token: str = Depends(OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False))
) -> User | None:
    if not token:
        return None
    try:
        user_response = await supabase.get_user(token)
        if not user_response.user:
            return None
        return db.get(User, user_response.user.id)
    except Exception:
        return None
