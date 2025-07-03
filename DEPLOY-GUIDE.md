# 🚀 Guía de Despliegue - TechStore Full Stack

## 📋 Resumen del Proyecto

**TechStore** es una aplicación full-stack que consta de:
- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Frontend**: React + TypeScript + Tailwind CSS
- **Despliegue**: Docker en Render

## 🏗️ Arquitectura de Despliegue

### Backend (FastAPI)
- **Dockerfile**: `Dockerfile`
- **Puerto**: 8000
- **Health Check**: `/api/salud`
- **Base de datos**: SQLite (se crea automáticamente)
- **URL**: `https://techstore-backend.onrender.com`

### Frontend (React + Nginx)
- **Dockerfile**: `Dockerfile.frontend`
- **Puerto**: 80
- **Health Check**: `/`
- **Servidor**: Nginx para archivos estáticos
- **URL**: `https://techstore-frontend.onrender.com`

## 🔧 Configuración

### Variables de Entorno - Backend
```yaml
PYTHONPATH: /app
DATABASE_URL: sqlite:///./inventario.db
ENVIRONMENT: production
CORS_ORIGINS: "*"
```

### Variables de Entorno - Frontend
```yaml
REACT_APP_API_URL: https://techstore-backend.onrender.com
NODE_ENV: production
```

## 🚀 Pasos para Desplegar

### 1. Verificar Configuración
```bash
# Ejecutar script de verificación
bash verify-deploy.sh
```

### 2. Commit y Push
```bash
git add -A
git commit -m "feat: configuración completa para deploy Docker en Render"
git push origin main
```

### 3. Configurar Render

#### Opción A: Usando render.yaml (Recomendado)
1. Ve a [Render Dashboard](https://render.com/)
2. Conecta tu repositorio de GitHub
3. Render detectará automáticamente el archivo `render.yaml`
4. Se crearán ambos servicios automáticamente

#### Opción B: Configuración Manual
1. **Crear Servicio Backend**:
   - Tipo: Web Service
   - Entorno: Docker
   - Dockerfile: `./Dockerfile`
   - Plan: Starter (gratuito)
   - Health Check: `/api/salud`

2. **Crear Servicio Frontend**:
   - Tipo: Web Service
   - Entorno: Docker
   - Dockerfile: `./Dockerfile.frontend`
   - Plan: Starter (gratuito)
   - Health Check: `/`

### 4. Configurar Variables de Entorno
En el dashboard de Render, agregar las variables listadas arriba.

## 📊 Monitoreo

### URLs de Producción
- **Frontend**: https://techstore-frontend.onrender.com
- **Backend API**: https://techstore-backend.onrender.com
- **Documentación API**: https://techstore-backend.onrender.com/api/docs
- **Health Check Backend**: https://techstore-backend.onrender.com/api/salud

### Logs
```bash
# Ver logs en tiempo real desde Render Dashboard
# O usando Render CLI
render logs <service-name>
```

## 🔍 Solución de Problemas

### Error: "uvicorn command not found"
- **Solución**: Verificar que el PATH esté correctamente configurado en el Dockerfile
- **Status**: ✅ Corregido en el Dockerfile actual

### Error: "Database not found"
- **Solución**: La base de datos se crea automáticamente en el entrypoint
- **Status**: ✅ Implementado en el entrypoint.sh

### Error: "CORS issues"
- **Solución**: CORS está configurado para permitir todos los orígenes
- **Status**: ✅ Configurado en backend/main.py

### Error: "Frontend can't reach backend"
- **Solución**: Verificar que REACT_APP_API_URL apunte a la URL correcta del backend
- **Status**: ✅ Configurado en render.yaml

## 📈 Optimizaciones Implementadas

### Backend
- ✅ Python 3.11 (estable, sin dependencias Rust)
- ✅ FastAPI 0.95.2 (versión estable)
- ✅ Pydantic 1.10.12 (sin compilación Rust)
- ✅ SQLAlchemy 1.4.48 (compatible)
- ✅ Uvicorn con verificación de instalación
- ✅ Entrypoint optimizado para inicialización de DB
- ✅ Health check endpoint configurado

### Frontend
- ✅ Build multi-stage para optimizar tamaño
- ✅ Nginx para servir archivos estáticos
- ✅ Configuración de caché para assets
- ✅ Compresión gzip habilitada
- ✅ Headers de seguridad configurados
- ✅ Soporte para React Router

### Docker
- ✅ .dockerignore para optimizar builds
- ✅ Imágenes slim para reducir tamaño
- ✅ Variables de entorno optimizadas
- ✅ Health checks configurados
- ✅ Configuración de producción

## 🔄 Workflow de Deploy

```bash
# 1. Desarrollo local
docker-compose up

# 2. Verificación
bash verify-deploy.sh

# 3. Deploy
git add -A && git commit -m "feat: nueva funcionalidad"
git push origin main

# 4. Render despliega automáticamente
```

## 📚 Recursos Adicionales

- [Documentación de Render](https://render.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Docker Best Practices](https://docs.docker.com/develop/best-practices/)

## 🎯 Próximos Pasos

1. **Base de Datos Externa**: Migrar a PostgreSQL para persistencia
2. **CDN**: Configurar CloudFront para assets estáticos
3. **Monitoreo**: Implementar logging y métricas
4. **CI/CD**: Configurar GitHub Actions para testing automático
5. **SSL**: Configurar certificados SSL personalizados

---

**Última actualización**: $(date)
**Version**: 1.0.0
**Autor**: Sistema de Deploy Automatizado
