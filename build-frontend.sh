#!/bin/bash

# Script para construir el frontend con la URL del backend correcta
echo "🎨 Construyendo Frontend para Render..."

# Verificar que existe la variable de entorno
if [ -z "$REACT_APP_API_URL" ]; then
    echo "⚠️  REACT_APP_API_URL no está definida, usando valor por defecto"
    export REACT_APP_API_URL="https://techstore-backend.onrender.com"
fi

echo "🔗 Usando API URL: $REACT_APP_API_URL"

# Ir al directorio del frontend
cd frontend

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Construir el proyecto
echo "🏗️  Construyendo proyecto..."
npm run build

echo "✅ Frontend construido correctamente"
echo "📂 Archivos listos en: frontend/build/"
