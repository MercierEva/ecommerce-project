# backend/app/routers/orders.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.auth import get_current_user
from app import models, schemas

router = APIRouter(tags=["Orders"])

# ----- Créer une commande -----
@router.post("/", response_model=schemas.Order)
def create_order(order_data: schemas.OrderCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not order_data.items or len(order_data.items) == 0:
        raise HTTPException(status_code=400, detail="Le panier est vide")
    
    # Créer la commande
    order = models.Order(
        user_id=current_user.id,
        total=order_data.total,
        status="pending"
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    
    # Ajouter les items
    for item in order_data.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"Produit {item.product_id} introuvable")
        order_item = models.OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.price
        )
        db.add(order_item)
    db.commit()
    db.refresh(order)
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

