#!/usr/bin/env python3
"""
Test script to verify all dependencies are correctly installed
"""
import sys
import importlib

def test_import(module_name, package_name=None):
    """Test if a module can be imported"""
    try:
        importlib.import_module(module_name)
        print(f"✅ {package_name or module_name} importado correctamente")
        return True
    except ImportError as e:
        print(f"❌ Error importando {package_name or module_name}: {e}")
        return False

def main():
    print("🔍 Verificando dependencias del backend...")
    print("=" * 50)
    
    modules_to_test = [
        ("fastapi", "FastAPI"),
        ("uvicorn", "Uvicorn"),
        ("sqlalchemy", "SQLAlchemy"),
        ("pydantic", "Pydantic"),
        ("jose", "Python-JOSE"),
        ("passlib", "Passlib"),
        ("multipart", "Python-Multipart"),
        ("dotenv", "Python-Dotenv"),
        ("gunicorn", "Gunicorn"),
        ("email_validator", "Email-Validator")
    ]
    
    success_count = 0
    total_count = len(modules_to_test)
    
    for module, package in modules_to_test:
        if test_import(module, package):
            success_count += 1
    
    print("=" * 50)
    print(f"📊 Resultado: {success_count}/{total_count} dependencias verificadas")
    
    if success_count == total_count:
        print("🎉 Todas las dependencias están correctamente instaladas!")
        return 0
    else:
        print("⚠️  Algunas dependencias faltan o tienen problemas")
        return 1

if __name__ == "__main__":
    sys.exit(main())
