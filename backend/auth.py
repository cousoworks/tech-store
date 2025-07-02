from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .database import obtener_db
from .crud import ServicioSeguridad, ServicioUsuarios
from . import models

# Configurar el esquema de autenticación Bearer
security = HTTPBearer()

async def obtener_usuario_actual(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(obtener_db)
) -> models.Usuario:
    """
    Dependencia para obtener el usuario actual autenticado.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        email = ServicioSeguridad.verificar_token(token)
        if email is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
    
    usuario = ServicioUsuarios.obtener_usuario_por_email(db, email=email)
    if usuario is None:
        raise credentials_exception
    
    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )
    
    return usuario

async def obtener_usuario_admin(
    usuario_actual: models.Usuario = Depends(obtener_usuario_actual)
) -> models.Usuario:
    """
    Dependencia para verificar que el usuario actual es administrador.
    """
    if usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador para realizar esta operación"
        )
    return usuario_actual

async def obtener_usuario_opcional(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(obtener_db)
) -> models.Usuario | None:
    """
    Dependencia opcional para obtener el usuario si está autenticado.
    Devuelve None si no hay token válido.
    """
    try:
        if not credentials:
            return None
        
        token = credentials.credentials
        email = ServicioSeguridad.verificar_token(token)
        if email is None:
            return None
        
        usuario = ServicioUsuarios.obtener_usuario_por_email(db, email=email)
        if usuario is None or not usuario.activo:
            return None
        
        return usuario
    except Exception:
        return None
