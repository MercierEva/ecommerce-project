#!/bin/bash
set -e

PROJECT_DIR="/home/evmercie/ecommerce-project"
K8S_DIR="$PROJECT_DIR/k8s/dev"

# Générer un tag unique basé sur timestamp
TIMESTAMP=$(date +%s)
BACKEND_TAG="backend-dev:$TIMESTAMP"
FRONTEND_TAG="frontend-dev:$TIMESTAMP"
JOB_NAME="alembic-migrate-$TIMESTAMP"

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

# Déployer PostgreSQL d'abord
kubectl apply -f "$K8S_DIR/postgres/postgres-secret.yaml"
kubectl apply -f "$K8S_DIR/postgres/postgres-pvc.yaml"
kubectl apply -f "$K8S_DIR/postgres/postgres-deployment.yaml"
kubectl apply -f "$K8S_DIR/postgres/postgres-service.yaml"

# Attendre que PostgreSQL soit prêt
kubectl wait --for=condition=available --timeout=300s deployment/postgres

# Déployer le Job Alembic
sed "s|alembic-migrate|$JOB_NAME|g; s|backend-dev:latest|$BACKEND_TAG|g" \
    $K8S_DIR/backend/alembic-job.yaml | kubectl apply -f -

# Attendre la fin du Job
kubectl wait --for=condition=complete job/$JOB_NAME --timeout=300s || \
kubectl logs job/$JOB_NAME

# Supprimer le Job après exécution pour ne pas polluer le cluster
kubectl delete job $JOB_NAME

# Déployer backend
kubectl apply -f "$K8S_DIR/backend/backend-deployment.yaml"
kubectl apply -f "$K8S_DIR/backend/backend-service.yaml"
kubectl apply -f "$K8S_DIR/backend/media-pvc.yaml"
kubectl set image deployment/backend-dev backend="$BACKEND_TAG"
kubectl rollout status deployment/backend-dev

# Déployer frontend
kubectl apply -f "$K8S_DIR/frontend/frontend-deployment.yaml"
kubectl apply -f "$K8S_DIR/frontend/frontend-service.yaml"
kubectl set image deployment/frontend-dev frontend="$FRONTEND_TAG"
kubectl rollout status deployment/frontend-dev

# Cert-manager / Metallb / Ingress
kubectl apply -f "$K8S_DIR/cert-manager-clusterissuer.yaml"
kubectl apply -f "$K8S_DIR/metallb-config.yaml"
kubectl apply -f "$K8S_DIR/ecommerce-tls.yaml"
kubectl apply -f "$K8S_DIR/ecommerce-ingress.yaml"

# Nettoyer les anciennes images Docker
docker images "backend-dev" -q | grep -v "$TIMESTAMP" | xargs -r docker rmi -f || true
docker images "frontend-dev" -q | grep -v "$TIMESTAMP" | xargs -r docker rmi -f || true
docker image prune -f --filter "label=dev-environment" || true

echo ""
echo "✅ Environnement dev prêt !"
kubectl get pods -n default
kubectl get svc -n default
kubectl get ingress -n default
