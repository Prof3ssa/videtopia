# Docker Hub Deployment Guide

This guide explains how to deploy Videtopia using pre-built Docker images from Docker Hub.

## 🐳 Using Pre-built Images

### Option 1: Docker Compose with Pre-built Images

Create a `docker-compose.hub.yml` file:

```yaml
version: '3.8'

services:
  backend:
    image: yourusername/videtopia-backend:latest
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
      - MAX_FILE_SIZE=104857600
      - CLEANUP_INTERVAL=300000
    volumes:
      - ./uploads:/app/uploads
      - ./outputs:/app/outputs
    restart: unless-stopped

  frontend:
    image: yourusername/videtopia-frontend:latest
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001/api
    depends_on:
      - backend
    restart: unless-stopped
```

Then run:
```bash
docker-compose -f docker-compose.hub.yml up -d
```

### Option 2: Individual Docker Commands

```bash
# Create directories
mkdir -p uploads outputs

# Run backend
docker run -d \
  --name videtopia-backend \
  -p 3001:3001 \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/outputs:/app/outputs \
  -e NODE_ENV=production \
  -e ALLOWED_ORIGINS=http://localhost:3000 \
  yourusername/videtopia-backend:latest

# Run frontend
docker run -d \
  --name videtopia-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3001/api \
  yourusername/videtopia-frontend:latest
```

## 🏗️ Building and Pushing Images

### 1. Build Images
```bash
# Build backend
docker build -t yourusername/videtopia-backend:latest ./backend

# Build frontend
docker build -t yourusername/videtopia-frontend:latest ./frontend
```

### 2. Push to Docker Hub
```bash
# Login to Docker Hub
docker login

# Push images
docker push yourusername/videtopia-backend:latest
docker push yourusername/videtopia-frontend:latest
```

### 3. Tag for Versioning
```bash
# Tag with version
docker tag yourusername/videtopia-backend:latest yourusername/videtopia-backend:v1.0.0
docker tag yourusername/videtopia-frontend:latest yourusername/videtopia-frontend:v1.0.0

# Push versioned tags
docker push yourusername/videtopia-backend:v1.0.0
docker push yourusername/videtopia-frontend:v1.0.0
```

## 🔄 Automated Builds with GitHub Actions

The repository includes GitHub Actions workflows that automatically build and push images to Docker Hub when you push to the main branch.

### Setup GitHub Secrets
1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Add the following secrets:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub password or access token

### Workflow Features
- **Automatic builds** on push to main branch
- **Multi-architecture support** (AMD64, ARM64)
- **Cache optimization** for faster builds
- **Version tagging** with commit SHA
- **Pull request testing** without pushing images

## 🌐 Production Deployment

### Using Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.prod.yml videtopia
```

### Using Kubernetes
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: videtopia-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: videtopia-backend
  template:
    metadata:
      labels:
        app: videtopia-backend
    spec:
      containers:
      - name: backend
        image: yourusername/videtopia-backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: ALLOWED_ORIGINS
          value: "https://yourdomain.com"
---
apiVersion: v1
kind: Service
metadata:
  name: videtopia-backend-service
spec:
  selector:
    app: videtopia-backend
  ports:
  - port: 3001
    targetPort: 3001
  type: LoadBalancer
```

## 📊 Monitoring and Logs

### View Logs
```bash
# Docker Compose
docker-compose logs -f

# Individual containers
docker logs -f videtopia-backend
docker logs -f videtopia-frontend
```

### Health Checks
```bash
# Check backend health
curl http://localhost:3001/health

# Check container status
docker ps
```

## 🔒 Security Considerations

### Production Environment Variables
```bash
# Secure environment variables
- NODE_ENV=production
- ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
- MAX_FILE_SIZE=52428800  # 50MB limit
- CLEANUP_INTERVAL=300000  # 5 minutes
```

### Network Security
- Use reverse proxy (Nginx/Traefik) for SSL termination
- Configure firewall rules
- Use Docker networks for service isolation
- Enable Docker content trust for image verification

## 🚀 Scaling

### Horizontal Scaling
```bash
# Scale backend service
docker-compose up -d --scale backend=3

# Use load balancer
docker run -d \
  --name nginx-lb \
  -p 80:80 \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf \
  nginx:alpine
```

### Resource Limits
```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

**Ready to deploy Videtopia at scale! 🚀**
