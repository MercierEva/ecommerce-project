# backend/app/routers/products.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.auth import get_current_admin
from app.models import Product as ProductModel
from app.schemas import ProductCreate, ProductUpdate, Product as ProductSchema

router = APIRouter(tags=["products"])

# --- PUBLIC READ ---
@router.get("/public", response_model=List[ProductSchema])
def list_public_products(db: Session = Depends(get_db)):
    """Retourne tous les produits visibles publiquement"""
    products = db.query(ProductModel).all()
    return products

# --- ADMIN CREATE ---
@router.post("/", response_model=ProductSchema, dependencies=[Depends(get_current_admin)])
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    """Créer un produit"""
    product = ProductModel(**payload.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

# --- ADMIN UPDATE ---
@router.put("/{product_id}", response_model=ProductSchema, dependencies=[Depends(get_current_admin)])
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    """Mettre à jour un produit existant"""
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produit non trouvé")
    
    for key, value in payload.dict(exclude_unset=True).items():
        setattr(product, key, value)
    
    db.commit()
    db.refresh(product)
    return product

# --- ADMIN DELETE ---
@router.delete("/{product_id}", dependencies=[Depends(get_current_admin)])
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Supprimer un produit"""
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produit non trouvé")
    
    db.delete(product)
    db.commit()
    return {"ok": True, "message": "Produit supprimé"}
