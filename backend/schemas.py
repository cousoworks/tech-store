from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional, List
from datetime import datetime

# Esquemas para Artículos (mantienen la funcionalidad original)
class ArticuloInventarioBase(BaseModel):
    """Esquema base para los artículos de inventario"""
    nombre: str = Field(..., min_length=1, max_length=100, description="Nombre del artículo")
    descripcion: Optional[str] = Field(None, description="Descripción del artículo")
    cantidad: int = Field(..., ge=0, description="Cantidad en stock (debe ser mayor o igual a 0)")
    precio: float = Field(..., gt=0, description="Precio unitario (debe ser mayor que 0)")

class ArticuloInventarioCrear(ArticuloInventarioBase):
    """Esquema para crear un nuevo artículo de inventario"""
    pass

class ArticuloInventarioActualizar(BaseModel):
    """Esquema para actualizar un artículo de inventario"""
    nombre: Optional[str] = Field(None, min_length=1, max_length=100, description="Nombre del artículo")
    descripcion: Optional[str] = Field(None, description="Descripción del artículo")
    cantidad: Optional[int] = Field(None, ge=0, description="Cantidad en stock")
    precio: Optional[float] = Field(None, gt=0, description="Precio unitario")

class ArticuloInventario(ArticuloInventarioBase):
    """Esquema completo del artículo de inventario para respuestas"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int = Field(..., description="ID único del artículo")
    fecha_creacion: datetime = Field(..., description="Fecha de creación")
    fecha_actualizacion: Optional[datetime] = Field(None, description="Fecha de última actualización")

# Esquemas para Usuarios
class UsuarioBase(BaseModel):
    """Esquema base para usuarios"""
    email: EmailStr = Field(..., description="Email del usuario")
    nombre: str = Field(..., min_length=1, max_length=100, description="Nombre del usuario")
    apellidos: Optional[str] = Field(None, max_length=100, description="Apellidos del usuario")

class UsuarioCrear(UsuarioBase):
    """Esquema para crear un nuevo usuario"""
    password: str = Field(..., min_length=6, description="Contraseña (mínimo 6 caracteres)")
    rol: Optional[str] = Field("cliente", description="Rol del usuario: 'admin' o 'cliente'")

class UsuarioLogin(BaseModel):
    """Esquema para login de usuario"""
    email: EmailStr = Field(..., description="Email del usuario")
    password: str = Field(..., description="Contraseña del usuario")

class Usuario(UsuarioBase):
    """Esquema completo del usuario para respuestas"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int = Field(..., description="ID único del usuario")
    rol: str = Field(..., description="Rol del usuario")
    activo: bool = Field(..., description="Si el usuario está activo")
    fecha_creacion: datetime = Field(..., description="Fecha de creación")
    fecha_ultimo_acceso: Optional[datetime] = Field(None, description="Fecha de último acceso")

# Esquemas para Autenticación
class Token(BaseModel):
    """Esquema para token de acceso"""
    access_token: str = Field(..., description="Token de acceso")
    token_type: str = Field(..., description="Tipo de token")
    usuario: Usuario = Field(..., description="Información del usuario")

class TokenData(BaseModel):
    """Esquema para datos del token"""
    email: Optional[str] = None

# Esquemas para Pedidos
class ItemPedido(BaseModel):
    """Esquema para un item dentro del pedido"""
    articulo_id: int = Field(..., description="ID del artículo")
    cantidad: int = Field(..., gt=0, description="Cantidad del artículo")

class PedidoCrear(BaseModel):
    """Esquema para crear un nuevo pedido"""
    items: List[ItemPedido] = Field(..., min_length=1, description="Lista de artículos del pedido")
    direccion_envio: Optional[str] = Field(None, description="Dirección de envío")
    notas: Optional[str] = Field(None, description="Notas adicionales del pedido")

class PedidoItem(BaseModel):
    """Esquema para items del pedido en respuestas"""
    model_config = ConfigDict(from_attributes=True)
    
    articulo_id: int = Field(..., description="ID del artículo")
    nombre_articulo: str = Field(..., description="Nombre del artículo")
    cantidad: int = Field(..., description="Cantidad pedida")
    precio_unitario: float = Field(..., description="Precio unitario al momento del pedido")
    subtotal: float = Field(..., description="Subtotal del item")

class Pedido(BaseModel):
    """Esquema completo del pedido para respuestas"""
    model_config = ConfigDict(from_attributes=True)
    
    id: int = Field(..., description="ID único del pedido")
    usuario_id: int = Field(..., description="ID del usuario que hizo el pedido")
    usuario_email: str = Field(..., description="Email del usuario")
    total: float = Field(..., description="Total del pedido")
    estado: str = Field(..., description="Estado del pedido")
    fecha_pedido: datetime = Field(..., description="Fecha del pedido")
    fecha_actualizacion: Optional[datetime] = Field(None, description="Fecha de última actualización")
    direccion_envio: Optional[str] = Field(None, description="Dirección de envío")
    notas: Optional[str] = Field(None, description="Notas del pedido")
    items: List[PedidoItem] = Field(..., description="Items del pedido")

# Esquemas de respuesta general
class MensajeRespuesta(BaseModel):
    """Esquema para mensajes de respuesta"""
    mensaje: str = Field(..., description="Mensaje de respuesta")
    exito: bool = Field(..., description="Indica si la operación fue exitosa")

class ErrorRespuesta(BaseModel):
    """Esquema para respuestas de error"""
    error: str = Field(..., description="Descripción del error")
    detalle: Optional[str] = Field(None, description="Detalles adicionales del error")
    codigo: int = Field(..., description="Código de estado HTTP")
