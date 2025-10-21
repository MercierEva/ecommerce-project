# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /backend

# Installer les dépendances
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code
COPY . .

# Commande par défaut : lancer uvicorn (FastAPI)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
