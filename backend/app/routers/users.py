# backend/app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status, Body, BackgroundTasks
from app.emails.utils import send_email
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app import models, schemas
from app.database import get_db
from app.auth import (
    create_refresh_token,
    verify_refresh_token,
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
    verify_token
)
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

    access_token = create_access_token({"sub": new_user.email, "is_admin": new_user.is_admin})
    refresh_token = create_refresh_token({"sub": new_user.email, "is_admin": new_user.is_admin})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=schemas.Token)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    email = form_data.username
    user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email introuvable")

    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Mot de passe incorrect")

    access_token = create_access_token({"sub": user.email, "is_admin": user.is_admin})
    refresh_token = create_refresh_token({"sub": user.email, "is_admin": user.is_admin})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=schemas.UserRead)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.post("/refresh", response_model=schemas.Token)
def refresh_token(
    token: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """
    Reçoit un refresh_token valide et renvoie un nouvel access_token.
    """
    payload = verify_refresh_token(token)  # lève une exception si invalide
    email = payload.get("sub")
    is_admin = payload.get("is_admin", False)

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur non trouvé")

    new_access_token = create_access_token({"sub": user.email, "is_admin": user.is_admin})

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/change-password")
def change_password(
    old_password: str = Body(...),
    new_password: str = Body(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Ancien mot de passe incorrect")

    current_user.hashed_password = get_password_hash(new_password)
    db.commit()
    return {"message": "Mot de passe mis à jour avec succès"}

@router.post("/forgot-password")
def forgot_password(
    background_tasks: BackgroundTasks,
    email: str = Body(...),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.email == email).first()

    # Pour ne pas révéler si l'email existe
    if not user:
        return {"message": "Email de réinitialisation envoyé si l'utilisateur existe"}

    # Générer un token temporaire de reset
    reset_token = create_access_token({"sub": user.email}, expires_delta=timedelta(hours=1))

    reset_link = f"https://ecommerce.dev.local/reset-password?token={reset_token}"

    # Envoi de l'email en tâche de fond
    background_tasks.add_task(
        send_email,
        template_name="reset_password.html",
        to=user.email,
        subject="Réinitialisation de votre mot de passe",
        context={
            "user_name": user.email,
            "reset_link": reset_link
        },
        background_tasks=background_tasks
    )

    return {"message": "Email de réinitialisation envoyé si l'utilisateur existe"}

@router.post("/reset-password")
def reset_password(token: str = Body(...), new_password: str = Body(...), db: Session = Depends(get_db)):
    email = verify_token(token)  # Fonction qui décode le JWT
    if not email:
        raise HTTPException(status_code=400, detail="Token invalide ou expiré")
    user = db.query(models.User).filter_by(email=email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    return {"message": "Mot de passe mis à jour"}
