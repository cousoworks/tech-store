#!/usr/bin/env python3
"""
Script de despliegue para Render
Configura la base de datos y ejecuta el servidor
"""

import os
import sys
import sqlite3
from pathlib import Path

def setup_database():
    """Configura la base de datos inicial si no existe"""
    db_path = Path("inventario.db")
    
    if not db_path.exists():
        print("📊 Configurando base de datos inicial...")
        
        # Ejecutar el script de configuración
        import subprocess
        result = subprocess.run([sys.executable, "configurar_db.py"], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Base de datos configurada correctamente")
        else:
            print(f"❌ Error configurando base de datos: {result.stderr}")
            sys.exit(1)
    else:
        print("📊 Base de datos ya existe")

def main():
    """Función principal de despliegue"""
    print("🚀 Iniciando despliegue en Render...")
    
    # Cambiar al directorio del proyecto
    project_root = Path(__file__).parent
    os.chdir(project_root)
    
    # Configurar base de datos
    setup_database()
    
    print("✅ Despliegue completado")

if __name__ == "__main__":
    main()
