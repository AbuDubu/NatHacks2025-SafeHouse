from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import os
from dotenv import load_dotenv

from app.database import init_db
from app.routers import sensors, alerts, users, dashboard, websocket, phone_calls
from app.schemas import HealthCheck

load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="SafeHouse API",
    description="Backend API for SafeHouse - Elderly Safety Monitoring System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your mobile app's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(sensors.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(websocket.router, prefix="/api")
app.include_router(phone_calls.router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    print("🏠 Starting SafeHouse API...")
    init_db()
    print("✅ Database initialized")
    print(f"📡 API running on http://{os.getenv('API_HOST', '0.0.0.0')}:{os.getenv('API_PORT', '8000')}")
    print(f"📚 API docs available at http://localhost:{os.getenv('API_PORT', '8000')}/docs")


@app.get("/", response_model=HealthCheck)
async def root():
    """Root endpoint - API health check"""
    return {
        "status": "online",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }


@app.get("/health", response_model=HealthCheck)
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    # For Twilio webhooks, return TwiML XML instead of JSON
    if "/phone-calls/" in str(request.url):
        from fastapi.responses import Response
        import traceback
        print(f"❌ Error in phone-calls endpoint: {exc}")
        traceback.print_exc()
        twiml = '<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice">An error occurred. Please try again later.</Say><Hangup/></Response>'
        return Response(
            content=twiml,
            media_type="application/xml",
            headers={"Content-Type": "application/xml; charset=utf-8"}
        )
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error",
            "detail": str(exc)
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=True,  # Enable auto-reload during development
        log_level="info"
    )

