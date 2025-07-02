#!/usr/bin/env python3
"""
Script para configurar la base de datos inicial con datos de ejemplo.
Crea un usuario administrador y algunos productos de muestra.
"""

import sys
import os
from pathlib import Path

# Agregar el directorio raíz al path para importar módulos
sys.path.append(str(Path(__file__).parent))

from backend.database import engine, SessionLocal
from backend.models import Base, Usuario, ArticuloInventario
from backend.crud import ServicioSeguridad
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

def crear_tablas():
    """Crea todas las tablas en la base de datos"""
    print("Creando tablas de la base de datos...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas exitosamente")

def crear_usuario_admin(db: Session):
    """Crea un usuario administrador por defecto"""
    print("Verificando usuario administrador...")
    
    # Verificar si ya existe un admin
    admin_existente = db.query(Usuario).filter(Usuario.rol == "admin").first()
    
    if admin_existente:
        print(f"✅ Ya existe un usuario administrador: {admin_existente.email}")
        return admin_existente
    
    # Crear usuario administrador
    admin_password = "admin123"  # Cambiar en producción
    password_hash = ServicioSeguridad.obtener_password_hash(admin_password)
    
    admin = Usuario(
        email="admin@tienda.com",
        nombre="Administrador",
        apellidos="Sistema",
        password_hash=password_hash,
        rol="admin"
    )
    
    db.add(admin)
    db.commit()
    db.refresh(admin)
    
    print(f"✅ Usuario administrador creado:")
    print(f"   Email: admin@tienda.com")
    print(f"   Contraseña: {admin_password}")
    print("   ⚠️ IMPORTANTE: Cambiar esta contraseña en producción")
    
    return admin

def crear_productos_ejemplo(db: Session):
    """Crea algunos productos de ejemplo"""
    print("Verificando productos de ejemplo...")
    
    # Verificar si ya existen productos
    productos_existentes = db.query(ArticuloInventario).count()
    
    if productos_existentes > 0:
        print(f"✅ Ya existen {productos_existentes} productos en la base de datos")
        return
    
    productos_ejemplo = [
        {
            "nombre": "Laptop Gaming ASUS ROG",
            "descripcion": "Laptop gaming de alto rendimiento con RTX 4060, Intel i7 y 16GB RAM",
            "cantidad": 5,
            "precio": 1299.99
        },
        {
            "nombre": "Mouse Gaming Logitech G502",
            "descripcion": "Mouse gaming con sensor HERO 25K y pesas ajustables",
            "cantidad": 25,
            "precio": 79.99
        },
        {
            "nombre": "Teclado Mecánico Corsair K95",
            "descripcion": "Teclado mecánico RGB con switches Cherry MX y rueda de control",
            "cantidad": 15,
            "precio": 199.99
        },
        {
            "nombre": "Monitor 4K Samsung 27\"",
            "descripcion": "Monitor 4K UHD de 27 pulgadas con HDR10 y 144Hz",
            "cantidad": 8,
            "precio": 499.99
        },
        {
            "nombre": "Auriculares Sony WH-1000XM5",
            "descripcion": "Auriculares inalámbricos con cancelación de ruido premium",
            "cantidad": 12,
            "precio": 349.99
        },
        {
            "nombre": "SSD Samsung 1TB",
            "descripcion": "SSD NVMe M.2 de 1TB con velocidades de hasta 7000 MB/s",
            "cantidad": 20,
            "precio": 149.99
        },
        {
            "nombre": "Smartphone iPhone 15",
            "descripcion": "iPhone 15 de 128GB con chip A17 Pro y cámara de 48MP",
            "cantidad": 10,
            "precio": 999.99
        },
        {
            "nombre": "Tablet iPad Air",
            "descripcion": "iPad Air de 10.9 pulgadas con chip M1 y 256GB",
            "cantidad": 7,
            "precio": 749.99
        }
    ]
    
    print("Creando productos de ejemplo...")
    for producto_data in productos_ejemplo:
        producto = ArticuloInventario(**producto_data)
        db.add(producto)
    
    db.commit()
    print(f"✅ {len(productos_ejemplo)} productos de ejemplo creados")

def crear_usuario_cliente_ejemplo(db: Session):
    """Crea un usuario cliente de ejemplo"""
    print("Verificando usuario cliente de ejemplo...")
    
    # Verificar si ya existe el cliente
    cliente_existente = db.query(Usuario).filter(Usuario.email == "cliente@ejemplo.com").first()
    
    if cliente_existente:
        print(f"✅ Ya existe el usuario cliente: {cliente_existente.email}")
        return cliente_existente
    
    # Crear usuario cliente
    cliente_password = "cliente123"
    password_hash = ServicioSeguridad.obtener_password_hash(cliente_password)
    
    cliente = Usuario(
        email="cliente@ejemplo.com",
        nombre="Cliente",
        apellidos="Ejemplo",
        password_hash=password_hash,
        rol="cliente"
    )
    
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    
    print(f"✅ Usuario cliente creado:")
    print(f"   Email: cliente@ejemplo.com")
    print(f"   Contraseña: {cliente_password}")
    
def main():
    """Función principal de configuración"""
    print("� Iniciando configuración de la base de datos...")
    print("=" * 50)
    
    try:
        # Crear tablas
        crear_tablas()
        
        # Obtener sesión de base de datos
        db = SessionLocal()
        
        try:
            # Configurar datos iniciales
            crear_usuario_admin(db)
            crear_usuario_cliente_ejemplo(db)
            crear_productos_ejemplo(db)
            
            print("=" * 50)
            print("✅ Configuración completada exitosamente!")
            print("\n📋 Resumen de la configuración:")
            
            # Mostrar estadísticas
            total_usuarios = db.query(Usuario).count()
            total_productos = db.query(ArticuloInventario).count()
            
            print(f"   👥 Usuarios creados: {total_usuarios}")
            print(f"   📦 Productos disponibles: {total_productos}")
            
            print("\n🔐 Credenciales para pruebas:")
            print("   Admin: admin@tienda.com / admin123")
            print("   Cliente: cliente@ejemplo.com / cliente123")
            
            print("\n🌐 Para iniciar la aplicación ejecuta:")
            print("   python main.py")
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Error durante la configuración: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
