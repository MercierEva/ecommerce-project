# backend/app/routers/orders.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict
from app.database import get_db
from app.auth import get_current_user
from app import models, schemas
import logging

router = APIRouter(tags=["Orders"])
logger = logging.getLogger(__name__)

@router.post("/", response_model=schemas.Order)
def create_order(
    order_data: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not order_data.items or len(order_data.items) == 0:
        raise HTTPException(status_code=400, detail="Le panier est vide")

    shipping: Dict = getattr(order_data, "shipping", {}) or {}

    order = models.Order(
        user_id=current_user.id,
        total=order_data.total,
        status="pending",
        shipping_name=shipping.get("full_name"),
        shipping_address=shipping.get("address"),
        shipping_city=shipping.get("city"),
        shipping_postal_code=shipping.get("postal_code"),
        shipping_phone=shipping.get("phone"),
    )

    try:
        db.add(order)
        db.flush()  # flush pour récupérer l'ID de la commande

        for item in order_data.items:
            product = db.query(models.Product).filter_by(id=item.product_id).first()
            if not product:
                raise HTTPException(
                    status_code=404,
                    detail=f"Produit {item.product_id} introuvable",
                )
            order_item = models.OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.price,
            )
            db.add(order_item)

        db.commit()
        db.refresh(order)  # récupère toutes les relations correctement
    except Exception as e:
        db.rollback()
        logger.exception("Erreur lors de la création de la commande")
        raise HTTPException(
            status_code=500,
            detail="Impossible de créer la commande pour le moment.",
        ) from e

    return order

# ----- Lister toutes les commandes de l'utilisateur -----
@router.get("/", response_model=List[schemas.Order])
def list_orders(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    orders = db.query(models.Order).filter(models.Order.user_id == current_user.id).all()
    return orders

# ----- Consulter une commande par ID -----
@router.get("/user/my", response_model=List[schemas.Order])
def get_my_orders(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Order).filter(models.Order.user_id == current_user.id).all()

@router.get("/{order_id}", response_model=schemas.Order)
def get_order(order_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    order = db.query(models.Order).filter(models.Order.id == order_id, models.Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    return order

@router.put("/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(
    order_id: int,
    update: schemas.OrderUpdateStatus,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Accès réservé à l’administrateur")

    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable")

    order.status = update.status
    db.commit()
    db.refresh(order)
    return order
