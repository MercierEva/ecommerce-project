#!/bin/bash
set -e

PROJECT_DIR="/home/evmercie/ecommerce-project"
K8S_DIR="$PROJECT_DIR/k8s/dev"

# Générer un tag unique pour le frontend
TIMESTAMP=$(date +%s)
FRONTEND_TAG="frontend-dev:$TIMESTAMP"

echo "=== 🚀 Build frontend Docker ==="
cd "$PROJECT_DIR/frontend"
docker build -t "$FRONTEND_TAG" --label dev-environment=1 .

echo "=== 🚀 Déploiement frontend ==="
kubectl apply -f "$K8S_DIR/frontend/frontend-deployment.yaml"
kubectl apply -f "$K8S_DIR/frontend/frontend-service.yaml"
kubectl set image deployment/frontend-dev frontend="$FRONTEND_TAG"
kubectl rollout status deployment/frontend-dev

# Nettoyer les anciennes images Docker frontend
docker images "frontend-dev" -q | grep -v "$TIMESTAMP" | xargs -r docker rmi -f || true
docker image prune -f --filter "label=dev-environment" || true

echo ""
echo "✅ Frontend redeployé !"
kubectl get pods -n default
kubectl get svc -n default
kubectl get ingress -n default
