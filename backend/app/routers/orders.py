from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app import models, schemas
from app.database import get_db
from app.auth import get_current_user
from app.emails.utils import send_email
from fastapi import BackgroundTasks

router = APIRouter(tags=["Orders"])

@router.post("/", response_model=schemas.OrderPublic)
def create_order(order_data: schemas.OrderCreate,
                 background_tasks: BackgroundTasks, 
                 db: Session = Depends(get_db),
                 current_user=Depends(get_current_user)):
    if not order_data.items:
        raise HTTPException(status_code=400, detail="Panier vide")

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
    db.add(order)
    db.flush()

    for item in order_data.items:
        product = db.query(models.Product).filter_by(id=item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Produit {item.product_id} introuvable")
        db.add(models.OrderItem(order_id=order.id, product_id=item.product_id, quantity=item.quantity, price=item.price))

    db.commit()
    db.refresh(order)

    email_items = [
        {
            "name": oi.product.name,
            "price": oi.price,
            "quantity": oi.quantity
        }
        for oi in order.items
    ]

    background_tasks.add_task(
        send_email,
        template_name="order_confirmation.html",
        to=current_user.email,
        subject=f"Confirmation de votre commande #{order.id}",
        context={
            "user_name": current_user.name,
            "order_id": order.id,
            "items": email_items,
            "total": order.total
        },
        background_tasks=background_tasks
    )
    return db.query(models.Order).options(joinedload(models.Order.items).joinedload(models.OrderItem.product)).filter(models.Order.id==order.id).first()

@router.get("/", response_model=List[schemas.OrderPublic])
def list_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    orders = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.items).joinedload(models.OrderItem.product)
        )
        .filter(models.Order.user_id == current_user.id)
        .order_by(models.Order.created_at.desc())
        .all()
    )

    for order in orders:
        order.status = order.status_str

    return orders


@router.get("/{order_id}", response_model=schemas.OrderPublic)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    order = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.items).joinedload(models.OrderItem.product)
        )
        .filter(models.Order.id == order_id, models.Order.user_id == current_user.id)
        .first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable")

    # Convertir Enum -> str
    order.status = order.status_str
    return order
