from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.api import api_router

# Create the main FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for SwissHacks application",
    version="0.1.0",
    docs_url=f"{settings.API_V1_STR}/docs",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    # Don't redirect when URLs have trailing slashes
    # This prevents HTTP redirects when using HTTPS behind proxies
    trailing_slash=False,
)

# Configure CORS - allowing all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add middleware to handle forwarded protocol (for HTTPS behind CloudFront)
@app.middleware("http")
async def handle_forwarded_proto(request, call_next):
    # Check if X-Forwarded-Proto is in headers and it's https
    forwarded_proto = request.headers.get("x-forwarded-proto")
    if forwarded_proto == "https":
        request.scope["scheme"] = "https"
    
    response = await call_next(request)
    return response

# Include the API router with the API_V1_STR prefix
app.include_router(api_router, prefix=settings.API_V1_STR)


# Root path response
@app.get("/")
async def main_root():
    """
    Root endpoint that redirects to API documentation.
    """
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "versions": {
            "v1": {
                "url": settings.API_V1_STR,
                "docs": f"{settings.API_V1_STR}/docs"
            }
        }
    }