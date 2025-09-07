#!/bin/bash

# Videtopia Deployment Script
# This script helps deploy Videtopia using Docker Compose

set -e

# Colors for output
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

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        echo "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi

    print_success "Docker and Docker Compose are installed"
}

# Function to check if ports are available
check_ports() {
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port 3000 is already in use. The frontend may not start properly."
    fi

    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port 3001 is already in use. The backend may not start properly."
    fi
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    mkdir -p backend/uploads backend/outputs
    print_success "Directories created"
}

# Function to deploy the application
deploy() {
    print_status "Starting Videtopia deployment..."
    
    # Pull latest images if they exist
    print_status "Building Docker images..."
    sudo docker-compose build --no-cache
    
    # Start services
    print_status "Starting services..."
    sudo docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check if services are running
    if curl -f http://localhost:3001/health >/dev/null 2>&1; then
        print_success "Backend is running at http://localhost:3001"
    else
        print_error "Backend failed to start"
        docker-compose logs backend
        exit 1
    fi
    
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        print_success "Frontend is running at http://localhost:3000"
    else
        print_error "Frontend failed to start"
        docker-compose logs frontend
        exit 1
    fi
    
    print_success "Videtopia is now running!"
    echo ""
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:3001"
    echo "❤️  Health Check: http://localhost:3001/health"
    echo ""
    echo "To view logs: docker-compose logs -f"
    echo "To stop: docker-compose down"
}

# Function to stop the application
stop() {
    print_status "Stopping Videtopia..."
    sudo docker-compose down
    print_success "Videtopia stopped"
}

# Function to show logs
logs() {
    sudo docker-compose logs -f
}

# Function to show status
status() {
    print_status "Videtopia Status:"
    sudo docker-compose ps
}

# Function to show help
show_help() {
    echo "Videtopia Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy    Deploy Videtopia (default)"
    echo "  stop      Stop Videtopia"
    echo "  restart   Restart Videtopia"
    echo "  logs      Show logs"
    echo "  status    Show status"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy    # Deploy the application"
    echo "  $0 logs      # View logs"
    echo "  $0 stop      # Stop the application"
}

# Main script logic
main() {
    case "${1:-deploy}" in
        deploy)
            check_docker
            check_ports
            create_directories
            deploy
            ;;
        stop)
            stop
            ;;
        restart)
            stop
            sleep 5
            deploy
            ;;
        logs)
            logs
            ;;
        status)
            status
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
