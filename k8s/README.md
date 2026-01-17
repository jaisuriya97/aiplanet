# Kubernetes Deployment Guide

## Prerequisites

1. **Kubernetes Cluster**
   - Local: minikube, kind, or Docker Desktop
   - Cloud: AWS EKS, Google GKE, Azure AKS

2. **kubectl CLI**
   ```bash
   kubectl version --client
   ```

3. **Docker Images**
   Build and tag images before deployment:
   ```bash
   # Build backend
   cd backend
   docker build -t aiplanet-backend:latest .
   
   # Build frontend
   cd ../frontend
   docker build -t aiplanet-frontend:latest .
   ```

## Local Deployment (Minikube)

### 1. Start Minikube

```bash
minikube start --cpus=4 --memory=8192
```

### 2. Load Docker Images

```bash
# Load images into minikube
minikube image load aiplanet-backend:latest
minikube image load aiplanet-frontend:latest
```

### 3. Update Secrets

Edit `k8s/01-config.yaml` and add your API keys:

```yaml
stringData:
  OPENAI_API_KEY: "sk-your-actual-key"
  GEMINI_API_KEY: "your-actual-key"
  SERPAPI_API_KEY: "your-actual-key"
```

### 4. Deploy All Resources

```bash
# Apply all manifests in order
kubectl apply -f k8s/01-config.yaml
kubectl apply -f k8s/02-volumes.yaml
kubectl apply -f k8s/03-postgres.yaml
kubectl apply -f k8s/04-backend.yaml
kubectl apply -f k8s/05-frontend.yaml

# Or apply all at once
kubectl apply -f k8s/
```

### 5. Verify Deployment

```bash
# Check all pods are running
kubectl get pods

# Check services
kubectl get services

# View logs
kubectl logs -f deployment/backend
kubectl logs -f deployment/frontend
```

### 6. Access Application

```bash
# Get frontend URL
minikube service frontend-service --url

# Or use port forwarding
kubectl port-forward service/frontend-service 3000:80
kubectl port-forward service/backend-service 8000:8000
```

Then access:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000/api/docs

## Cloud Deployment

### AWS EKS

```bash
# Create EKS cluster
eksctl create cluster \
  --name aiplanet-cluster \
  --region us-west-2 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3

# Configure kubectl
aws eks update-kubeconfig --name aiplanet-cluster --region us-west-2

# Push images to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
docker tag aiplanet-backend:latest <account>.dkr.ecr.<region>.amazonaws.com/aiplanet-backend:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/aiplanet-backend:latest

# Update deployment yamls with ECR image URLs
# Then apply manifests
kubectl apply -f k8s/
```

### Google GKE

```bash
# Create GKE cluster
gcloud container clusters create aiplanet-cluster \
  --num-nodes=3 \
  --machine-type=n1-standard-2 \
  --zone=us-central1-a

# Get credentials
gcloud container clusters get-credentials aiplanet-cluster --zone=us-central1-a

# Push images to GCR
docker tag aiplanet-backend:latest gcr.io/<project-id>/aiplanet-backend:latest
docker push gcr.io/<project-id>/aiplanet-backend:latest

# Apply manifests
kubectl apply -f k8s/
```

## Scaling

```bash
# Scale backend
kubectl scale deployment backend --replicas=5

# Scale frontend
kubectl scale deployment frontend --replicas=3

# Enable autoscaling
kubectl autoscale deployment backend --min=2 --max=10 --cpu-percent=80
```

## Monitoring (Optional)

### Prometheus & Grafana

```bash
# Install Prometheus stack using Helm
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack

# Access Grafana
kubectl port-forward svc/prometheus-grafana 3001:80

# Default credentials: admin / prom-operator
```

## Updating

```bash
# Update backend image
docker build -t aiplanet-backend:v2 backend/
minikube image load aiplanet-backend:v2

# Update deployment
kubectl set image deployment/backend backend=aiplanet-backend:v2

# Rollout status
kubectl rollout status deployment/backend

# Rollback if needed
kubectl rollout undo deployment/backend
```

## Cleanup

```bash
# Delete all resources
kubectl delete -f k8s/

# Delete PVCs (data will be lost)
kubectl delete pvc --all

# Stop minikube
minikube stop
minikube delete
```

## Troubleshooting

### Pods not starting

```bash
# Describe pod to see events
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Check events
kubectl get events --sort-by='.lastTimestamp'
```

### Image pull errors

```bash
# For minikube, ensure images are loaded
minikube image ls

# For cloud, ensure images are pushed to registry
# and imagePullSecrets are configured
```

### Database connection issues

```bash
# Check postgres is running
kubectl get pod -l app=postgres

# Test connection from backend pod
kubectl exec -it <backend-pod> -- psql postgresql://user:password@postgres-service:5432/dbname
```

## Production Considerations

1. **Use Ingress Controller** instead of NodePort
2. **Configure TLS/SSL** certificates
3. **Set resource limits** appropriately
4. **Use Secrets Manager** (AWS Secrets Manager, GCP Secret Manager)
5. **Configure backup** for PostgreSQL
6. **Set up monitoring** and alerting
7. **Implement pod disruption budgets**
8. **Use network policies** for security
