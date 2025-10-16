# backend/app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional

# Users
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserRead(BaseModel):
    id: int
    email: EmailStr
    is_admin: bool

    class Config:
        orm_mode = True

class AdminLogin(BaseModel):
    email: str
    password: str

# Products
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: int
    image_url: str 

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    owner_id: Optional[int]

    class Config:
        orm_mode = True
