# backend/app/routers/admin.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path
import shutil

from app.auth import get_current_admin
from app.database import get_db

router = APIRouter(tags=["Admin"])

IMAGES_DIR = Path("app/static/images")
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

    file_path = IMAGES_DIR / file.filename
    with file_path.open("wb") as f:
        f.write(contents)

    return {"filename": file.filename, "url": f"/static/images/{file.filename}"}
