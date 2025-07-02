# 🛒 TechStore - Tienda Online

Una tienda online moderna construida con **FastAPI** + **React** + **TypeScript**.

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)

## 🚀 Inicio Rápido

### Prerrequisitos
- Python 3.8+
- Node.js 16+

### Instalación y Ejecución
```bash
# 1. Clonar proyecto
git clone <tu-repo>
cd inventario-python-shop

# 2. Instalar dependencias backend
cd backend && pip install -r requirements.txt && cd ..

# 3. Instalar dependencias frontend  
cd frontend && npm install && cd ..

# 4. Configurar base de datos
python configurar_db.py

# 5. ¡Iniciar tienda completa!
python iniciar_tienda.py
```

## 🌐 Acceso

- **🛒 Tienda:** http://localhost:3000
- **📊 API:** http://localhost:8000/api/docs

## 🔐 Credenciales de Prueba

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@tienda.com | admin123 |
| Cliente | cliente@ejemplo.com | cliente123 |

## ✨ Características

- ✅ **Catálogo de productos** con búsqueda
- ✅ **Carrito de compras** funcional
- ✅ **Autenticación** y roles de usuario
- ✅ **Panel de administración**
- ✅ **API REST** completa con documentación
- ✅ **Interfaz responsive** con TailwindCSS
- ✅ **Base de datos SQLite** optimizada para multi-threading

## 🏗️ Arquitectura

```
📦 TechStore
├── 🔧 backend/          # FastAPI + SQLAlchemy
├── 🎨 frontend/         # React + TypeScript
├── 📄 configurar_db.py  # Setup inicial de DB
├── 📄 inventario.db     # Base de datos SQLite
└── 🚀 iniciar_tienda.py # Launcher principal
```

## 🛠️ Tecnologías

**Backend:**
- FastAPI 0.104.1 (API REST)
- SQLAlchemy 1.4.48 (ORM)
- SQLite (Base de datos)
- JWT (Autenticación)
- Uvicorn (Servidor ASGI)

**Frontend:**
- React 18
- TypeScript
- TailwindCSS
- Axios
- React Router

## 📝 API Endpoints Principales

- `GET /api/articulos` - Listar productos
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/registro` - Registrar usuario
- `POST /api/pedidos` - Crear pedido
- `GET /api/docs` - Documentación completa interactiva

## 🔧 Configuración Técnica

### Base de Datos
- SQLite con configuración optimizada para FastAPI
- `check_same_thread=False` para soporte multi-threading
- Pool de conexiones con `pool_pre_ping=True`
- Timeout de 20 segundos para evitar bloqueos

### Desarrollo
- Hot reload habilitado en backend y frontend
- Variables de entorno con `python-dotenv`
- CORS configurado para desarrollo local

## 🐛 Solución de Problemas

### Error de Threading SQLite
Si encuentras errores como "SQLite objects created in a thread can only be used in that same thread", ya están solucionados en esta versión con la configuración optimizada de SQLAlchemy.

### Puerto en Uso
Si los puertos 3000 o 8000 están ocupados, termina los procesos o cambia los puertos en el código.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la branch (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

---

**Desarrollado con ❤️ usando FastAPI y React**
# tech-store
