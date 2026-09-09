from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.config import settings
from backend.database import Base, engine, SessionLocal
from backend.seed_data import seed_database
from backend.routes import auth, mps, works, agencies, alerts, stats, ml_routes, digigov

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB & Seed data if needed on startup
    Base.metadata.create_all(bind=engine)
    try:
        seed_database()
    except Exception as e:
        print(f"Startup seed notice: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="AI-Powered MPLADS Anomaly & Fraud Detection Platform (MoSPI / eSAKSHI)",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(mps.router, prefix=settings.API_V1_STR)
app.include_router(works.router, prefix=settings.API_V1_STR)
app.include_router(agencies.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(stats.router, prefix=settings.API_V1_STR)
app.include_router(ml_routes.router, prefix=settings.API_V1_STR)
app.include_router(digigov.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "system": "National MPLADS Anomaly & Fraud Detection Platform",
        "portal": "eSAKSHI AI Engine",
        "version": "2.0.0",
        "status": "Operational",
        "docs_url": "/docs",
        "api_v1": "/api"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
