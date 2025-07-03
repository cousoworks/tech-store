#!/bin/bash

# ==========================================
# SCRIPT DE VERIFICACIÓN PRE-DEPLOY
# ==========================================

echo "🔍 Verificando configuración del proyecto..."

# Verificar archivos esenciales
echo "📁 Verificando archivos..."
files_to_check=(
    "Dockerfile"
    "Dockerfile.frontend"
    "render.yaml"
    "backend/requirements.txt"
    "backend/main.py"
    "frontend/package.json"
    "docker/nginx.prod.conf"
    "docker-compose.yml"
)

missing_files=()
for file in "${files_to_check[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo "❌ Archivos faltantes:"
    printf '%s\n' "${missing_files[@]}"
    exit 1
fi

echo "✅ Todos los archivos necesarios están presentes"

# Verificar configuración de Docker
echo "🐳 Verificando configuración Docker..."

# Verificar que el health check endpoint existe
if grep -q "/api/salud" backend/main.py; then
    echo "✅ Health check endpoint configurado"
else
    echo "❌ Health check endpoint no encontrado"
    exit 1
fi

# Verificar CORS
if grep -q "CORSMiddleware" backend/main.py; then
    echo "✅ CORS configurado"
else
    echo "❌ CORS no configurado"
    exit 1
fi

# Verificar variables de entorno en frontend
if grep -q "REACT_APP_API_URL" frontend/src/services/api.ts; then
    echo "✅ Variables de entorno del frontend configuradas"
else
    echo "❌ Variables de entorno del frontend no encontradas"
    exit 1
fi

echo "🎉 Verificación completada exitosamente!"
echo ""
echo "🚀 PASOS PARA DEPLOY EN RENDER:"
echo "1. Hacer push de todos los cambios a GitHub"
echo "2. Ir a https://render.com/"
echo "3. Conectar tu repositorio de GitHub"
echo "4. Render detectará automáticamente el archivo render.yaml"
echo "5. Se desplegarán ambos servicios (backend y frontend)"
echo ""
echo "📋 URLS DE PRODUCCIÓN:"
echo "- Backend API: https://techstore-backend.onrender.com"
echo "- Frontend: https://techstore-frontend.onrender.com"
echo "- Docs API: https://techstore-backend.onrender.com/api/docs"
echo ""
echo "⚠️  IMPORTANTE:"
echo "- El primer deploy puede tomar 15-20 minutos"
echo "- Los servicios gratuitos se duermen después de 15 min de inactividad"
echo "- La base de datos SQLite se resetea en cada nuevo deploy"
echo ""
