from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from pathlib import Path
from datetime import timedelta

from .database import engine, obtener_db
from .models import Base
from .crud import ServicioInventario, ServicioUsuarios, ServicioPedidos, ServicioSeguridad, ACCESS_TOKEN_EXPIRE_MINUTES
from .auth import obtener_usuario_actual, obtener_usuario_admin
from . import schemas, models

# Crear las tablas de la base de datos
Base.metadata.create_all(bind=engine)

# Inicializar la aplicación FastAPI
app = FastAPI(
    title="Sistema de Gestión de Inventario",
    description="API para gestionar inventario de productos con interfaz web integrada",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas de la API

@app.get("/")
async def raiz():
    """Página principal de la API"""
    return {
        "mensaje": "🛒 TechStore API",
        "version": "1.0.0",
        "documentacion": "/api/docs",
        "estado": "funcionando"
    }

@app.get("/api/salud")
async def verificar_salud():
    """Endpoint para verificar el estado de la API"""
    return {"mensaje": "API de inventario funcionando correctamente", "version": "1.0.0"}

@app.get("/api/articulos", response_model=List[schemas.ArticuloInventario])
async def listar_articulos(
    saltar: int = Query(0, ge=0, description="Número de artículos a saltar"),
    limite: int = Query(100, ge=1, le=1000, description="Límite de artículos a devolver"),
    buscar: Optional[str] = Query(None, description="Buscar artículos por nombre"),
    db: Session = Depends(obtener_db)
):
    """
    Obtiene la lista de artículos del inventario.
    
    - **saltar**: Número de artículos a saltar para paginación
    - **limite**: Máximo número de artículos a devolver
    - **buscar**: Texto para buscar en los nombres de los artículos
    """
    try:
        if buscar:
            articulos = ServicioInventario.buscar_articulos_por_nombre(db, buscar)
        else:
            articulos = ServicioInventario.obtener_articulos(db, saltar=saltar, limite=limite)
        return articulos
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener artículos: {str(e)}"
        )

@app.get("/api/articulos/{articulo_id}", response_model=schemas.ArticuloInventario)
async def obtener_articulo(articulo_id: int, db: Session = Depends(obtener_db)):
    """
    Obtiene un artículo específico por su ID.
    
    - **articulo_id**: ID del artículo a obtener
    """
    articulo = ServicioInventario.obtener_articulo(db, articulo_id)
    if articulo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Artículo con ID {articulo_id} no encontrado"
        )
    return articulo

@app.post("/api/articulos", response_model=schemas.ArticuloInventario, status_code=status.HTTP_201_CREATED)
async def crear_articulo(
    articulo: schemas.ArticuloInventarioCrear, 
    _: models.Usuario = Depends(obtener_usuario_admin),
    db: Session = Depends(obtener_db)
):
    """
    Crea un nuevo artículo en el inventario.
    
    - **nombre**: Nombre del artículo (requerido)
    - **descripcion**: Descripción del artículo (opcional)
    - **cantidad**: Cantidad en stock (requerido, >= 0)
    - **precio**: Precio unitario (requerido, > 0)
    """
    # Verificar si ya existe un artículo con el mismo nombre
    if ServicioInventario.verificar_nombre_existe(db, articulo.nombre):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un artículo con el nombre '{articulo.nombre}'"
        )
    
    try:
        return ServicioInventario.crear_articulo(db, articulo)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear artículo: {str(e)}"
        )

@app.put("/api/articulos/{articulo_id}", response_model=schemas.ArticuloInventario)
async def actualizar_articulo(
    articulo_id: int, 
    articulo: schemas.ArticuloInventarioActualizar,
    _: models.Usuario = Depends(obtener_usuario_admin),
    db: Session = Depends(obtener_db)
):
    """
    Actualiza un artículo existente.
    
    - **articulo_id**: ID del artículo a actualizar
    - Solo se actualizarán los campos proporcionados
    """
    # Verificar si el artículo existe
    articulo_existente = ServicioInventario.obtener_articulo(db, articulo_id)
    if articulo_existente is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Artículo con ID {articulo_id} no encontrado"
        )
    
    # Verificar nombre único si se está actualizando
    if articulo.nombre and ServicioInventario.verificar_nombre_existe(db, articulo.nombre, excluir_id=articulo_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe otro artículo con el nombre '{articulo.nombre}'"
        )
    
    try:
        articulo_actualizado = ServicioInventario.actualizar_articulo(db, articulo_id, articulo)
        return articulo_actualizado
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar artículo: {str(e)}"
        )

