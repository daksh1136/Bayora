from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user import User, UserRole
from backend.app.schemas.auth import Token, UserLogin, UserCreate, UserResponse
from backend.app.core.security import hash_password, verify_password, create_access_token, get_current_user_payload

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter((User.username == user_in.username) | (User.email == user_in.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        role=user_in.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    token = create_access_token(data={"sub": user.email, "username": user.username, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username
    }

@router.get("/me")
def get_current_user(payload: dict = Depends(get_current_user_payload)):
    return payload

@router.post("/demo-token")
def get_demo_role_token(role: str = "admin", username: str = "Operator"):
    """Convenience endpoint for live demo to quickly switch roles (admin, red_lead, blue_lead, auditor)."""
    valid_roles = ["admin", "red_lead", "blue_lead", "auditor"]
    if role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Choose from {valid_roles}")
    
    token = create_access_token(data={"sub": f"{username.lower()}@bayora.sec", "username": username, "role": role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": role,
        "username": username
    }
