#!/bin/bash

# Phase 1A Infrastructure Deployment Script
# Landlord Management System - Infrastructure Foundation

set -e

echo "🚀 Starting Phase 1A: Infrastructure Foundation Deployment"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    
    # Check docker
    if ! command -v docker &> /dev/null; then
        print_error "docker is not installed. Please install docker first."
        exit 1
    fi
    
    # Check cluster connection
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Deploy namespace
deploy_namespace() {
    print_status "Deploying namespaces..."
    kubectl apply -f infrastructure/kubernetes/namespaces/
    kubectl wait --for=condition=namespace/landlord-system-valid name=landlord-system --timeout=60s
    print_success "Namespaces deployed"
}

# Deploy ConfigMaps and Secrets
deploy_config_secrets() {
    print_status "Deploying ConfigMaps and Secrets..."
    kubectl apply -f infrastructure/kubernetes/configmaps/
    kubectl apply -f infrastructure/kubernetes/secrets/
    kubectl apply -f infrastructure/kubernetes/persistent-volumes/
    print_success "ConfigMaps, Secrets, and PVs deployed"
}

# Deploy databases
deploy_databases() {
    print_status "Deploying databases (PostgreSQL, Redis, MongoDB, RabbitMQ)..."
    
    # Deploy PostgreSQL
    kubectl apply -f infrastructure/kubernetes/deployments/postgres.yaml
    print_status "Waiting for PostgreSQL to be ready..."
    kubectl wait --for=condition=available deployment/postgres-deployment -n landlord-system --timeout=300s
    
    # Deploy Redis
    kubectl apply -f infrastructure/kubernetes/deployments/redis.yaml
    print_status "Waiting for Redis to be ready..."
    kubectl wait --for=condition=available deployment/redis-deployment -n landlord-system --timeout=300s
    
    # Deploy MongoDB
    kubectl apply -f infrastructure/kubernetes/deployments/mongodb.yaml
    print_status "Waiting for MongoDB to be ready..."
    kubectl wait --for=condition=available deployment/mongodb-deployment -n landlord-system --timeout=300s
    
    # Deploy RabbitMQ
    kubectl apply -f infrastructure/kubernetes/deployments/rabbitmq.yaml
    print_status "Waiting for RabbitMQ to be ready..."
    kubectl wait --for=condition=available deployment/rabbitmq-deployment -n landlord-system --timeout=300s
    
    print_success "All databases deployed and ready"
}

# Deploy ingress
deploy_ingress() {
    print_status "Deploying ingress controller..."
    kubectl apply -f infrastructure/kubernetes/ingresses/
    print_success "Ingress configured"
}

# Build and push Docker images
build_images() {
    print_status "Building Docker images..."
    
    # Build Auth Service
    print_status "Building auth-service image..."
    docker build -t landlord-system/auth-service:latest services/auth-service/
    
    # Build Property Service
    print_status "Building property-service image..."
    docker build -t landlord-system/property-service:latest services/property-service/
    
    # Build API Gateway
    print_status "Building api-gateway image..."
    docker build -t landlord-system/api-gateway:latest services/api-gateway/
    
    print_success "Docker images built successfully"
}

# Deploy microservices
deploy_microservices() {
    print_status "Deploying microservices..."
    
    # Apply deployments (images should be built and available)
    kubectl apply -f infrastructure/kubernetes/deployments/auth-service.yaml
    kubectl apply -f infrastructure/kubernetes/deployments/property-service.yaml
    kubectl apply -f infrastructure/kubernetes/deployments/api-gateway.yaml
    
    print_success "Microservice deployments created"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for all services to be ready..."
    
    kubectl wait --for=condition=available deployment/auth-service-deployment -n landlord-system --timeout=300s
    kubectl wait --for=condition=available deployment/property-service-deployment -n landlord-system --timeout=300s
    kubectl wait --for=condition=available deployment/api-gateway-deployment -n landlord-system --timeout=300s
    
    print_success "All microservices are ready"
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check pods
    echo "📋 All pods in landlord-system namespace:"
    kubectl get pods -n landlord-system
    
    echo ""
    echo "🗄️ Services:"
    kubectl get services -n landlord-system
    
    echo ""
    echo "💾 Storage:"
    kubectl get pvc -n landlord-system
    
    echo ""
    echo "🌐 Ingress:"
    kubectl get ingress -n landlord-system
    
    print_success "Deployment verification completed"
}

# Print next steps
print_next_steps() {
    echo ""
    echo "🎉 Phase 1A: Infrastructure Foundation - COMPLETED!"
    echo ""
    echo "✅ What was deployed:"
    echo "   • PostgreSQL database with 50GB storage"
    echo "   • Redis cache with 10GB storage"
    echo "   • MongoDB document store with 30GB storage"
    echo "   • RabbitMQ message queue with 20GB storage"
    echo "   • Auth Service (Node.js + TypeScript)"
    echo "   • Property Service (Java + Spring Boot)"
    echo "   • API Gateway (Node.js + Express)"
    echo "   • Ingress controller with SSL/TLS"
    echo "   • Persistent volume claims for data persistence"
    echo ""
    echo "🚀 Ready for Phase 1B: Core Microservices Implementation"
    echo ""
    echo "🔗 Access points (update DNS records):"
    echo "   • API Gateway: https://api.landlord-system.com"
    echo "   • Web App: https://landlord.landlord-system.com"
    echo "   • Admin Panel: https://admin.landlord-system.com"
    echo ""
    echo "📊 Monitoring:"
    echo "   • Grafana: http://localhost:3000 (admin/admin)"
    echo "   • Prometheus: http://localhost:9090"
    echo "   • RabbitMQ Management: http://rabbitmq.landlord-system.com:15672"
}

# Main execution
main() {
    echo "=================================="
    echo "🏗️  Landlord Management System"
    echo "   Phase 1A: Infrastructure Foundation"
    echo "=================================="
    echo ""
    
    # Check if we're in the right directory
    if [[ ! -f "docker-compose.yml" ]]; then
        print_error "Please run this script from the landlord-management-system-build directory"
        exit 1
    fi
    
    # Run deployment steps
    check_prerequisites
    deploy_namespace
    deploy_config_secrets
    deploy_databases
    deploy_ingress
    build_images
    deploy_microservices
    wait_for_services
    verify_deployment
    print_next_steps
    
    echo ""
    print_success "Phase 1A deployment completed successfully! 🎉"
}

# Execute main function
main "$@"