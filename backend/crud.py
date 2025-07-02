from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from . import models, schemas

# Configuración de seguridad
SECRET_KEY = "tu_clave_secreta_muy_segura_cambiar_en_produccion"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class ServicioSeguridad:
    """
    Servicio para operaciones de seguridad y autenticación.
    """
    
    @staticmethod
    def verificar_password(password_plano: str, password_hash: str) -> bool:
        """Verifica si una contraseña coincide con su hash"""
        return pwd_context.verify(password_plano, password_hash)
    
    @staticmethod
    def obtener_password_hash(password: str) -> str:
        """Obtiene el hash de una contraseña"""
        return pwd_context.hash(password)
    
    @staticmethod
    def crear_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        """Crea un token de acceso JWT"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verificar_token(token: str) -> Optional[str]:
        """Verifica un token JWT y devuelve el email del usuario"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get("sub")
            if email is None:
                return None
            return email
        except JWTError:
            return None

class ServicioInventario:
    """
    Servicio para operaciones CRUD en el inventario.
    """
    
    @staticmethod
    def obtener_articulo(db: Session, articulo_id: int) -> Optional[models.ArticuloInventario]:
        """
        Obtiene un artículo específico por su ID.
        
        Args:
            db: Sesión de base de datos
            articulo_id: ID del artículo a buscar
            
        Returns:
            ArticuloInventario o None si no se encuentra
        """
        return db.query(models.ArticuloInventario).filter(models.ArticuloInventario.id == articulo_id).first()
    
    @staticmethod
    def obtener_articulos(db: Session, saltar: int = 0, limite: int = 100) -> List[models.ArticuloInventario]:
        """
        Obtiene una lista de artículos con paginación.
        
        Args:
            db: Sesión de base de datos
            saltar: Número de registros a saltar
            limite: Límite máximo de registros a devolver
            
        Returns:
            Lista de artículos
        """
        return db.query(models.ArticuloInventario)\
                 .order_by(desc(models.ArticuloInventario.fecha_creacion))\
                 .offset(saltar)\
                 .limit(limite)\
                 .all()
    
    @staticmethod
    def buscar_articulos_por_nombre(db: Session, nombre: str) -> List[models.ArticuloInventario]:
        """
        Busca artículos por nombre (búsqueda parcial).
        
        Args:
            db: Sesión de base de datos
            nombre: Nombre o parte del nombre a buscar
            
        Returns:
            Lista de artículos que coinciden con la búsqueda
        """
        return db.query(models.ArticuloInventario)\
                 .filter(models.ArticuloInventario.nombre.ilike(f"%{nombre}%"))\
                 .order_by(models.ArticuloInventario.nombre)\
                 .all()
    
    @staticmethod
    def crear_articulo(db: Session, articulo: schemas.ArticuloInventarioCrear) -> models.ArticuloInventario:
        """
        Crea un nuevo artículo en el inventario.
        
        Args:
            db: Sesión de base de datos
            articulo: Datos del artículo a crear
            
        Returns:
            Artículo creado
        """
        db_articulo = models.ArticuloInventario(**articulo.model_dump())
        db.add(db_articulo)
        db.commit()
        db.refresh(db_articulo)
        return db_articulo
    
    @staticmethod
    def actualizar_articulo(
        db: Session, 
        articulo_id: int, 
        articulo_actualizado: schemas.ArticuloInventarioActualizar
    ) -> Optional[models.ArticuloInventario]:
        """
        Actualiza un artículo existente.
        
        Args:
            db: Sesión de base de datos
            articulo_id: ID del artículo a actualizar
            articulo_actualizado: Nuevos datos del artículo
            
        Returns:
            Artículo actualizado o None si no se encuentra
        """
        db_articulo = ServicioInventario.obtener_articulo(db, articulo_id)
        if db_articulo:
            # Solo actualizar campos que no sean None
            datos_actualizacion = articulo_actualizado.model_dump(exclude_unset=True)
            for campo, valor in datos_actualizacion.items():
                setattr(db_articulo, campo, valor)
            
            db.commit()
            db.refresh(db_articulo)
        return db_articulo
    
    @staticmethod
    def eliminar_articulo(db: Session, articulo_id: int) -> bool:
        """
        Elimina un artículo del inventario.
        
        Args:
            db: Sesión de base de datos
            articulo_id: ID del artículo a eliminar
            
        Returns:
            True si se eliminó exitosamente, False si no se encontró
        """
        db_articulo = ServicioInventario.obtener_articulo(db, articulo_id)
        if db_articulo:
            db.delete(db_articulo)
            db.commit()
            return True
        return False
    
    @staticmethod
    def obtener_total_articulos(db: Session) -> int:
        """
        Obtiene el número total de artículos en el inventario.
        
        Args:
            db: Sesión de base de datos
            
        Returns:
            Número total de artículos
        """
        return db.query(models.ArticuloInventario).count()
    
    @staticmethod
    def verificar_nombre_existe(db: Session, nombre: str, excluir_id: Optional[int] = None) -> bool:
        """
        Verifica si ya existe un artículo con el nombre dado.
        
        Args:
            db: Sesión de base de datos
            nombre: Nombre a verificar
            excluir_id: ID a excluir de la búsqueda (útil para actualizaciones)
            
        Returns:
            True si el nombre ya existe, False en caso contrario
        """
        query = db.query(models.ArticuloInventario).filter(models.ArticuloInventario.nombre == nombre)
        if excluir_id:
            query = query.filter(models.ArticuloInventario.id != excluir_id)
        return query.first() is not None