@app.delete("/api/articulos/{articulo_id}", response_model=schemas.MensajeRespuesta)
async def eliminar_articulo(
    articulo_id: int, 
    _: models.Usuario = Depends(obtener_usuario_admin),
    db: Session = Depends(obtener_db)
):
    """
    Elimina un artículo del inventario.
    
    - **articulo_id**: ID del artículo a eliminar
    """
    try:
        eliminado = ServicioInventario.eliminar_articulo(db, articulo_id)
        if not eliminado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Artículo con ID {articulo_id} no encontrado"
            )
        
        return schemas.MensajeRespuesta(
            mensaje=f"Artículo con ID {articulo_id} eliminado exitosamente",
            exito=True
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar artículo: {str(e)}"
        )

@app.get("/api/estadisticas")
async def obtener_estadisticas(db: Session = Depends(obtener_db)):
    """
    Obtiene estadísticas completas del inventario y la tienda.
    """
    try:
        # Estadísticas de inventario
        total_articulos = ServicioInventario.obtener_total_articulos(db)
        articulos = ServicioInventario.obtener_articulos(db, limite=1000)
        
        # Calcular estadísticas adicionales
        productos_con_stock = len([a for a in articulos if a.cantidad > 0])
        productos_sin_stock = len([a for a in articulos if a.cantidad == 0])
        stock_total = sum(a.cantidad for a in articulos)
        valor_total_inventario = sum(a.precio * a.cantidad for a in articulos)
        
        # Estadísticas de usuarios
        usuarios = ServicioUsuarios.obtener_usuarios(db, limite=1000)
        total_usuarios = len(usuarios)
        
        # Estadísticas de pedidos
        pedidos = ServicioPedidos.obtener_todos_pedidos(db, limite=1000)
        total_pedidos = len(pedidos)
        
        return {
            "inventario": {
                "total_articulos": total_articulos,
                "productos_con_stock": productos_con_stock,
                "productos_sin_stock": productos_sin_stock,
                "stock_total": stock_total,
                "valor_total_inventario": round(valor_total_inventario, 2)
            },
            "usuarios": {
                "total_usuarios": total_usuarios
            },
            "pedidos": {
                "total_pedidos": total_pedidos
            },
            "mensaje": "Estadísticas obtenidas exitosamente"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener estadísticas: {str(e)}"
        )

# ===========================================
# RUTAS DE AUTENTICACIÓN Y USUARIOS
# ===========================================

@app.post("/api/auth/registro", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
async def registrar_usuario(usuario: schemas.UsuarioCrear, db: Session = Depends(obtener_db)):
    """
    Registra un nuevo usuario en el sistema.
    """
    # Verificar si el email ya existe
    usuario_existente = ServicioUsuarios.obtener_usuario_por_email(db, usuario.email)
    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    try:
        # Crear el usuario
        db_usuario = ServicioUsuarios.crear_usuario(db, usuario)
        
        # Crear token de acceso
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = ServicioSeguridad.crear_access_token(
            data={"sub": db_usuario.email}, expires_delta=access_token_expires
        )
        
        return schemas.Token(
            access_token=access_token,
            token_type="bearer",
            usuario=schemas.Usuario.model_validate(db_usuario)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar usuario: {str(e)}"
        )

@app.post("/api/auth/login", response_model=schemas.Token)
async def login_usuario(credenciales: schemas.UsuarioLogin, db: Session = Depends(obtener_db)):
    """
    Autentica un usuario y devuelve un token de acceso.
    """
    usuario = ServicioUsuarios.autenticar_usuario(db, credenciales.email, credenciales.password)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = ServicioSeguridad.crear_access_token(
        data={"sub": usuario.email}, expires_delta=access_token_expires
    )
    
    return schemas.Token(
        access_token=access_token,
        token_type="bearer",
        usuario=schemas.Usuario.model_validate(usuario)
    )

@app.get("/api/auth/perfil", response_model=schemas.Usuario)
async def obtener_perfil(usuario_actual: models.Usuario = Depends(obtener_usuario_actual)):
    """
    Obtiene el perfil del usuario autenticado.
    """
    return schemas.Usuario.model_validate(usuario_actual)

@app.get("/api/usuarios", response_model=List[schemas.Usuario])
async def listar_usuarios(
    saltar: int = Query(0, ge=0),
    limite: int = Query(100, ge=1, le=1000),
    _: models.Usuario = Depends(obtener_usuario_admin),
    db: Session = Depends(obtener_db)
):
    """
    Lista todos los usuarios (solo para administradores).
    """
    try:
        usuarios = ServicioUsuarios.obtener_usuarios(db, saltar=saltar, limite=limite)
        return [schemas.Usuario.model_validate(usuario) for usuario in usuarios]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener usuarios: {str(e)}"
        )

# ===========================================
# RUTAS DE PEDIDOS
# ===========================================

