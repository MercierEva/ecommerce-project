#!/bin/bash
set -e

PROJECT_DIR="/home/evmercie/ecommerce-project"
K8S_DIR="$PROJECT_DIR/k8s/dev"

# Générer un tag unique basé sur timestamp
TIMESTAMP=$(date +%s)
BACKEND_TAG="backend-dev:$TIMESTAMP"
FRONTEND_TAG="frontend-dev:$TIMESTAMP"

echo "=== 🚀 Build des images Docker ==="

# Backend dev
echo "Building backend..."
cd "$PROJECT_DIR/backend"
docker build -t "$BACKEND_TAG" --label dev-environment=1 .

# Frontend dev
echo "Building frontend..."
cd "$PROJECT_DIR/frontend"
docker build -t "$FRONTEND_TAG" --label dev-environment=1 .

echo "=== 🚀 Déploiement des manifests Kubernetes ==="

# Backend dev
kubectl apply -f "$K8S_DIR/backend/backend-deployment.yaml"
kubectl apply -f "$K8S_DIR/backend/backend-service.yaml"
kubectl apply -f "$K8S_DIR/backend/media-pvc.yaml"
kubectl set image deployment/backend-dev backend="$BACKEND_TAG"
kubectl rollout status deployment/backend-dev

# Frontend dev
kubectl apply -f "$K8S_DIR/frontend/frontend-deployment.yaml"
kubectl apply -f "$K8S_DIR/frontend/frontend-service.yaml"
kubectl set image deployment/frontend-dev frontend="$FRONTEND_TAG"
kubectl rollout status deployment/frontend-dev

# Postgres, Metallb, Ingress, TLS
kubectl apply -f "$K8S_DIR/postgres/postgres-secret.yaml"
kubectl apply -f "$K8S_DIR/postgres/postgres-pvc.yaml"

kubectl apply -f "$K8S_DIR/cert-manager-clusterissuer.yaml"
kubectl apply -f "$K8S_DIR/metallb-config.yaml"
kubectl apply -f "$K8S_DIR/ecommerce-tls.yaml"
kubectl apply -f "$K8S_DIR/ecommerce-ingress.yaml"

# Nettoyer les anciennes images backend (sauf la nouvelle)
docker images "backend-dev" -q | grep -v "$TIMESTAMP" | while read img; do
    if ! docker ps -a --format '{{.Image}}' | grep -q "$img"; then
        docker rmi -f "$img"
    fi
done

# Nettoyer les anciennes images frontend (sauf la nouvelle)
docker images "frontend-dev" -q | grep -v "$TIMESTAMP" | while read img; do
    if ! docker ps -a --format '{{.Image}}' | grep -q "$img"; then
        docker rmi -f "$img"
    fi
done

# Nettoyer les images dangling avec le label dev-environment
docker image prune -f --filter "label=dev-environment"

echo ""
echo "✅ Environnement dev prêt !"
kubectl get pods -n default
kubectl get svc -n default
kubectl get ingress -n default

echo ""
echo "ℹ️ Pour voir les logs :"
echo "kubectl logs -f deployment/frontend-dev"
echo "kubectl logs -f deployment/backend-dev"
echo ""
