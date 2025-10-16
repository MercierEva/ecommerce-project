# backend/app/routers/admin.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app import schemas, crud
from app.database import get_db
from app.auth import get_db, verify_password, create_access_token, get_password_hash, get_current_admin
from fastapi import APIRouter, UploadFile, File
import shutil
from pathlib import Path

router = APIRouter(tags=["Admin"])
MEDIA_DIR = Path("app/static/images")
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/register", response_model=schemas.UserRead)
def register_admin(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    return crud.create_user(db, user, is_admin=True)

@router.post("/login")
def login_admin(user: schemas.AdminLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, user.email)
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants invalides")
    if not db_user.is_admin:
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    token = create_access_token({"sub": db_user.email}, timedelta(minutes=60))
    return {"access_token": token, "token_type": "bearer"}


MAX_FILE_SIZE = 10 * 1024 * 1024  # 5 Mo

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        return {"error": "File too large"}
    file_path = MEDIA_DIR / file.filename
    with file_path.open("wb") as buffer:
        buffer.write(contents)
    return {"filename": file.filename, "url": f"/static/images/{file.filename}"}
