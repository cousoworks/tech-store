import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# URL de la base de datos
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./inventario.db")

# Configuración especial para SQLite para resolver problemas de threading
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={
            "check_same_thread": False,  # Permitir acceso desde múltiples threads
            "timeout": 20  # Timeout de 20 segundos para evitar bloqueos
        },
        echo=False,  # Cambiar a True para debug SQL
        pool_pre_ping=True,  # Verificar conexiones antes de usar
        pool_recycle=300  # Renovar conexiones cada 5 minutos
    )
else:
    # Para otras bases de datos (PostgreSQL, MySQL, etc.)
    engine = create_engine(DATABASE_URL)

# Crear el sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos
Base = declarative_base()

# Dependencia para obtener la sesión de base de datos
def obtener_db():
    """
    Generador que proporciona una sesión de base de datos.
    Se asegura de cerrar la sesión después de usar.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
