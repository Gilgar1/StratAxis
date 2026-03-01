"""
auth.py — FastAPI dependency for authenticating requests.

FIX: Previously, every protected request made an HTTP call to Supabase
GoTrue (/auth/v1/user) to validate the JWT. This meant:
  - Every request added 50–200ms of network latency
  - If Supabase was slow to start or temporarily unavailable, ALL
    authenticated endpoints returned 401 errors

NEW APPROACH: We validate the Supabase JWT locally using the same
JWT_SECRET that Supabase uses to sign tokens. Since both the Supabase
Docker stack and FastAPI share the same JWT_SECRET (set in both
infrastructure/supabase-docker/docker/.env and backend/.env), we can
decode and verify the token without any network call.

GoTrue is still used ONLY at login/register time to authenticate
credentials and issue tokens — not on every subsequent request.
"""

from uuid import UUID
from datetime import datetime
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session
from jose import JWTError, jwt

from src.config.database import get_session
from src.config.env import settings
from src.models.user import User, UserRole
from src.utils.logger import logger

# OAuth2 scheme — still points at login endpoint so Swagger UI works
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def _decode_supabase_jwt(token: str) -> dict:
    """
    Decode a Supabase-issued JWT locally using the shared JWT_SECRET.
    Raises JWTError if the token is invalid or expired.
    Supabase signs with HS256 and the audience is 'authenticated'.
    """
    return jwt.decode(
        token,
        settings.JWT_SECRET,
        algorithms=[settings.ALGORITHM],
        # Supabase sets aud="authenticated" for logged-in user tokens.
        # ANON_KEY JWTs have aud="anon" — we reject those here.
        audience="authenticated",
        options={"verify_exp": True},
    )


async def get_current_user(
    db: Session = Depends(get_session),
    token: str = Depends(oauth2_scheme),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # ─── Decode locally — no network call to GoTrue ───────────────
        payload = _decode_supabase_jwt(token)

        # Supabase stores the user UUID in the "sub" claim
        user_id_str: str | None = payload.get("sub")
        if not user_id_str:
            logger.warning("JWT missing 'sub' claim")
            raise credentials_exception

        try:
            user_id = UUID(user_id_str)
        except ValueError:
            logger.warning(f"JWT 'sub' is not a valid UUID: {user_id_str}")
            raise credentials_exception

    except JWTError as e:
        logger.error(f"JWT decode error: {e}")
        raise credentials_exception

    # ─── Look up user in local DB ─────────────────────────────────────
    try:
        user = db.get(User, user_id)
    except Exception as e:
        logger.error(f"DB error looking up user {user_id}: {e}")
        raise credentials_exception

    if not user:
        # Lazy provision: user authenticated with Supabase but isn't
        # in our local users table yet (e.g., created outside /register)
        logger.info(f"Lazy-provisioning user from JWT: {user_id}")
        email: str = payload.get("email", "")
        meta: dict = payload.get("user_metadata", {})
        try:
            user = User(
                id=user_id,
                email=email,
                role=UserRole.FREE_USER,
                is_active=True,
                password="supabase_managed",
                first_name=meta.get("first_name"),
                last_name=meta.get("last_name"),
                created_at=datetime.utcnow(),
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        except Exception as e:
            logger.error(f"Failed to provision user {user_id}: {e}")
            db.rollback()
            raise credentials_exception

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


async def get_optional_user(
    db: Session = Depends(get_session),
    token: str = Depends(
        OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)
    ),
) -> User | None:
    """Returns the user if a valid token is present, otherwise None."""
    if not token:
        return None
    try:
        payload = _decode_supabase_jwt(token)
        user_id = UUID(payload.get("sub", ""))
        return db.get(User, user_id)
    except Exception:
        return None
