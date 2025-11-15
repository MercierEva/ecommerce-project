# backend/app/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.database import Base, engine
from app.config import DEBUG
from app.routers import admin, products, users, orders, payments, cart

# Créer les tables si DEBUG
if DEBUG:
    Base.metadata.create_all(bind=engine)

STATIC_DIR = Path("/app/static")
STATIC_DIR.mkdir(parents=True, exist_ok=True)

# Instance FastAPI
app = FastAPI(title="E-commerce API")

# Mount static files
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# 🔹 Sécurité : limiter les hôtes acceptés
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["ecommerce.dev.local", "localhost"]
)

# 🔹 CORS pour dev (à ajuster en prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # mettre le vrai domaine en prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def fix_https_scheme(request: Request, call_next):
    # Forcer scheme https si header X-Forwarded-Proto est présent
    if "x-forwarded-proto" in request.headers:
        request.scope["scheme"] = request.headers["x-forwarded-proto"]
    response = await call_next(request)
    return response


# Endpoint racine
@app.get("/api")
def api_root():
    return {"message": "API e-commerce fonctionne !"}

# 🔹 Inclure les routers avec slash cohérent
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(cart.router, prefix="/api/cart", tags=["Cart"])

