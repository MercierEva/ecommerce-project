from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from pathlib import Path
from sqlalchemy.orm import Session, joinedload
from typing import List
from app import models, schemas
from app.database import get_db
from app.auth import verify_password, create_access_token, get_current_admin
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

    # Vérifie qu’il n’y a pas de caractères dangereux dans le nom
    safe_name = file.filename.replace("..", "").replace("/", "_")

    file_path = IMAGES_DIR / safe_name
    with file_path.open("wb") as f:
        f.write(contents)

    return {"filename": safe_name, "url": f"/static/images/{safe_name}"}


@router.get("/me", response_model=schemas.UserRead)
def get_admin_me(
    current_admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return current_admin

@router.post("/login", response_model=schemas.Token)
def admin_login(data: schemas.AdminLogin, db: Session = Depends(get_db)):
    """
    Login pour un admin via JSON (email + password)
    """
    user = db.query(models.User).filter(models.User.email == data.email).first()

    if not user or not user.is_admin or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants invalides ou pas un admin"
        )

    token = create_access_token({"sub": user.email, "is_admin": user.is_admin})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/orders", response_model=List[schemas.OrderPublic])
def get_all_orders(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    orders = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.user),
            joinedload(models.Order.items).joinedload(models.OrderItem.product)
        )
        .all()
    )

    for order in orders:
        order.user_email = order.user.email if order.user else None
        order.status = order.status_str

    return orders

@router.get("/orders/{order_id}", response_model=schemas.OrderPublic)
def get_order_by_id(
    order_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    order = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.user),
            joinedload(models.Order.items).joinedload(models.OrderItem.product)
        )
        .filter(models.Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    
    order.status = order.status_str
    order.user_email = order.user.email if order.user else None
    return order


@router.put("/orders/{order_id}/status", response_model=schemas.OrderPublic)
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

    order.status = order.status_str
    return order

@router.delete("/orders/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    order = db.query(models.Order).filter(models.Order.id==order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    db.delete(order)
    db.commit()
    return {"detail": "Commande supprimée"}
