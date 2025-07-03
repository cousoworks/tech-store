# 🔗 Configuración Frontend para Render

## 📋 Configuración del Static Site

### Build Command:
```bash
cd frontend && npm install && npm run build
```

### Publish Directory:
```
frontend/build
```

### Environment Variables:
```
REACT_APP_API_URL=https://techstore-backend-XXXXX.onrender.com
```

## 🎯 Pasos:

1. **Copia la URL exacta de tu backend** desde el dashboard de Render
2. **Reemplaza XXXXX** con tu URL real
3. **Ejemplo**: Si tu backend es `https://techstore-backend-abc123.onrender.com`
   - Entonces usa: `REACT_APP_API_URL=https://techstore-backend-abc123.onrender.com`

## 🔄 Configuración Automática de CORS

El backend ya está configurado para aceptar peticiones del frontend.
Si necesitas agregar tu dominio de frontend específico, edita `backend/main.py`:

```python
origins = [
    "http://localhost:3000",
    "https://tu-frontend-url.onrender.com"  # ← Agregar esta línea
]
```

## ✅ Verificación

Una vez desplegado:
1. **Frontend**: https://tu-frontend-url.onrender.com
2. **Backend/API**: https://tu-backend-url.onrender.com/api/docs
3. **Login Admin**: admin@tienda.com / admin123
