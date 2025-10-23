# backend/app/routers/admin.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from pathlib import Path
from app import models, schemas
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_admin
from typing import List

router = APIRouter(tags=["Admin"])

# ✅ Dossier d’upload cohérent avec main.py
STATIC_DIR = Path("/app/static")
IMAGES_DIR = STATIC_DIR / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 Mo

@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    current_admin=Depends(get_current_admin),
):
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Fichier trop volumineux")

    # Vérifie qu’il n’y a pas de caractères dangereux dans le nom
    safe_name = file.filename.replace("..", "").replace("/", "_")

    file_path = IMAGES_DIR / safe_name
    with file_path.open("wb") as f:
        f.write(contents)

    return {"filename": safe_name, "url": f"/static/images/{safe_name}"}


@router.get("/orders", response_model=List[schemas.Order])
async def get_all_orders(db: Session = Depends(get_db), current_admin=Depends(get_current_admin)):
    return db.query(models.Order).all()
