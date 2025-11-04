from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from pathlib import Path
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.database import get_db
from app.auth import get_current_admin

router = APIRouter(tags=["Admin"])

STATIC_DIR = Path("/app/static")
IMAGES_DIR = STATIC_DIR / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 Mo

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), current_admin=Depends(get_current_admin)):
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Fichier trop volumineux")

    safe_name = file.filename.replace("..", "").replace("/", "_")
    file_path = IMAGES_DIR / safe_name
    with file_path.open("wb") as f:
        f.write(contents)

    return {"filename": safe_name, "url": f"/static/images/{safe_name}"}

def order_to_dict(order: models.Order):
    data = {**order.__dict__, "status": order.status_str}
    data["items"] = order.items
    return data

@router.get("/orders", response_model=List[schemas.Order])
def get_all_orders(db: Session = Depends(get_db), current_admin=Depends(get_current_admin)):
    orders = db.query(models.Order).all()
    return [order_to_dict(o) for o in orders]


@router.put("/orders/{order_id}/status", response_model=schemas.Order)
def update_order_status(
    order_id: int,
    status_update: schemas.OrderUpdateStatus,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable")

    order.status = status_update.status
    db.commit()
    db.refresh(order)
    return order_to_dict(order)

@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produit introuvable")

    db.delete(product)
    db.commit()
    return {"detail": "Produit supprimé avec succès"}