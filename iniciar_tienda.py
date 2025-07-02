#!/usr/bin/env python3
"""
🚀 TechStore - Iniciador de Tienda Completa
Inicia automáticamente backend (FastAPI) + frontend (React)
"""
import subprocess
import sys
import time
import os
from pathlib import Path
import platform

def encontrar_npm():
    """Encuentra el ejecutable de npm"""
    if platform.system() == "Windows":
        comandos = ["npm.cmd", "npm"]
    else:
        comandos = ["npm"]
    
    for cmd in comandos:
        try:
            subprocess.run([cmd, "--version"], 
                         capture_output=True, check=True, timeout=5)
            return cmd
        except:
            continue
    
    return "npm"

def main():
    print("🚀 Iniciando TechStore - Tienda Completa")
    print("=" * 50)
    print("🛒 Frontend: http://localhost:3000")
    print("📊 Backend:  http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/api/docs")
    print("=" * 50)
    print("👥 Credenciales de prueba:")
    print("   Admin:   admin@tienda.com / admin123")
    print("   Cliente: cliente@ejemplo.com / cliente123")
    print("=" * 50)
    
    directorio_actual = Path(__file__).parent
    npm_cmd = encontrar_npm()
    
    try:
        # Iniciar backend
        print("🔧 Iniciando Backend...")
        backend_env = os.environ.copy()
        backend_env["PYTHONPATH"] = str(directorio_actual)
        
        backend_proceso = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "backend.main:app", 
             "--host", "127.0.0.1", "--port", "8000", "--reload"],
            cwd=directorio_actual,
            env=backend_env
        )
        
        # Esperar a que el backend arranque
        time.sleep(3)
        
        # Iniciar frontend
        print("🎨 Iniciando Frontend...")
        frontend_env = os.environ.copy()
        frontend_env["BROWSER"] = "none"
        
        frontend_proceso = subprocess.Popen(
            [npm_cmd, "start"],
            cwd=directorio_actual / "frontend",
            env=frontend_env
        )
        
        print("✅ Ambos servidores iniciados correctamente!")
        print("🛑 Presiona Ctrl+C para detener ambos servidores")
        print("=" * 50)
        
        # Mantener ambos procesos ejecutándose
        try:
            while True:
                if backend_proceso.poll() is not None:
                    print("⚠️  Backend se detuvo")
                    frontend_proceso.terminate()
                    break
                if frontend_proceso.poll() is not None:
                    print("⚠️  Frontend se detuvo")
                    backend_proceso.terminate()
                    break
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Deteniendo servidores...")
            
            # Terminar procesos
            backend_proceso.terminate()
            frontend_proceso.terminate()
            
            # Esperar cierre ordenado
            for _ in range(5):
                if backend_proceso.poll() is not None and frontend_proceso.poll() is not None:
                    break
                time.sleep(1)
            
            # Forzar cierre si es necesario
            try:
                if backend_proceso.poll() is None:
                    backend_proceso.kill()
                if frontend_proceso.poll() is None:
                    frontend_proceso.kill()
            except:
                pass
            
            print("✅ Servidores detenidos correctamente")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
