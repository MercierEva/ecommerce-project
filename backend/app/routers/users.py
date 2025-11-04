# backend/app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app import models, schemas
from app.database import get_db
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(tags=["Users"])

@router.post("/register", response_model=schemas.Token)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    new_user = models.User(
        email=user.email,
        hashed_password=get_password_hash(user.password),
        is_admin=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.email, "is_admin": new_user.is_admin})
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=schemas.Token)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # ⚙️ OAuth2PasswordRequestForm envoie "username"
    email = form_data.username  # ✅ on le renomme logiquement
    user = db.query(models.User).filter(models.User.email == email).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants invalides")

    token = create_access_token({"sub": user.email, "is_admin": user.is_admin})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=schemas.UserRead)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user
