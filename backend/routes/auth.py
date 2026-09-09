from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, MP
from backend.schemas import UserLogin, Token, UserResponse
from backend.auth import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password credentials"
        )

    access_token = create_access_token(
        data={"sub": user.username, "role": user.role, "id": user.id}
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        username=user.username,
        full_name=user.full_name,
        state=user.state,
        district=user.district,
        mp_id=user.mp_id
    )

@router.get("/me", response_model=UserResponse)
def get_my_profile(user: User = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@router.get("/demo-roles")
def get_demo_roles(db: Session = Depends(get_db)):
    """
    Returns available pre-configured official roles for seamless GovTech UI role switching.
    """
    users = db.query(User).all()
    return [
        {
            "username": u.username,
            "role": u.role,
            "role_title": {
                "ministry": "Central Nodal Agency (MoSPI)",
                "auditor": "CAG Principal Director of Audit",
                "state_nodal": "State Nodal Authority (Maharashtra)",
                "district_authority": "District Magistrate (Nashik Nodal DA)",
                "mp": "Hon'ble MP Rajesh Sharma (LS)"
            }.get(u.role, u.role.title()),
            "full_name": u.full_name,
            "email": u.email,
            "state": u.state,
            "district": u.district,
            "mp_id": u.mp_id
        }
        for u in users
    ]
