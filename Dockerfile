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

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements y instalar dependencias Python
COPY backend/requirements.txt /app/requirements.txt

# Instalar dependencias con versiones específicas y estables
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar código del backend
COPY backend/ /app/backend/
COPY configurar_db.py /app/
COPY inventario.db /app/ 2>/dev/null || true

# Crear base de datos si no existe
RUN cd /app && python -c "
import sys
sys.path.append('/app')
from backend.database import engine
from backend.models import Base
Base.metadata.create_all(bind=engine)
print('✅ Base de datos creada/verificada')
"

# Exponer puerto
EXPOSE 8000

# Comando para ejecutar la aplicación
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
