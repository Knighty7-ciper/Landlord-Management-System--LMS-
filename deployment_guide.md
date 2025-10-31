# Landlord Management System - Deployment Guide

**Version:** 1.0  
**Date:** October 30, 2025  
**Author:** MiniMax Agent  

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Database Deployment](#database-deployment)
4. [Application Deployment](#application-deployment)
5. [Environment Configuration](#environment-configuration)
6. [SSL/TLS Setup](#ssltls-setup)
7. [Monitoring Setup](#monitoring-setup)
8. [Backup Strategy](#backup-strategy)
9. [Security Configuration](#security-configuration)
10. [Performance Optimization](#performance-optimization)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

#### Minimum Production Requirements
- **CPU**: 8 cores (4 vCPU minimum per service)
- **Memory**: 32GB RAM (4GB minimum per service)
- **Storage**: 500GB SSD (100GB per service minimum)
- **Network**: 1Gbps bandwidth
- **Operating System**: Ubuntu 22.04 LTS or CentOS 8+

#### Recommended Production Requirements
- **CPU**: 32 cores (8 vCPU per service)
- **Memory**: 128GB RAM (16GB per service)
- **Storage**: 2TB NVMe SSD (200GB per service minimum)
- **Network**: 10Gbps bandwidth
- **Operating System**: Ubuntu 22.04 LTS or Red Hat Enterprise Linux 8+

### Software Dependencies

- **Docker**: 24.0+
- **Docker Compose**: 2.20+
- **Kubernetes**: 1.28+ (for container orchestration)
- **PostgreSQL**: 15.0+
- **Redis**: 7.0+
- **Nginx**: 1.24+ (for load balancing)
- **Certbot**: For SSL certificates

### Cloud Provider Requirements

#### AWS Setup
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure
```

#### Google Cloud Setup
```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize gcloud
gcloud init
```

#### Azure Setup
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login
```

---

## Infrastructure Setup

### Option 1: Kubernetes Deployment (Recommended)

#### 1. Create Kubernetes Cluster

**AWS EKS:**
```bash
# Create EKS cluster
eksctl create cluster \
  --name landlordms-prod \
  --version 1.28 \
  --region us-west-2 \
  --nodegroup-name standard-workers \
  --node-type m5.xlarge \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 10 \
  --managed

# Configure kubectl
aws eks update-kubeconfig --region us-west-2 --name landlordms-prod
```

**Google GKE:**
```bash
# Create GKE cluster
gcloud container clusters create landlordms-prod \
    --zone us-west1-a \
    --num-nodes 3 \
    --machine-type n1-standard-4 \
    --enable-autoscaling \
    --min-nodes 2 \
    --max-nodes 10

# Configure kubectl
gcloud container clusters get-credentials landlordms-prod --zone us-west1-a
```

#### 2. Create Namespaces
```bash
kubectl create namespace landlordms-prod
kubectl create namespace landlordms-staging
kubectl create namespace landlordms-monitoring
```

#### 3. Apply Database Manifests
```bash
# PostgreSQL
kubectl apply -f k8s/postgresql.yaml -n landlordms-prod

# Redis
kubectl apply -f k8s/redis.yaml -n landlordms-prod

# RabbitMQ
kubectl apply -f k8s/rabbitmq.yaml -n landlordms-prod
```

#### 4. Apply Application Manifests
```bash
# Authentication Service
kubectl apply -f k8s/auth-service.yaml -n landlordms-prod

# Property Service
kubectl apply -f k8s/property-service.yaml -n landlordms-prod

# Tenant Service
kubectl apply -f k8s/tenant-service.yaml -n landlordms-prod

# And so on for all services...
```

### Option 2: Docker Compose Deployment (Development/Small Scale)

#### 1. Create Docker Compose File
```yaml
# docker-compose.yml
version: '3.8'

services:
  # Database
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: landlordms
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database_schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d landlordms"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Message Queue
  rabbitmq:
    image: rabbitmq:3-management
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

  # API Gateway
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - auth-service
      - property-service
      - tenant-service

  # Application Services
  auth-service:
    build: ./services/auth-service
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  property-service:
    build: ./services/property-service
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  # Additional services...
  tenant-service:
    build: ./services/tenant-service
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
```

#### 2. Environment File
```bash
# .env
# Database
DB_USER=landlordms_user
DB_PASSWORD=secure_password_123
DB_NAME=landlordms

# Redis
REDIS_PASSWORD=redis_password_123

# RabbitMQ
RABBITMQ_USER=landlordms_rabbit
RABBITMQ_PASSWORD=rabbit_password_123

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Application
NODE_ENV=production
API_PORT=3000

# External Services
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=SG...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
```

#### 3. Deploy with Docker Compose
```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f auth-service

# Scale services
docker-compose up -d --scale auth-service=3
```

---

## Database Deployment

### PostgreSQL Setup

#### 1. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql-15 postgresql-contrib-15

# CentOS/RHEL
sudo dnf install postgresql15-server postgresql15-contrib
sudo postgresql-setup --initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

#### 2. Create Database and User
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE landlordms;

# Create user
CREATE USER landlordms_user WITH PASSWORD 'secure_password_123';

# Grant permissions
GRANT ALL PRIVILEGES ON DATABASE landlordms TO landlordms_user;
ALTER USER landlordms_user CREATEDB;

# Connect to database
\c landlordms

# Grant schema permissions
GRANT ALL ON SCHEMA public TO landlordms_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO landlordms_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO landlordms_user;
```

#### 3. Run Database Schema
```bash
# Execute schema file
psql -h localhost -U landlordms_user -d landlordms -f database_schema.sql

# Or using docker
docker run -v $(pwd):/sql postgres:15 psql -h postgres -U landlordms_user -d landlordms -f /sql/database_schema.sql
```

#### 4. Configure PostgreSQL
```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf

# Key configurations:
# listen_addresses = '*'  # Allow connections from all addresses
# max_connections = 200
# shared_buffers = 4GB
# effective_cache_size = 12GB
# maintenance_work_mem = 1GB
# checkpoint_completion_target = 0.9
# wal_buffers = 16MB
# default_statistics_target = 100
# random_page_cost = 1.1
# effective_io_concurrency = 200

# Edit pg_hba.conf for authentication
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Add:
# host landlordms landlordms_user 0.0.0.0/0 md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

#### 5. Setup Replication (Optional but Recommended)
```bash
# On primary server
# Edit postgresql.conf
wal_level = replica
max_wal_senders = 10
wal_keep_segments = 32
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/archive/%f'

# Create replication user
CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'replication_password';

# On replica server
sudo systemctl stop postgresql
sudo rm -rf /var/lib/postgresql/15/main/*
sudo -u postgres pg_basebackup -h primary_server_ip -D /var/lib/postgresql/15/main -U replicator -v -P -W

# Configure replica postgresql.conf
hot_standby = on
port = 5433

# Create recovery.conf
sudo -u postgres touch /var/lib/postgresql/15/main/recovery.conf
sudo -u postgres chmod 600 /var/lib/postgresql/15/main/recovery.conf

# recovery.conf content:
standby_mode = on
primary_conninfo = 'host=primary_server_ip port=5432 user=replicator password=replication_password'
restore_command = 'cp /var/lib/postgresql/archive/%f %p'

sudo systemctl start postgresql
```

### Redis Setup

#### 1. Install Redis
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server

# CentOS/RHEL
sudo dnf install redis
```

#### 2. Configure Redis
```bash
# Edit redis.conf
sudo nano /etc/redis/redis.conf

# Key configurations:
# bind 0.0.0.0
# port 6379
# requirepass redis_password_123
# maxmemory 4gb
# maxmemory-policy allkeys-lru
# save 900 1
# save 300 10
# save 60 10000
# appendonly yes
# appendfsync everysec

# Start Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

---

## Application Deployment

### Node.js Services Deployment

#### 1. Build Application
```bash
# In each service directory
cd services/auth-service
npm install
npm run build
npm test

# Create Docker image
docker build -t landlordms/auth-service:latest .
```

#### 2. Environment Configuration
```bash
# Create environment file for each service
cat > services/auth-service/.env.production << EOF
NODE_ENV=production
PORT=3001
DB_HOST=postgres-service
DB_PORT=5432
DB_NAME=landlordms
DB_USER=landlordms_user
DB_PASSWORD=secure_password_123
REDIS_HOST=redis-service
REDIS_PORT=6379
REDIS_PASSWORD=redis_password_123
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://app.landlordms.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
STRIPE_SECRET_KEY=sk_live_...
SENDGRID_API_KEY=SG....
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
AWS_REGION=us-west-2
S3_BUCKET=landlordms-documents
EOF
```

#### 3. Deploy to Kubernetes
```yaml
# services/auth-service/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: landlordms-prod
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: landlordms/auth-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          value: "postgres-service"
        - name: REDIS_HOST
          value: "redis-service"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: landlordms-prod
spec:
  selector:
    app: auth-service
  ports:
  - protocol: TCP
    port: 3001
    targetPort: 3001
  type: ClusterIP
```

#### 4. Apply Kubernetes Manifests
```bash
# Deploy all services
kubectl apply -f services/ -n landlordms-prod

# Check deployment status
kubectl get pods -n landlordms-prod
kubectl get services -n landlordms-prod

# Check logs
kubectl logs -f deployment/auth-service -n landlordms-prod
```

### Frontend Deployment

#### 1. Build React Application
```bash
cd frontend
npm install
npm run build

# Create Dockerfile for frontend
cat > Dockerfile << EOF
FROM nginx:alpine
COPY build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Build and deploy
docker build -t landlordms/frontend:latest .
```

#### 2. Deploy to Kubernetes
```yaml
# frontend/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: landlordms-prod
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: landlordms/frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: landlordms-prod
spec:
  selector:
    app: frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP
```

---

## Environment Configuration

### Development Environment
```bash
# .env.development
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=landlordms_dev
DB_USER=dev_user
DB_PASSWORD=dev_password
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
JWT_SECRET=dev_jwt_secret
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=debug
```

### Staging Environment
```bash
# .env.staging
NODE_ENV=staging
DB_HOST=staging-db.landlordms.com
DB_PORT=5432
DB_NAME=landlordms_staging
DB_USER=staging_user
DB_PASSWORD=staging_password
REDIS_HOST=staging-redis.landlordms.com
REDIS_PORT=6379
REDIS_PASSWORD=staging_redis_password
JWT_SECRET=staging_jwt_secret
API_URL=https://api-staging.landlordms.com
FRONTEND_URL=https://staging.landlordms.com
LOG_LEVEL=info
```

### Production Environment
```bash
# .env.production
NODE_ENV=production
DB_HOST=prod-db.landlordms.com
DB_PORT=5432
DB_NAME=landlordms
DB_USER=prod_user
DB_PASSWORD=secure_production_password
REDIS_HOST=prod-redis.landlordms.com
REDIS_PORT=6379
REDIS_PASSWORD=secure_redis_password
JWT_SECRET=ultra_secure_jwt_secret_256_bits
API_URL=https://api.landlordms.com
FRONTEND_URL=https://app.landlordms.com
LOG_LEVEL=warn
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## SSL/TLS Setup

### Using Let's Encrypt with Certbot

#### 1. Install Certbot
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo dnf install certbot python3-certbot-nginx
```

#### 2. Obtain SSL Certificate
```bash
# For Nginx
sudo certbot --nginx -d api.landlordms.com -d app.landlordms.com

# For standalone
sudo certbot certonly --standalone -d api.landlordms.com -d app.landlordms.com
```

#### 3. Auto-renewal Setup
```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab
sudo crontab -e

# Add line for automatic renewal
0 12 * * * /usr/bin/certbot renew --quiet
```

### Manual SSL Certificate Setup

#### 1. Generate Self-Signed Certificate (Development Only)
```bash
# Create SSL directory
sudo mkdir -p /etc/nginx/ssl

# Generate private key
sudo openssl genrsa -out /etc/nginx/ssl/landlordms.key 2048

# Generate certificate signing request
sudo openssl req -new -key /etc/nginx/ssl/landlordms.key -out /etc/nginx/ssl/landlordms.csr

# Generate self-signed certificate
sudo openssl x509 -req -days 365 -in /etc/nginx/ssl/landlordms.csr -signkey /etc/nginx/ssl/landlordms.key -out /etc/nginx/ssl/landlordms.crt

# Set permissions
sudo chmod 600 /etc/nginx/ssl/*
```

#### 2. Nginx SSL Configuration
```nginx
# /etc/nginx/sites-available/landlordms
server {
    listen 80;
    server_name api.landlordms.com app.landlordms.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.landlordms.com;

    ssl_certificate /etc/nginx/ssl/landlordms.crt;
    ssl_certificate_key /etc/nginx/ssl/landlordms.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    location / {
        proxy_pass http://auth-service:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name app.landlordms.com;

    ssl_certificate /etc/nginx/ssl/landlordms.crt;
    ssl_certificate_key /etc/nginx/ssl/landlordms.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Monitoring Setup

### Prometheus and Grafana

#### 1. Install Prometheus
```bash
# Download Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.47.0/prometheus-2.47.0.linux-amd64.tar.gz
tar xvfz prometheus-*.tar.gz
cd prometheus-*

# Create user
sudo useradd --no-create-home --shell /bin/false prometheus

# Create directories
sudo mkdir -p /etc/prometheus
sudo mkdir -p /var/lib/prometheus

# Move binaries
sudo mv prometheus promtool /usr/local/bin/

# Set ownership
sudo chown -R prometheus:prometheus /etc/prometheus
sudo chown -R prometheus:prometheus /var/lib/prometheus
```

#### 2. Configure Prometheus
```yaml
# /etc/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'landlordms-services'
    static_configs:
      - targets: ['auth-service:3001', 'property-service:3002', 'tenant-service:3003']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
```

#### 3. Install Grafana
```bash
# Ubuntu/Debian
sudo apt-get install -y adduser libfontconfig1
wget https://dl.grafana.com/oss/release/grafana_10.1.0_amd64.deb
sudo dpkg -i grafana_10.1.0_amd64.deb

# Start Grafana
sudo systemctl enable grafana-server
sudo systemctl start grafana-server
```

#### 4. Configure Grafana Dashboards
```bash
# Add data sources
curl -X POST http://admin:admin@localhost:3000/api/datasources \
  -H 'Content-Type: application/json' \
  -d '{"name":"Prometheus","type":"prometheus","url":"http://localhost:9090","access":"proxy"}'

# Import dashboard
curl -X POST http://admin:admin@localhost:3000/api/dashboards/db \
  -H 'Content-Type: application/json' \
  -d @dashboard.json
```

### Application Monitoring

#### 1. Health Check Endpoints
```javascript
// services/auth-service/src/routes/health.js
const express = require('express');
const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await req.app.locals.db.query('SELECT 1');
    
    // Check Redis connection
    await req.app.locals.redis.ping();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
      version: process.env.npm_package_version
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
      error: error.message
    });
  }
});

router.get('/ready', async (req, res) => {
  // Readiness probe - check if service is ready to accept traffic
  try {
    // Check if critical dependencies are available
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;
```

#### 2. Metrics Collection
```javascript
// services/auth-service/src/middleware/metrics.js
const promClient = require('prom-client');

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);

module.exports = {
  register,
  httpRequestDuration,
  httpRequestsTotal
};
```

---

## Backup Strategy

### Database Backup

#### 1. Automated Daily Backups
```bash
#!/bin/bash
# backup_db.sh

BACKUP_DIR="/backups/landlordms"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="landlordms"
DB_USER="landlordms_user"
DB_HOST="localhost"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME | gzip > $BACKUP_DIR/landlordms_$DATE.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -name "landlordms_*.sql.gz" -mtime +30 -delete

echo "Database backup completed: landlordms_$DATE.sql.gz"
```

#### 2. Continuous Archiving (Point-in-Time Recovery)
```bash
# Add to postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'rsync %p backup-server:/wal-archive/%f'
max_wal_senders = 10
wal_keep_segments = 64
```

#### 3. Restore Database
```bash
# Restore from backup
gunzip -c landlordms_20231030_120000.sql.gz | psql -h localhost -U landlordms_user -d landlordms

# Point-in-time recovery
# Stop PostgreSQL
sudo systemctl stop postgresql

# Restore base backup
rm -rf /var/lib/postgresql/15/main/*
tar -xzf base_backup.tar.gz -C /var/lib/postgresql/15/main/

# Create recovery.conf
cat > /var/lib/postgresql/15/main/recovery.conf << EOF
restore_command = 'cp /wal-archive/%f %p'
recovery_target_time = '2023-10-30 12:30:00'
recovery_target_action = 'promote'
EOF

# Start PostgreSQL
sudo systemctl start postgresql
```

### File System Backup

#### 1. S3 Backup Script
```bash
#!/bin/bash
# backup_files.sh

AWS_BUCKET="landlordms-backups"
DATE=$(date +%Y%m%d)

# Backup documents
aws s3 sync /app/documents s3://$AWS_BUCKET/documents_$DATE/

# Backup configuration files
tar -czf /tmp/config_$DATE.tar.gz /app/config/
aws s3 cp /tmp/config_$DATE.tar.gz s3://$AWS_BUCKET/config/

# Cleanup old backups
aws s3 ls s3://$AWS_BUCKET/ | while read -r line; do
  backup_date=$(echo $line | awk '{print $4}' | cut -d'/' -f1)
  if [[ $backup_date < $(date -d '30 days ago' +%Y%m%d) ]]; then
    aws s3 rm s3://$AWS_BUCKET/$backup_date --recursive
  fi
done
```

---

## Security Configuration

### Firewall Setup

#### 1. UFW Configuration
```bash
# Reset UFW
sudo ufw --force reset

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow database (internal only)
sudo ufw allow from 10.0.0.0/8 to any port 5432

# Enable UFW
sudo ufw enable
```

#### 2. Fail2Ban Configuration
```bash
# Install Fail2Ban
sudo apt install fail2ban

# Configure jail for Nginx
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
EOF

# Restart Fail2Ban
sudo systemctl restart fail2ban
```

### Application Security

#### 1. Environment Variables Security
```bash
# Use secure random strings for secrets
openssl rand -hex 32  # For JWT_SECRET
openssl rand -base64 32  # For passwords

# Store secrets in secure vault (AWS Secrets Manager, Azure Key Vault, etc.)
aws secretsmanager create-secret \
  --name "landlordms/jwt-secret" \
  --secret-string "your-jwt-secret"

# Use secrets in Kubernetes
kubectl create secret generic jwt-secret \
  --from-literal=jwt-secret=your-jwt-secret
```

#### 2. API Security Headers
```nginx
# Nginx security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

---

## Performance Optimization

### Database Optimization

#### 1. PostgreSQL Configuration
```sql
-- Add to postgresql.conf for optimal performance

-- Memory settings
shared_buffers = 4GB                # 25% of total RAM
effective_cache_size = 12GB         # 75% of total RAM
work_mem = 256MB                    # Per operation
maintenance_work_mem = 2GB

-- Checkpoint settings
checkpoint_completion_target = 0.9
wal_buffers = 64MB
checkpoint_timeout = 10min
max_wal_size = 4GB
min_wal_size = 1GB

-- Query planner
random_page_cost = 1.1              # For SSDs
effective_io_concurrency = 200      # For SSDs

-- Connection settings
max_connections = 200
```

#### 2. Database Indexing Strategy
```sql
-- Create indexes for frequently queried columns

-- Composite indexes for multi-column queries
CREATE INDEX CONCURRENTLY idx_payments_tenant_date ON payments(tenant_id, payment_date);
CREATE INDEX CONCURRENTLY idx_leases_property_status ON leases(property_id, status);

-- Partial indexes for specific conditions
CREATE INDEX CONCURRENTLY idx_payments_overdue ON payments(due_date, status) 
WHERE status IN ('pending', 'overdue');

-- Expression indexes for computed columns
CREATE INDEX CONCURRENTLY idx_payments_net_amount ON payments(amount + late_fee - discount_amount);
```

### Application Performance

#### 1. Caching Strategy
```javascript
// Redis caching example
const redis = require('redis');
const client = redis.createClient({
  host: 'redis-host',
  password: 'redis-password'
});

async function getCachedProperty(propertyId) {
  const cacheKey = `property:${propertyId}`;
  
  // Try to get from cache
  let property = await client.get(cacheKey);
  
  if (property) {
    return JSON.parse(property);
  }
  
  // If not in cache, get from database
  property = await db.query('SELECT * FROM properties WHERE property_id = $1', [propertyId]);
  
  // Store in cache for 1 hour
  await client.setex(cacheKey, 3600, JSON.stringify(property));
  
  return property;
}
```

#### 2. Connection Pooling
```javascript
// Database connection pooling
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'landlordms',
  user: 'landlordms_user',
  password: 'password',
  max: 20,                    // Maximum number of clients
  idleTimeoutMillis: 30000,   // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds
});

// Use in routes
app.get('/properties', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM properties');
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check listening ports
sudo netstat -tlnp | grep 5432

# Test connection
psql -h localhost -U landlordms_user -d landlordms -c "SELECT 1;"

# Check logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

#### 2. Redis Connection Issues
```bash
# Check Redis status
sudo systemctl status redis-server

# Test connection
redis-cli -h localhost -p 6379 -a redis_password ping

# Check memory usage
redis-cli -h localhost -p 6379 -a redis_password info memory
```

#### 3. Application Service Issues
```bash
# Check service logs
kubectl logs -f deployment/auth-service -n landlordms-prod

# Check resource usage
kubectl top pods -n landlordms-prod

# Scale service
kubectl scale deployment auth-service --replicas=5 -n landlordms-prod

# Rollback deployment
kubectl rollout undo deployment/auth-service -n landlordms-prod
```

#### 4. Performance Issues
```sql
-- Check slow queries
SELECT query, mean_time, calls, total_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;

-- Check database size
SELECT 
    pg_size_pretty(pg_database_size('landlordms')) as database_size;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Log Analysis

#### 1. Centralized Logging with ELK Stack
```yaml
# docker-compose.elk.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.10.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  kibana:
    image: docker.elastic.co/kibana/kibana:8.10.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

  logstash:
    image: docker.elastic.co/logstash/logstash:8.10.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:
```

#### 2. Log Configuration
```json
// logstash.conf
input {
  file {
    path => "/var/log/landlordms/*.log"
    start_position => "beginning"
    sincedb_path => "/dev/null"
  }
}

filter {
  if [path] =~ "auth-service" {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{DATA:service} %{GREEDYDATA:message}" }
    }
    date {
      match => [ "timestamp", "ISO8601" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "landlordms-%{+YYYY.MM.dd}"
  }
}
```

---

## Maintenance

### Regular Maintenance Tasks

#### 1. Daily Tasks
- Monitor system health and alerts
- Check backup completion
- Review error logs
- Monitor disk usage

#### 2. Weekly Tasks
- Update security patches
- Review performance metrics
- Clean up old log files
- Test backup restoration

#### 3. Monthly Tasks
- Database vacuum and analyze
- Update dependencies
- Security audit
- Performance optimization review
- Capacity planning assessment

#### 4. Automated Maintenance Script
```bash
#!/bin/bash
# maintenance.sh

echo "Starting monthly maintenance..."

# Database maintenance
echo "Running database maintenance..."
sudo -u postgres psql -d landlordms -c "VACUUM ANALYZE;"

# Clean up old logs
echo "Cleaning up old logs..."
find /var/log/landlordms -name "*.log" -mtime +30 -delete

# Update system packages
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Check disk space
echo "Checking disk space..."
df -h

# Check memory usage
echo "Checking memory usage..."
free -h

# Restart services if needed
echo "Checking service health..."
systemctl is-active postgresql
systemctl is-active redis-server
systemctl is-active nginx

echo "Monthly maintenance completed!"
```

---

This deployment guide provides a comprehensive approach to setting up and maintaining the Landlord Management System in production. Adjust configurations based on your specific infrastructure requirements and scale as needed.
