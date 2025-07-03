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
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements y instalar dependencias Python
COPY backend/requirements.txt /app/requirements.txt

# Instalar dependencias con versiones específicas y estables
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip list | grep -E "(uvicorn|fastapi|pydantic|sqlalchemy)"

# Verificar instalación de dependencias críticas
RUN python -c "import uvicorn, fastapi, sqlalchemy, pydantic; print('✅ Dependencias instaladas correctamente')"

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
