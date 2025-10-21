# backend/app/routers/admin.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from pathlib import Path

from app.auth import get_current_admin

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
