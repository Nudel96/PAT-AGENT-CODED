#!/bin/bash

# PriceActionTalk Production Deployment Script
set -e

echo "🚀 Starting PriceActionTalk deployment..."

# Configuration
ENVIRONMENT=${1:-production}
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
COMPOSE_FILE="docker-compose.prod.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running"
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f .env.production ]; then
        log_error ".env.production file not found"
        exit 1
    fi
    
    log_info "Prerequisites check passed ✓"
}

# Create backup
create_backup() {
    log_info "Creating backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup database
    if docker-compose -f "$COMPOSE_FILE" ps postgres | grep -q "Up"; then
        log_info "Backing up database..."
        docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U postgres priceactiontalk > "$BACKUP_DIR/database.sql"
    fi
    
    # Backup environment files
    cp .env.production "$BACKUP_DIR/"
    
    # Backup docker-compose file
    cp "$COMPOSE_FILE" "$BACKUP_DIR/"
    
    log_info "Backup created at $BACKUP_DIR ✓"
}

# Build and deploy
deploy() {
    log_info "Starting deployment..."
    
    # Copy production environment
    cp .env.production .env
    
    # Pull latest images
    log_info "Pulling latest images..."
    docker-compose -f "$COMPOSE_FILE" pull
    
    # Build custom images
    log_info "Building application images..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    
    # Stop existing services
    log_info "Stopping existing services..."
    docker-compose -f "$COMPOSE_FILE" down
    
    # Start services
    log_info "Starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    check_health
}

# Check service health
check_health() {
    log_info "Checking service health..."
    
    services=("postgres" "redis" "api" "frontend")
    
    for service in "${services[@]}"; do
        if docker-compose -f "$COMPOSE_FILE" ps "$service" | grep -q "Up (healthy)"; then
            log_info "$service is healthy ✓"
        else
            log_warn "$service is not healthy, checking logs..."
            docker-compose -f "$COMPOSE_FILE" logs --tail=20 "$service"
        fi
    done
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Wait for database to be ready
    sleep 10
    
    # Run migrations
    docker-compose -f "$COMPOSE_FILE" exec api npm run migrate
    
    log_info "Database migrations completed ✓"
}

# Setup SSL certificates (if using Let's Encrypt)
setup_ssl() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Setting up SSL certificates..."
        
        # Create SSL directory
        mkdir -p ./nginx/ssl
        
        # Generate self-signed certificates for development
        # In production, replace with Let's Encrypt or proper certificates
        if [ ! -f ./nginx/ssl/cert.pem ]; then
            log_warn "Generating self-signed SSL certificates for development"
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout ./nginx/ssl/key.pem \
                -out ./nginx/ssl/cert.pem \
                -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        fi
        
        log_info "SSL setup completed ✓"
    fi
}

# Cleanup old images and containers
cleanup() {
    log_info "Cleaning up old images and containers..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused containers
    docker container prune -f
    
    # Remove unused volumes (be careful with this in production)
    # docker volume prune -f
    
    log_info "Cleanup completed ✓"
}

# Show deployment status
show_status() {
    log_info "Deployment Status:"
    echo ""
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    
    log_info "Application URLs:"
    echo "Frontend: http://localhost:3000"
    echo "API: http://localhost:3001"
    echo "WebSocket: ws://localhost:3002"
    echo "Grafana: http://localhost:3001"
    echo "Prometheus: http://localhost:9090"
    echo ""
    
    log_info "To view logs: docker-compose -f $COMPOSE_FILE logs -f [service_name]"
    log_info "To stop services: docker-compose -f $COMPOSE_FILE down"
}

# Main deployment flow
main() {
    echo "🎯 PriceActionTalk Deployment Script"
    echo "Environment: $ENVIRONMENT"
    echo "Compose file: $COMPOSE_FILE"
    echo ""
    
    check_prerequisites
    create_backup
    setup_ssl
    deploy
    run_migrations
    cleanup
    show_status
    
    log_info "🎉 Deployment completed successfully!"
}

# Handle script arguments
case "$1" in
    "production"|"staging"|"")
        main
        ;;
    "health")
        check_health
        ;;
    "backup")
        create_backup
        ;;
    "cleanup")
        cleanup
        ;;
    "status")
        show_status
        ;;
    *)
        echo "Usage: $0 [production|staging|health|backup|cleanup|status]"
        exit 1
        ;;
esac
