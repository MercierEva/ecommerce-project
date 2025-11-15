from fastapi import APIRouter, Depends, HTTPException, Cookie, Response
from sqlalchemy.orm import Session, joinedload
import uuid

from app import models, schemas
from app.database import get_db
from app.auth import get_current_user

router = APIRouter(tags=["Cart"])


# ---------------------------------------------------------
# 🔹 Trouver ou créer un panier (user ou session invité)
# ---------------------------------------------------------
def get_or_create_cart(db: Session, user=None, session_id=None):
    cart = None

    # Utilisateur connecté → panier user
    if user:
        cart = db.query(models.Cart).filter_by(user_id=user.id).first()

    # Visiteur non connecté → panier session_id
    if not cart and session_id:
        cart = db.query(models.Cart).filter_by(session_id=session_id).first()

    # Créer un panier si aucun trouvé
    if not cart:
        cart = models.Cart(
            user_id=user.id if user else None,
            session_id=session_id or str(uuid.uuid4())
        )
        db.add(cart)
        db.commit()
        db.refresh(cart)

    return cart


# ---------------------------------------------------------
# 🔹 Fusion panier invité → panier utilisateur connecté
# ---------------------------------------------------------
def merge_carts(db: Session, user: models.User, session_id: str):
    if not session_id:
        return

    user_cart = db.query(models.Cart).filter_by(user_id=user.id).first()
    guest_cart = db.query(models.Cart).filter_by(session_id=session_id).first()

    # Rien à fusionner
    if not guest_cart:
        return

    # Créer panier utilisateur s'il n'existe pas
    if not user_cart:
        guest_cart.user_id = user.id
        guest_cart.session_id = None
        db.commit()
        return

    # Fusion : ajouter items de guest → user_cart
    for item in guest_cart.items:
        existing = (
            db.query(models.CartItem)
            .filter_by(cart_id=user_cart.id, product_id=item.product_id)
            .first()
        )

        if existing:
            existing.quantity += item.quantity
        else:
            new_item = models.CartItem(
                cart_id=user_cart.id,
                product_id=item.product_id,
                quantity=item.quantity,
            )
            db.add(new_item)

    # Supprimer ancien panier invité
    db.delete(guest_cart)
    db.commit()


# ---------------------------------------------------------
# 🔹 Obtenir le panier actuel
# ---------------------------------------------------------
@router.get("/", response_model=schemas.CartRead)
def get_cart(
    response: Response,
    db: Session = Depends(get_db),
    session_id: str = Cookie(None),
    user=Depends(get_current_user),
):
    # Fusion automatique si user vient d'une session invitée
    if user and session_id:
        merge_carts(db, user, session_id)
        response.delete_cookie("session_id")

    # Récupérer ou créer un panier
    cart = get_or_create_cart(db, user=user, session_id=session_id)

    # Charger les items + produits
    cart = (
        db.query(models.Cart)
        .options(joinedload(models.Cart.items).joinedload(models.CartItem.product))
        .filter(models.Cart.id == cart.id)
        .first()
    )

    # Créer cookie session_id si invité
    if not user and not session_id:
        response.set_cookie("session_id", cart.session_id, httponly=True)

    return cart


# ---------------------------------------------------------
# 🔹 Ajouter un item
# ---------------------------------------------------------
@router.post("/add", response_model=schemas.CartRead)
def add_to_cart(
    item: schemas.CartItemCreate,
    response: Response,
    db: Session = Depends(get_db),
    session_id: str = Cookie(None),
    user=Depends(get_current_user),
):
    # Fusion automatique si nécessaire
    if user and session_id:
        merge_carts(db, user, session_id)
        response.delete_cookie("session_id")

    cart = get_or_create_cart(db, user=user, session_id=session_id)

    # Vérifier que le produit existe
    product = db.query(models.Product).filter_by(id=item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produit introuvable")

    # Item existe déjà ?
    existing_item = (
        db.query(models.CartItem)
        .filter_by(cart_id=cart.id, product_id=item.product_id)
        .first()
    )

    if existing_item:
        existing_item.quantity += item.quantity
    else:
        new_item = models.CartItem(
            cart_id=cart.id,
            product_id=item.product_id,
            quantity=item.quantity,
        )
        db.add(new_item)

    db.commit()
    db.refresh(cart)

    return get_cart(response, db, None, user)


# ---------------------------------------------------------
# 🔹 Supprimer un item
# ---------------------------------------------------------
@router.delete("/remove/{product_id}", response_model=schemas.CartRead)
def remove_from_cart(
    product_id: int,
    response: Response,
    db: Session = Depends(get_db),
    session_id: str = Cookie(None),
    user=Depends(get_current_user),
):
    cart = get_or_create_cart(db, user=user, session_id=session_id)

    item = (
        db.query(models.CartItem)
        .filter_by(cart_id=cart.id, product_id=product_id)
        .first()
    )

    if not item:
        raise HTTPException(status_code=404, detail="Produit non présent dans le panier")

    db.delete(item)
    db.commit()

    return get_cart(response, db, session_id, user)


# ---------------------------------------------------------
# 🔹 Vider le panier
# ---------------------------------------------------------
@router.delete("/clear")
def clear_cart(
    response: Response,
    db: Session = Depends(get_db),
    session_id: str = Cookie(None),
    user=Depends(get_current_user),
):
    cart = get_or_create_cart(db, user=user, session_id=session_id)

    db.query(models.CartItem).filter_by(cart_id=cart.id).delete()
    db.commit()

    return {"success": True}
