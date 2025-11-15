from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

# ============================
# 🧩 USERS
# ============================

class UserRead(BaseModel):
    id: int
    email: EmailStr
    is_admin: bool
    created_at: datetime

    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str

# ============================
# 🧩 PRODUCTS
# ============================

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    image_url: str
    category: str

class Product(ProductBase):
    id: int
    owner_id: Optional[int]

    class Config:
        orm_mode = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    price: Optional[float]
    image_url: Optional[str]
    category: Optional[str]

# ============================
# 🧩 ORDERS
# ============================

class OrderStatus(str, Enum):
    pending = "pending"
    paid = "paid"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderItem(OrderItemBase):
    id: int
    product: Optional[Product]

    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    total: float
    status: Optional[OrderStatus] = OrderStatus.pending

class OrderCreate(OrderBase):
    items: List[OrderItemBase]
    shipping_name: str
    shipping_address: str
    shipping_city: str
    shipping_postal_code: str
    shipping_phone: Optional[str]

class OrderPublic(OrderBase):
    id: int
    user_id: int
    created_at: datetime
    shipping_name: Optional[str]
    shipping_address: Optional[str]
    shipping_city: Optional[str]
    shipping_postal_code: Optional[str]
    shipping_phone: Optional[str]
    items: List[OrderItem] = []
    user_email: Optional[str] = None

    class Config:
        orm_mode = True

class OrderUpdateStatus(BaseModel):
    status: OrderStatus


# ============================================================
# 🧩 AUTH
# ============================================================

class AdminLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserRead

# ============================
# 🧩 CART
# ============================

class CartItemBase(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemCreate(CartItemBase):
    pass

class CartItemRead(BaseModel):
    id: int
    product: Product
    quantity: int

    class Config:
        orm_mode = True

class CartRead(BaseModel):
    id: int
    user_id: Optional[int]
    session_id: Optional[str]
    items: List[CartItemRead]
    created_at: datetime

    class Config:
        orm_mode = True

