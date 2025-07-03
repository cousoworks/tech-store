# ==========================================
# DOCKERFILE BACKEND - PYTHON + FASTAPI
# ==========================================

# Usar Python 3.11 (estable, sin problemas Rust)
FROM python:3.11-slim

# Establecer directorio de trabajo
WORKDIR /app

# Variables de entorno para Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PATH="/usr/local/bin:$PATH"

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    libffi-dev \
    libssl-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements y instalar dependencias Python
COPY backend/requirements.txt /app/requirements.txt

# Instalar dependencias con versiones específicas y estables
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Verificar instalación de dependencias críticas (debug)
RUN pip list | grep -E "(uvicorn|fastapi|pydantic|sqlalchemy)" || echo "⚠️ Algunas dependencias no se encontraron"

# Verificar importaciones básicas
RUN python -c "import uvicorn; print('✅ uvicorn OK')" || echo "❌ uvicorn failed"
RUN python -c "import fastapi; print('✅ fastapi OK')" || echo "❌ fastapi failed"
RUN python -c "import sqlalchemy; print('✅ sqlalchemy OK')" || echo "❌ sqlalchemy failed"
RUN python -c "import pydantic; print('✅ pydantic OK')" || echo "❌ pydantic failed"

# Copiar código del backend
COPY backend/ /app/backend/

# Crear directorio para base de datos
RUN mkdir -p /app/data

# Crear script de inicialización simplificado
RUN echo '#!/bin/bash\n\
set -e\n\
cd /app\n\
export PATH="/usr/local/bin:$PATH"\n\
echo "Inicializando base de datos..."\n\
python -c "import sys; sys.path.append(\"/app\"); from backend.database import engine; from backend.models import Base; Base.metadata.create_all(bind=engine); print(\"✅ Base de datos creada/verificada\")"\n\
echo "Iniciando aplicación..."\n\
echo "🔍 Verificando uvicorn disponible..."\n\
which uvicorn || echo "⚠️ uvicorn no encontrado en PATH, usando python -m uvicorn"\n\
exec "$@"' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Exponer puerto
EXPOSE 8000

# Comando para ejecutar la aplicación
CMD ["/app/entrypoint.sh", "python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
