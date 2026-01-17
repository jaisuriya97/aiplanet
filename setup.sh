#!/bin/bash

# Setup script for No-Code/Low-Code Workflow Builder

set -e

echo "========================================="
echo "Workflow Builder - Setup Script"
echo "========================================="
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "No .env file found. Creating from template..."
    cp backend/.env.example backend/.env
    echo "Created backend/.env file"
    echo ""
    echo "IMPORTANT: Please edit backend/.env and add your API keys:"
    echo "   - OPENAI_API_KEY"
    echo "   - GEMINI_API_KEY"
    echo "   - SERPAPI_API_KEY"
    echo ""
    read -p "Press Enter after you've updated the .env file..."
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker and Docker Compose first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "Docker and Docker Compose are installed"
echo ""

# Build and start services
echo "Building and starting services..."
echo ""

docker-compose down -v
docker-compose build
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "========================================="
    echo "Setup Complete!"
    echo "========================================="
    echo ""
    echo "Frontend: http://localhost:3000"
    echo "Backend API Docs: http://localhost:8000/api/docs"
    echo "PostgreSQL: localhost:5432"
    echo ""
    echo "To view logs:"
    echo "  docker-compose logs -f"
    echo ""
    echo "To stop services:"
    echo "  docker-compose down"
    echo ""
else
    echo "Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi
