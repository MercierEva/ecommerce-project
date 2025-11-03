# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /backend

# Installer les dépendances système nécessaires pour psycopg2 et netcat
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc \
        g++ \
        libpq-dev \
        build-essential \
        netcat-openbsd \
        ca-certificates \
        && rm -rf /var/lib/apt/lists/*

# Installer les dépendances Python
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code
COPY . .

# Commande par défaut : lancer FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
