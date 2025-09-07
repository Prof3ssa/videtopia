#!/bin/bash

echo "🚀 Starting Video Meme Processor..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if FFmpeg is installed (for local development)
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg is not installed locally. The Docker container will handle this."
fi

echo "📦 Building and starting services..."
docker-compose up --build -d

echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend is running at http://localhost:3001"
else
    echo "❌ Backend failed to start"
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running at http://localhost:3000"
else
    echo "❌ Frontend failed to start"
fi

echo ""
echo "🎉 Video Meme Processor is ready!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo ""
echo "To stop the services, run: docker-compose down"
