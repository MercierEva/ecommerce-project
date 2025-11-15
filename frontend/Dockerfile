# Étape 1 : Build React
FROM node:20 AS build
WORKDIR /app

# Copier les fichiers de dépendances d'abord
COPY package*.json ./
RUN npm install --legacy-peer-deps && npm audit fix || true

# Copier le reste du code
COPY . .

# Variable d'environnement pour l'API backend
ARG REACT_APP_API_URL=https://ecommerce.dev.local/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build de l'application React
RUN npm run build

# Étape 2 : Nginx pour servir le frontend avec HTTPS
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copier la config nginx custom
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier le build React
COPY --from=build /app/build /usr/share/nginx/html

# Exposer le port HTTPS
EXPOSE 443
EXPOSE 80

# Démarrage de Nginx
CMD ["nginx", "-g", "daemon off;"]
