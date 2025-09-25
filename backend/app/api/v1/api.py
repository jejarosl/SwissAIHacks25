from fastapi import APIRouter

from app.api.v1.endpoints import health, uptime
from app.core.config import settings

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(uptime.router)

@api_router.get("/")
async def root():
    """
    Root API v1 endpoint.
    """
    return {
        "message": "Welcome to SwissHacks API v1",
        "version": "1.0",
        "status": "active",
        "docs_url": f"{settings.API_V1_STR}/docs",
        "project_info": {
            "name": settings.PROJECT_NAME,
            "description": "A monorepo web application with Next.js frontend and FastAPI backend",
            "environment": "development"
        }
    }