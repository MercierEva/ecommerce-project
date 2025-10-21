# backend/app/config.py
from dotenv import load_dotenv
import os
from pathlib import Path

# Cherche le .env à la racine du backend
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

DEBUG = os.getenv("DEBUG", "True").lower() in ("true", "1")
FRONTEND_URL = os.getenv("FRONTEND_URL")  # optionnel, peut être None