@app.post("/api/pedidos", response_model=schemas.Pedido, status_code=status.HTTP_201_CREATED)
async def crear_pedido(
    pedido: schemas.PedidoCrear,
    usuario_actual: models.Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(obtener_db)
):
    """
    Crea un nuevo pedido para el usuario autenticado.
    """
    try:
        db_pedido = ServicioPedidos.crear_pedido(db, pedido, usuario_actual.id)
        
        # Construir respuesta con información completa
        pedido_respuesta = construir_respuesta_pedido(db, db_pedido)
        return pedido_respuesta
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear pedido: {str(e)}"
        )

@app.get("/api/pedidos", response_model=List[schemas.Pedido])
async def listar_pedidos(
    saltar: int = Query(0, ge=0),
    limite: int = Query(100, ge=1, le=1000),
    usuario_actual: models.Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(obtener_db)
):
    """
    Lista los pedidos del usuario autenticado, o todos los pedidos si es admin.
    """
    try:
        if usuario_actual.rol == "admin":
            # Los admins pueden ver todos los pedidos
            pedidos = ServicioPedidos.obtener_todos_pedidos(db, saltar=saltar, limite=limite)
        else:
            # Los clientes solo ven sus propios pedidos
            pedidos = ServicioPedidos.obtener_pedidos_usuario(db, usuario_actual.id)
        
        return [construir_respuesta_pedido(db, pedido) for pedido in pedidos]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener pedidos: {str(e)}"
        )

@app.get("/api/pedidos/{pedido_id}", response_model=schemas.Pedido)
async def obtener_pedido(
    pedido_id: int,
    usuario_actual: models.Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(obtener_db)
):
    """
    Obtiene un pedido específico por ID.
    """
    pedido = ServicioPedidos.obtener_pedido_por_id(db, pedido_id)
    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pedido con ID {pedido_id} no encontrado"
        )
    
    # Verificar permisos: solo el dueño del pedido o un admin puede verlo
    if usuario_actual.rol != "admin" and pedido.usuario_id != usuario_actual.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver este pedido"
        )
    
    return construir_respuesta_pedido(db, pedido)

@app.put("/api/pedidos/{pedido_id}/estado", response_model=schemas.Pedido)
async def actualizar_estado_pedido(
    pedido_id: int,
    nuevo_estado: str = Query(..., regex="^(pendiente|procesando|enviado|entregado|cancelado)$"),
    _: models.Usuario = Depends(obtener_usuario_admin),
    db: Session = Depends(obtener_db)
):
    """
    Actualiza el estado de un pedido (solo para administradores).
    """
    try:
        pedido_actualizado = ServicioPedidos.actualizar_estado_pedido(db, pedido_id, nuevo_estado)
        if not pedido_actualizado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pedido con ID {pedido_id} no encontrado"
            )
        
        return construir_respuesta_pedido(db, pedido_actualizado)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar estado del pedido: {str(e)}"
        )

def construir_respuesta_pedido(db: Session, pedido: models.Pedido) -> schemas.Pedido:
    """
    Construye la respuesta completa de un pedido con todos sus items.
    """
    # Obtener items del pedido
    items_query = db.execute(
        "SELECT pa.articulo_id, pa.cantidad, pa.precio_unitario, ai.nombre "
        "FROM pedido_articulos pa "
        "JOIN articulos_inventario ai ON pa.articulo_id = ai.id "
        "WHERE pa.pedido_id = :pedido_id",
        {"pedido_id": pedido.id}
    ).fetchall()
    
    items = []
    for item in items_query:
        items.append(schemas.PedidoItem(
            articulo_id=item[0],
            nombre_articulo=item[3],
            cantidad=item[1],
            precio_unitario=item[2],
            subtotal=item[1] * item[2]
        ))
    
    return schemas.Pedido(
        id=pedido.id,
        usuario_id=pedido.usuario_id,
        usuario_email=pedido.usuario.email,
        total=pedido.total,
        estado=pedido.estado,
        fecha_pedido=pedido.fecha_pedido,
        fecha_actualizacion=pedido.fecha_actualizacion,
        direccion_envio=pedido.direccion_envio,
        notas=pedido.notas,
        items=items
    )

# Montar archivos estáticos del frontend (opcional)
# frontend_build_path = Path("frontend/build")
# if frontend_build_path.exists():
#     app.mount("/static", StaticFiles(directory=str(frontend_build_path / "static")), name="static")
#     
#     @app.get("/app/{path:path}")
#     async def servir_react_app(path: str):
#         """Sirve la aplicación React en /app/"""
#         index_path = frontend_build_path / "index.html"
#         if index_path.exists():
#             return FileResponse(index_path)
#         return {"mensaje": "Frontend no encontrado"}
#     
#     @app.get("/app")
#     async def servir_react_app_root():
#         """Sirve la aplicación React en /app"""
#         index_path = frontend_build_path / "index.html"
#         if index_path.exists():
#             return FileResponse(index_path)
#         return {"mensaje": "Frontend no encontrado"}
