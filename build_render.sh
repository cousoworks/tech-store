#!/bin/bash
# Render build script - forzar Python 3.11

echo "🔍 Verificando versión de Python disponible..."
python3.11 --version || echo "Python 3.11 no disponible, usando python por defecto"
python --version

echo "📦 Instalando dependencias desde backend/requirements.txt..."
cd backend

# Forzar uso de pip más reciente
python -m pip install --upgrade pip

# Instalar con versiones específicas
python -m pip install fastapi==0.63.0
python -m pip install uvicorn==0.13.4
python -m pip install sqlalchemy==1.4.23
python -m pip install pydantic==1.7.4
python -m pip install python-jose==3.2.0
python -m pip install passlib==1.7.4
python -m pip install bcrypt==3.2.0
python -m pip install python-multipart==0.0.5
python -m pip install python-dotenv==0.19.0

echo "📊 Configurando base de datos..."
cd ..
python configurar_db.py

echo "✅ Build completado"
