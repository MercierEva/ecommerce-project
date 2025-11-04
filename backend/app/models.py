from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, func, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
import enum


class OrderStatus(enum.Enum):
    pending = "pending"
    paid = "paid"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


    products = relationship("Product", back_populates="owner")
    orders = relationship("Order", back_populates="user")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    image_url = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))
    category = Column(String, nullable=False)
    owner = relationship("User", back_populates="products")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.pending)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    total = Column(Float, nullable=False)
    shipping_name = Column(String)
    shipping_address = Column(String)
    shipping_city = Column(String)
    shipping_postal_code = Column(String)
    shipping_phone = Column(String)
    stripe_session_id = Column(String, nullable=True)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete")

    @property
    def status_str(self):
        return self.status.value if self.status else None

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)
    price = Column(Float)

    order = relationship("Order", back_populates="items")
