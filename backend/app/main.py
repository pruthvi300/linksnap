from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import database, engine, metadata
from app.api import auth, urls, analytics

# Create tables
metadata.create_all(engine)

app = FastAPI(title="SaaS URL Shortener API")

# Add CORS middleware - Allow all localhost origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(urls.router, prefix="/urls", tags=["URLs"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

# Startup / Shutdown events
@app.on_event("startup")
async def startup():
    await database.connect()
    # Seed dummy user for development
    from app.models.user import users
    from datetime import datetime
    
    query = users.select().where(users.c.id == "dummy_user_id")
    user = await database.fetch_one(query)
    
    if not user:
        query = users.insert().values(
            id="dummy_user_id",
            name="Test User",
            email="test@example.com",
            password_hash="dummy_hash",
            role="user",
            created_at=datetime.utcnow()
        )
        await database.execute(query)

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()
