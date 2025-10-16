# backend/app/routers/public.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db

router = APIRouter(tags=["Public"])

@router.get("/products", response_model=list[schemas.Product])
def public_products(db: Session = Depends(get_db)):
    return crud.get_products(db)
