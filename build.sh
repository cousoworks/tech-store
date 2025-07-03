#!/bin/bash

# Script para Render deployment

echo "🚀 Iniciando despliegue en Render..."

# Verificar si estamos en el directorio raíz del proyecto
if [ ! -f "backend/requirements.txt" ]; then
    echo "❌ Error: Estructura del proyecto no encontrada"
    exit 1
fi

# Configurar base de datos inicial si no existe
if [ ! -f "inventario.db" ]; then
    echo "📊 Configurando base de datos inicial..."
    python configurar_db.py
fi

echo "✅ Backend preparado para Render"

# Construir el frontend
echo "📦 Construyendo frontend React..."
cd frontend

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependencias de npm..."
    npm install
fi

# Construir el proyecto
echo "🔨 Ejecutando build de React..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend construido exitosamente"
else
    echo "❌ Error construyendo el frontend"
    exit 1
fi

# Volver al directorio raíz
cd ..

# Verificar si existe el directorio build
if [ -d "frontend/build" ]; then
    echo "✅ Archivos estáticos listos en frontend/build/"
    echo "📁 Contenido del directorio build:"
    ls -la frontend/build/
else
    echo "❌ Error: Directorio build no encontrado"
    exit 1
fi

echo ""
echo "🎉 ¡Aplicación construida exitosamente!"
echo ""
echo "Para ejecutar la aplicación:"
echo "1. Asegúrate de tener PostgreSQL ejecutándose"
echo "2. Configura las variables de entorno en .env"
echo "3. Ejecuta: python main.py"
echo ""
echo "La aplicación estará disponible en http://localhost:8000"