class ServicioUsuarios:
    """
    Servicio para operaciones CRUD de usuarios.
    """
    
    @staticmethod
    def obtener_usuario_por_email(db: Session, email: str) -> Optional[models.Usuario]:
        """Obtiene un usuario por su email"""
        return db.query(models.Usuario).filter(models.Usuario.email == email).first()
    
    @staticmethod
    def obtener_usuario_por_id(db: Session, usuario_id: int) -> Optional[models.Usuario]:
        """Obtiene un usuario por su ID"""
        return db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    
    @staticmethod
    def crear_usuario(db: Session, usuario: schemas.UsuarioCrear) -> models.Usuario:
        """Crea un nuevo usuario"""
        password_hash = ServicioSeguridad.obtener_password_hash(usuario.password)
        db_usuario = models.Usuario(
            email=usuario.email,
            nombre=usuario.nombre,
            apellidos=usuario.apellidos,
            password_hash=password_hash,
            rol=usuario.rol
        )
        db.add(db_usuario)
        db.commit()
        db.refresh(db_usuario)
        return db_usuario
    
    @staticmethod
    def autenticar_usuario(db: Session, email: str, password: str) -> Optional[models.Usuario]:
        """Autentica un usuario con email y contraseña"""
        usuario = ServicioUsuarios.obtener_usuario_por_email(db, email)
        if not usuario:
            return None
        if not ServicioSeguridad.verificar_password(password, usuario.password_hash):
            return None
        
        # Actualizar fecha de último acceso
        usuario.fecha_ultimo_acceso = datetime.utcnow()
        db.commit()
        
        return usuario
    
    @staticmethod
    def obtener_usuarios(db: Session, saltar: int = 0, limite: int = 100) -> List[models.Usuario]:
        """Obtiene lista de usuarios con paginación"""
        return db.query(models.Usuario)\
                 .order_by(desc(models.Usuario.fecha_creacion))\
                 .offset(saltar)\
                 .limit(limite)\
                 .all()

class ServicioPedidos:
    """
    Servicio para operaciones CRUD de pedidos.
    """
    
    @staticmethod
    def crear_pedido(db: Session, pedido: schemas.PedidoCrear, usuario_id: int) -> models.Pedido:
        """Crea un nuevo pedido y actualiza el stock"""
        # Verificar stock disponible para todos los items
        total = 0
        items_verificados = []
        
        for item in pedido.items:
            articulo = ServicioInventario.obtener_articulo(db, item.articulo_id)
            if not articulo:
                raise ValueError(f"Artículo con ID {item.articulo_id} no encontrado")
            
            if articulo.cantidad < item.cantidad:
                raise ValueError(f"Stock insuficiente para {articulo.nombre}. Disponible: {articulo.cantidad}, Solicitado: {item.cantidad}")
            
            subtotal = articulo.precio * item.cantidad
            total += subtotal
            
            items_verificados.append({
                'articulo': articulo,
                'cantidad': item.cantidad,
                'precio_unitario': articulo.precio,
                'subtotal': subtotal
            })
        
        # Crear el pedido
        db_pedido = models.Pedido(
            usuario_id=usuario_id,
            total=total,
            direccion_envio=pedido.direccion_envio,
            notas=pedido.notas
        )
        db.add(db_pedido)
        db.flush()  # Para obtener el ID del pedido
        
        # Agregar items al pedido y actualizar stock
        for item_data in items_verificados:
            articulo = item_data['articulo']
            cantidad = item_data['cantidad']
            precio_unitario = item_data['precio_unitario']
            
            # Actualizar stock del artículo
            articulo.cantidad -= cantidad
            
            # Agregar relación en la tabla intermedia
            db.execute(
                models.pedido_articulos.insert().values(
                    pedido_id=db_pedido.id,
                    articulo_id=articulo.id,
                    cantidad=cantidad,
                    precio_unitario=precio_unitario
                )
            )
        
        db.commit()
        db.refresh(db_pedido)
        return db_pedido
    
    @staticmethod
    def obtener_pedidos_usuario(db: Session, usuario_id: int) -> List[models.Pedido]:
        """Obtiene todos los pedidos de un usuario"""
        return db.query(models.Pedido)\
                 .filter(models.Pedido.usuario_id == usuario_id)\
                 .order_by(desc(models.Pedido.fecha_pedido))\
                 .all()
    
    @staticmethod
    def obtener_pedido_por_id(db: Session, pedido_id: int) -> Optional[models.Pedido]:
        """Obtiene un pedido por su ID"""
        return db.query(models.Pedido).filter(models.Pedido.id == pedido_id).first()
    
    @staticmethod
    def obtener_todos_pedidos(db: Session, saltar: int = 0, limite: int = 100) -> List[models.Pedido]:
        """Obtiene todos los pedidos (solo para admins)"""
        return db.query(models.Pedido)\
                 .order_by(desc(models.Pedido.fecha_pedido))\
                 .offset(saltar)\
                 .limit(limite)\
                 .all()
    
    @staticmethod
    def actualizar_estado_pedido(db: Session, pedido_id: int, nuevo_estado: str) -> Optional[models.Pedido]:
        """Actualiza el estado de un pedido"""
        pedido = ServicioPedidos.obtener_pedido_por_id(db, pedido_id)
        if pedido:
            pedido.estado = nuevo_estado
            pedido.fecha_actualizacion = datetime.utcnow()
            db.commit()
            db.refresh(pedido)
        return pedido
