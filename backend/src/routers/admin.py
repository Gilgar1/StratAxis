from fastapi import APIRouter, Depends
from src.dependencies.rbac import admin_required
from src.models.user import User

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(admin_required)])

@router.get("/stats")
async def get_admin_stats(current_admin: User = Depends(admin_required)):
    return {
        "total_users": 100, # Placeholder
        "pending_validations": 5,
        "system_health": "good"
    }
