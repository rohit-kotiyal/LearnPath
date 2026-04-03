from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_hash_password, get_current_user
from app.schemas.auth import LoginRequest, RegisterRequest
from app.models.user import User


router = APIRouter(prefix="/auth", tags=["AUTH"])


@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email Already Registered")
    
    hashed_password = hash_password(data.password)
    try:
        new_user = User(
            full_name = data.full_name,
            email = data.email,
            password = hashed_password,
            role = data.role
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {"message": "User Registered Successfully"}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Invalid Credentials")
    
    if not verify_hash_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid Password")
    
    token = create_access_token(
        data={"sub": str(user.id)}
    )

    response = {"access_token": token, "token_type": "bearer"}
    return response



@router.get("/me")
def get_profile(user_id: User = Depends(get_current_user), db: Session = Depends(get_db)):

    current_user = db.query(User).filter(User.id == user_id).first()
    return {
        "id": user_id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role
    }