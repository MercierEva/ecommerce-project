import stripe
from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from typing import Dict, Any
from fastapi.responses import RedirectResponse

from app.models import Order, OrderItem
from app.database import get_db
from app.auth import get_current_user
from app.config import STRIPE_SECRET_KEY, FRONTEND_URL, STRIPE_WEBHOOK_SECRET

router = APIRouter(tags=["Payments"])

# 🔹 Clé Stripe
if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY
else:
    print("⚠️ Aucune clé Stripe configurée !")

@router.post("/create-checkout-session")
def create_checkout_session(
    body: Dict[str, Any],
    request: Request,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """
    Crée une session Stripe Checkout à partir du panier utilisateur.
    Le frontend envoie un JSON : {"items": [{id, name, price, quantity}]}
    """
    cart = body.get("items", [])
    if not cart:
        raise HTTPException(status_code=400, detail="Panier vide")

    # 🔸 Calcul du total
    total = sum(item["price"] * item.get("quantity", 1) for item in cart)

    # 🔸 Création de la commande dans la base
    order = Order(user_id=user.id, total=total, status="pending")
    db.add(order)
    db.commit()
    db.refresh(order)

    for item in cart:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item["id"],
            quantity=item.get("quantity", 1),
            price=item["price"],
        )
        db.add(order_item)
    db.commit()

    # 🔹 Préparation des items pour Stripe
    line_items = [
        {
            "price_data": {
                "currency": "eur",
                "product_data": {"name": item["name"]},
                "unit_amount": int(item["price"] * 100),
            },
            "quantity": item.get("quantity", 1),
        }
        for item in cart
    ]

    frontend_base = FRONTEND_URL or f"{request.url.scheme}://{request.headers['host']}"

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            customer_email=user.email,
            success_url=f"{frontend_base}/success?order_id={order.id}",
            cancel_url=f"{frontend_base}/cancel",
            metadata={"order_id": str(order.id)},
        )

        order.stripe_session_id = session.id
        db.commit()
        return {"url": session.url}

    except Exception as e:
        print("❌ Erreur Stripe:", str(e))
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Webhook Stripe — met à jour le statut de commande quand le paiement est réussi.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    endpoint_secret = STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except Exception as e:
        print("❌ Webhook invalide:", str(e))
        raise HTTPException(status_code=400, detail=str(e))

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        order_id = int(session["metadata"]["order_id"])
        order = db.query(Order).get(order_id)
        if order:
            order.status = "paid"
            db.commit()
            print(f"✅ Paiement validé pour commande {order.id}")

    return {"status": "success"}
