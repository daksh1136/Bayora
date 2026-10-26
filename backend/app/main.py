from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.seed_data import seed_database
from backend.app.api import auth, evaluations, red_team, blue_team, audit, policies, telemetry, websocket

# Create DB tables
Base.metadata.create_all(bind=engine)

# Seed DB with initial data
with SessionLocal() as db:
    try:
        seed_database(db)
    except Exception as e:
        print(f"Error seeding database: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Bayora: Zero-Trust Adversarial AI Safety Testing Infrastructure. "
        "Built by Team Avinya (Daksh Sharma, Raj, Somesh) for securing AI red-teaming, "
        "defenses, and model evaluations with cryptographic auditability."
    )
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(evaluations.router, prefix=settings.API_V1_STR)
app.include_router(red_team.router, prefix=settings.API_V1_STR)
app.include_router(blue_team.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)
app.include_router(policies.router, prefix=settings.API_V1_STR)
app.include_router(telemetry.router, prefix=settings.API_V1_STR)
app.include_router(websocket.router)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "isolation_mode": settings.ISOLATION_MODE
    }

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "team": "Avinya",
        "members": ["Daksh Sharma", "Raj", "Somesh"],
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
