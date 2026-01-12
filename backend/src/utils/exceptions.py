from fastapi import Request, status
from fastapi.responses import JSONResponse
from typing import Any, Dict, Optional
from pydantic import BaseModel

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None

class ErrorResponse(BaseModel):
    error: ErrorDetail

class StratAxisException(Exception):
    def __init__(self, code: str, message: str, status_code: int = status.HTTP_400_BAD_REQUEST, details: Any = None):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details

async def strataxis_exception_handler(request: Request, exc: StratAxisException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details
            }
        }
    )

async def generic_exception_handler(request: Request, exc: Exception):
    # Log the full exception here if needed
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred. Please try again later.",
                "details": str(exc) if request.app.debug else None
            }
        }
    )
