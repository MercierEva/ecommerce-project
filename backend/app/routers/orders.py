from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict
from app.database import get_db
from app.auth import get_current_user
from app import models, schemas
import logging

router = APIRouter(tags=["Orders"])
logger = logging.getLogger(__name__)

# --- Helper pour convertir orders en dict Pydantic-friendly
def order_to_dict(order: models.Order):
    data = {**order.__dict__, "status": order.status_str}
    # items ORM -> Pydantic
    data["items"] = order.items
    return data

@router.post("/", response_model=schemas.Order)
def create_order(
    order_data: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not order_data.items:
        raise HTTPException(status_code=400, detail="Le panier est vide")

    order = models.Order(
        user_id=current_user.id,
        total=order_data.total,
        status=models.OrderStatus.pending,
        shipping_name=order_data.shipping_name,
        shipping_address=order_data.shipping_address,
        shipping_city=order_data.shipping_city,
        shipping_postal_code=order_data.shipping_postal_code,
        shipping_phone=order_data.shipping_phone,
    )

    try:
        db.add(order)
        db.flush()

        for item in order_data.items:
            product = db.query(models.Product).filter_by(id=item.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Produit {item.product_id} introuvable")
            order_item = models.OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.price,
            )
            db.add(order_item)

        db.commit()
        db.refresh(order)
    except Exception as e:
        db.rollback()
        logger.exception("Erreur lors de la création de la commande")
        raise HTTPException(status_code=500, detail="Impossible de créer la commande pour le moment.") from e

    return order_to_dict(order)

@router.get("/", response_model=List[schemas.Order])
def list_orders(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    orders = db.query(models.Order).filter(models.Order.user_id == current_user.id).all()
    return [order_to_dict(o) for o in orders]

@router.get("/user/my", response_model=List[schemas.Order])
def get_my_orders(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    orders = db.query(models.Order).filter(models.Order.user_id == current_user.id).all()
    return [order_to_dict(o) for o in orders]

@router.get("/{order_id}", response_model=schemas.Order)
def get_order(order_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    order = db.query(models.Order).filter(models.Order.id == order_id, models.Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    return order_to_dict(order)

@router.put("/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(order_id: int, update: schemas.OrderUpdateStatus, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Accès réservé à l’administrateur")

    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable")

    order.status = update.status
    db.commit()
    db.refresh(order)
    return order_to_dict(order)
