# 🔧 Despliegue en Render - Guía Completa

## 🚀 Opción 1: Blueprint (Más Fácil)

1. **Sube tu código a GitHub**
2. **Ve a [Render.com](https://render.com)** y crea una cuenta
3. **Click en "New +"** → **"Blueprint"**
4. **Conecta tu repositorio**
5. **Nombre del Blueprint**: `techstore` (o el que prefieras)
6. **¡Render desplegará automáticamente el backend!**

## 🌐 Opción 2: Manual (2 servicios separados)

### 1️⃣ Backend (Web Service)
- **Repository**: Tu repositorio de GitHub
- **Branch**: `main`
- **Root Directory**: (vacío)
- **Environment**: `Python`
- **Build Command**: `cd backend && pip install -r requirements.txt && python ../deploy.py`
- **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

**Variables de entorno:**
```
DATABASE_URL=sqlite:///./inventario.db
SECRET_KEY=[Render lo genera automáticamente]
PYTHONPATH=/opt/render/project/src/backend
ENVIRONMENT=production
```

### 2️⃣ Frontend (Static Site)
- **Repository**: El mismo repositorio
- **Branch**: `main`
- **Root Directory**: (vacío)
- **Build Command**: `cd frontend && npm install && REACT_APP_API_URL=https://TU-BACKEND-URL.onrender.com npm run build`
- **Publish Directory**: `frontend/build`

**Variables de entorno:**
```
REACT_APP_API_URL=https://techstore-backend-XXXXX.onrender.com
```

## 🎯 Después del Despliegue

1. **Copia la URL del backend** (ej: https://techstore-backend-abc123.onrender.com)
2. **Actualiza la URL del frontend** en las variables de entorno
3. **Redesplegar el frontend** si es necesario

## 🔐 Credenciales por Defecto

- **Admin**: admin@tienda.com / admin123
- **Cliente**: cliente@ejemplo.com / cliente123

## 📚 URLs Importantes

- **API Docs**: https://tu-backend-url.onrender.com/api/docs
- **Tienda**: https://tu-frontend-url.onrender.com
