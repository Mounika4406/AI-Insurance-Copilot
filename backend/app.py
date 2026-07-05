import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import init_db, get_db, User
from backend.routes import upload, rag, ml, report

# Initialize FastAPI App
app = FastAPI(title="AI Insurance Copilot API", version="1.0.0")

# Configure CORS for React Frontend running on localhost (Vite standard port is 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all for ease of connection
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup DB initialization
@app.on_event("startup")
def startup_event():
    print("Database initialization on startup...")
    init_db()
    # Seed default user if database is empty
    db = next(get_db())
    default_user = db.query(User).filter(User.email == "admin@copilot.com").first()
    if not default_user:
        # Simple plain password for prototyping, bcrypt is not needed for a one-day college project
        new_user = User(email="admin@copilot.com", password_hash="admin123")
        db.add(new_user)
        db.commit()
        print("Default user seeded: admin@copilot.com / admin123")

# Login Schemas
class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/login")
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Simple login endpoint for authentication."""
    user = db.query(User).filter(User.email == req.email).first()
    if not user or user.password_hash != req.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Use: admin@copilot.com / admin123"
        )
    return {
        "status": "success",
        "token": "mock-jwt-token-12345",
        "user": {
            "id": user.id,
            "email": user.email
        }
    }

# Include Subrouters
app.include_router(upload.router)
app.include_router(rag.router)
app.include_router(ml.router)
app.include_router(report.router)

@app.get("/")
def read_root():
    return {"message": "AI Insurance Copilot Backend is running!"}
