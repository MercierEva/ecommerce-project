from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# --- Users ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserRead(BaseModel):
    id: int
    email: EmailStr
    is_admin: bool

    class Config:
        orm_mode = True

# --- Products ---
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    image_url: str
    category: str

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    price: Optional[float]
    image_url: Optional[str]
    category: Optional[str]

class Product(ProductBase):
    id: int
    owner_id: Optional[int] = None

    class Config:
        orm_mode = True

# --- Orders ---
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: int

    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    total: float
    status: Optional[str] = "pending"

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class Order(OrderBase):
    id: int
    user_id: int
    created_at: datetime
    items: List[OrderItem]

    class Config:
        orm_mode = True

# --- Auth ---
class AdminLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserRead
