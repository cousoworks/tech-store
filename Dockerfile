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
    PYTHONPATH=/app

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements y instalar dependencias Python
COPY backend/requirements.txt /app/requirements.txt

# Instalar dependencias con versiones específicas y estables
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar código del backend
COPY backend/ /app/backend/

# Crear directorio para base de datos
RUN mkdir -p /app/data

# Crear script de inicialización
RUN echo '#!/bin/bash\n\
cd /app\n\
python -c "\n\
import sys\n\
sys.path.append(\"/app\")\n\
from backend.database import engine\n\
from backend.models import Base\n\
Base.metadata.create_all(bind=engine)\n\
print(\"✅ Base de datos creada/verificada\")\n\
"\n\
exec \"$@\"' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Exponer puerto
EXPOSE 8000

# Punto de entrada
ENTRYPOINT ["/app/entrypoint.sh"]

# Comando para ejecutar la aplicación
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
