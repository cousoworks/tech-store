from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, Table
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

# Tabla de asociación para muchos a muchos entre pedidos y artículos
pedido_articulos = Table(
    'pedido_articulos',
    Base.metadata,
    Column('pedido_id', Integer, ForeignKey('pedidos.id'), primary_key=True),
    Column('articulo_id', Integer, ForeignKey('articulos_inventario.id'), primary_key=True),
    Column('cantidad', Integer, nullable=False),
    Column('precio_unitario', Float, nullable=False)
)

class Usuario(Base):
    """
    Modelo para usuarios del sistema.
    
    Tipos de usuario:
    - admin: Puede gestionar inventario y ver todos los pedidos
    - cliente: Puede realizar compras
    """
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=True)
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(20), nullable=False, default="cliente")  # "admin" o "cliente"
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    fecha_ultimo_acceso = Column(DateTime(timezone=True), nullable=True)

    # Relación con pedidos
    pedidos = relationship("Pedido", back_populates="usuario")

    def __repr__(self):
        return f"<Usuario(id={self.id}, email='{self.email}', rol='{self.rol}')>"

class ArticuloInventario(Base):
    """
    Modelo para representar un artículo en el inventario.
    """
    __tablename__ = "articulos_inventario"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False, index=True)
    descripcion = Column(Text, nullable=True)
    cantidad = Column(Integer, nullable=False, default=0)
    precio = Column(Float, nullable=False)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    fecha_actualizacion = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<ArticuloInventario(id={self.id}, nombre='{self.nombre}', cantidad={self.cantidad}, precio={self.precio})>"

class Pedido(Base):
    """
    Modelo para pedidos realizados por usuarios.
    """
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    total = Column(Float, nullable=False)
    estado = Column(String(20), nullable=False, default="pendiente")  # "pendiente", "procesando", "enviado", "entregado", "cancelado"
    fecha_pedido = Column(DateTime(timezone=True), server_default=func.now())
    fecha_actualizacion = Column(DateTime(timezone=True), onupdate=func.now())
    direccion_envio = Column(Text, nullable=True)
    notas = Column(Text, nullable=True)

    # Relaciones
    usuario = relationship("Usuario", back_populates="pedidos")
    articulos = relationship("ArticuloInventario", secondary=pedido_articulos)

    def __repr__(self):
        return f"<Pedido(id={self.id}, usuario_id={self.usuario_id}, total={self.total}, estado='{self.estado}')>"
