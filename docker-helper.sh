#!/bin/bash

# Docker helper script for Video Meme Processor
# This script provides easy commands for managing the application

case "$1" in
  "start")
    echo "🚀 Starting Video Meme Processor..."
    sudo docker-compose up -d
    echo "✅ Services started!"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend: http://localhost:3001"
    ;;
  "stop")
    echo "🛑 Stopping Video Meme Processor..."
    sudo docker-compose down
    echo "✅ Services stopped!"
    ;;
  "restart")
    echo "🔄 Restarting Video Meme Processor..."
    sudo docker-compose down
    sudo docker-compose up -d
    echo "✅ Services restarted!"
    ;;
  "logs")
    echo "📋 Showing logs..."
    sudo docker-compose logs -f
    ;;
  "build")
    echo "🔨 Rebuilding containers..."
    sudo docker-compose up --build -d
    echo "✅ Containers rebuilt!"
    ;;
  "status")
    echo "📊 Container status:"
    sudo docker-compose ps
    ;;
  "clean")
    echo "🧹 Cleaning up containers and images..."
    sudo docker-compose down
    sudo docker system prune -f
    echo "✅ Cleanup completed!"
    ;;
  *)
    echo "Video Meme Processor Docker Helper"
    echo ""
    echo "Usage: $0 {start|stop|restart|logs|build|status|clean}"
    echo ""
    echo "Commands:"
    echo "  start   - Start the application"
    echo "  stop    - Stop the application"
    echo "  restart - Restart the application"
    echo "  logs    - Show application logs"
    echo "  build   - Rebuild containers"
    echo "  status  - Show container status"
    echo "  clean   - Clean up containers and images"
    ;;
esac
