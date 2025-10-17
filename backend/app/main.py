from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import admin, products, public
from fastapi.staticfiles import StaticFiles
from pathlib import Path

# Créer les tables
Base.metadata.create_all(bind=engine)
IMAGES_DIR = Path("/app/static/images")
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="E-commerce API")
app.mount("/static", StaticFiles(directory=Path("/app/static")), name="static")


# CORS pour dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # changer en prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# endpoint racine
@app.get("/api")
def api_root():
    return {"message": "API e-commerce fonctionne !"}

# Inclure les routers
app.include_router(admin.router, prefix="/api/admin")
app.include_router(products.router, prefix="/api/products")
app.include_router(public.router, prefix="/api/public")
