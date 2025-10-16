# Étape 1 : Build du frontend React
FROM node:20 AS build
WORKDIR /app

# Copie uniquement les fichiers de dépendances d'abord (pour le cache)
COPY package*.json ./

# Installation des dépendances
# --legacy-peer-deps évite les conflits, audit fix corrige sans casser
RUN npm install --legacy-peer-deps \
 && npm audit fix || true

# Copie du reste du code source
COPY . .

# Variables d'environnement pour le build
# (ici, tu peux adapter l’URL selon ton environnement)
ENV REACT_APP_API_URL=http://backend-dev-svc:8000

# Build de l’app
RUN npm run build

# Étape 2 : Nginx pour servir le frontend
FROM nginx:alpine

# Copie de ta config nginx custom (avec proxy /api/)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie du build compilé
COPY --from=build /app/build /usr/share/nginx/html

# Exposition du port
EXPOSE 80

# Démarrage de Nginx
CMD ["nginx", "-g", "daemon off;"]
