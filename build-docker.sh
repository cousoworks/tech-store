#!/bin/bash

# ==========================================
# SCRIPT BUILD DOCKER - TECHSTORE
# ==========================================

echo "🐳 Construyendo imágenes Docker..."

# Construir backend
echo "📦 Construyendo backend..."
docker build -t techstore-backend .

# Construir frontend
echo "⚛️ Construyendo frontend..."
docker build -f Dockerfile.frontend -t techstore-frontend .

echo "✅ Imágenes construidas exitosamente!"

# Opcional: Ejecutar contenedores
echo "🚀 ¿Quieres ejecutar los contenedores? (y/n)"
read -r response

if [[ "$response" = "y" || "$response" = "Y" ]]; then
    echo "🏃‍♂️ Ejecutando contenedores..."
    docker-compose up -d
    echo "✅ Contenedores ejecutándose!"
    echo "🌐 Backend: http://localhost:8000"
    echo "🌐 Frontend: http://localhost:3000"
    echo "📚 Docs API: http://localhost:8000/api/docs"
fi
