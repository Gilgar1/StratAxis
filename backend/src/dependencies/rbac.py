from typing import List
from fastapi import Depends, HTTPException, status
from src.dependencies.auth import get_current_active_user
from src.models.user import User, UserRole

class RoleChecker:
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_active_user)):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="The user doesn't have enough privileges",
            )
        return user

# Convenience instances
admin_required = RoleChecker([UserRole.ADMIN])
paid_user_required = RoleChecker([UserRole.ADMIN, UserRole.PAID_USER])
free_user_required = RoleChecker([UserRole.ADMIN, UserRole.PAID_USER, UserRole.FREE_USER])
