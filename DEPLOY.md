# 🚀 Guía de Despliegue - TechStore Full Stack

## 📋 Resumen del Proyecto

**TechStore** es una aplicación full stack que incluye:
- **Backend**: FastAPI con Python 3.11
- **Frontend**: React con TypeScript
- **Base de datos**: SQLite (local/containerizada)
- **Despliegue**: Docker en Render

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   (React+Nginx) │────│   (FastAPI)     │
│   Port: 80      │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │   SQLite DB     │
         │              │   (inventario)  │
         └──────────────┤                 │
                        └─────────────────┘
```

## 📁 Estructura de Archivos Clave

```
inventario-python-shop/
├── 🐳 Dockerfile                 # Backend container
├── 🐳 Dockerfile.frontend        # Frontend container  
├── ⚙️  render.yaml               # Render deployment config
├── 📦 docker-compose.yml         # Local development
├── 🔧 verify-deploy.sh           # Pre-deploy verification
├── backend/
│   ├── 📄 requirements.txt       # Python dependencies
│   ├── 🐍 main.py               # FastAPI application
│   └── 📊 models.py             # Database models
├── frontend/
│   ├── 📦 package.json          # Node dependencies
│   └── src/services/api.ts      # API client
└── docker/
    ├── 🌐 nginx.conf            # Local nginx config
    └── 🌐 nginx.prod.conf       # Production nginx config
```

## 🔧 Configuración Actual

### Backend (FastAPI)
- **Python**: 3.11.9 (estable, sin dependencias Rust)
- **FastAPI**: 0.95.2 (compatible)
- **Pydantic**: 1.10.12 (v1, sin Rust)
- **Uvicorn**: 0.20.0
- **Health Check**: `/api/salud`
- **CORS**: Configurado para todos los orígenes

### Frontend (React)
- **Node**: 18-alpine
- **Build**: npm run build
- **Servidor**: Nginx
- **API URL**: Variable de entorno `REACT_APP_API_URL`

### Base de Datos
- **Tipo**: SQLite
- **Archivo**: `inventario.db`
- **Inicialización**: Automática en startup
- **⚠️ Nota**: Se resetea en cada deploy

## 🚀 Proceso de Despliegue

### 1. Verificación Pre-Deploy
```bash
bash verify-deploy.sh
```

### 2. Commit y Push
```bash
git add -A
git commit -m "feat: configuración completa para deploy Docker en Render"
git push origin main
```

### 3. Configurar en Render
1. Ir a [render.com](https://render.com)
2. Conectar repositorio GitHub
3. Render detectará automáticamente `render.yaml`
4. Se crearán 2 servicios:
   - `techstore-backend` (FastAPI)
   - `techstore-frontend` (React+Nginx)

### 4. URLs de Producción
- **Frontend**: https://techstore-frontend.onrender.com
- **Backend API**: https://techstore-backend.onrender.com
- **API Docs**: https://techstore-backend.onrender.com/api/docs
- **Health Check**: https://techstore-backend.onrender.com/api/salud

## 🧪 Desarrollo Local

### Docker Compose (Recomendado)
```bash
# Construir y levantar servicios
docker-compose up --build

# URLs locales
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

### Desarrollo Nativo
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (nueva terminal)
cd frontend
npm install
npm start
```

## ⚙️ Variables de Entorno

### Backend
- `PYTHONPATH=/app`
- `DATABASE_URL=sqlite:///./inventario.db`
- `ENVIRONMENT=production`
- `CORS_ORIGINS=*`

### Frontend
- `REACT_APP_API_URL=https://techstore-backend.onrender.com`
- `NODE_ENV=production`

## 🔍 Monitoreo y Debug

### Health Checks
```bash
# Backend
curl https://techstore-backend.onrender.com/api/salud

# Frontend
curl https://techstore-frontend.onrender.com/
```

### Logs en Render
- Dashboard → Service → Logs
- Errores comunes:
  - Dependencias faltantes
  - Variables de entorno
  - Port binding

## ⚠️ Consideraciones Importantes

### Limitaciones Render Gratuito
- **Sleep**: Servicios duermen después de 15 min inactividad
- **Build Time**: 15-20 minutos primer deploy
- **Storage**: Efímero, datos se pierden en redeploy

### Base de Datos
- SQLite se resetea en cada deploy
- Para persistencia, migrar a PostgreSQL
- Datos de prueba se recrean automáticamente

### Performance
- **Cold Start**: ~30 segundos primer request
- **Cache**: Nginx cachea assets estáticos
- **Compresión**: Gzip habilitado

## 📝 Comandos Útiles

```bash
# Verificar configuración
bash verify-deploy.sh

# Build local Docker
docker build -f Dockerfile -t techstore-backend .
docker build -f Dockerfile.frontend -t techstore-frontend .

# Logs locales
docker-compose logs -f backend
docker-compose logs -f frontend

# Reset completo
docker-compose down -v
docker system prune -f
```

## 🆘 Troubleshooting

### Error: "uvicorn: command not found"
- ✅ **Solucionado**: PATH configurado en Dockerfile

### Error: "Module not found"
- ✅ **Solucionado**: PYTHONPATH configurado

### Error: "Build failed - Rust dependencies"
- ✅ **Solucionado**: Versiones downgradeadas

### Error: "Database not found"
- ✅ **Solucionado**: Inicialización automática en entrypoint

### Error: "CORS policy"
- ✅ **Solucionado**: CORS configurado para todos los orígenes

### Error: "Frontend can't reach backend"
- ✅ **Solucionado**: Variables de entorno configuradas

## 🎯 Próximos Pasos

1. **Deploy Actual**: Hacer push y deploy en Render
2. **Testing**: Verificar ambos servicios funcionando
3. **Monitoreo**: Observar logs y performance
4. **Optimización**: Ajustar según resultados
5. **Documentación**: Actualizar este README con URLs reales

---

**Estado**: ✅ **LISTO PARA DEPLOY**

Todos los archivos configurados, verificaciones pasadas, listo para producción en Render.
