# ==========================================
# MAKEFILE - COMANDOS RÁPIDOS DOCKER
# ==========================================

# Variables
BACKEND_IMAGE = techstore-backend
FRONTEND_IMAGE = techstore-frontend

# Comandos principales
.PHONY: help build run stop clean logs

help: ## Mostrar ayuda
	@echo "🐳 TechStore Docker Commands"
	@echo "=============================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Construir imágenes Docker
	@echo "🔨 Construyendo imágenes..."
	docker build -t $(BACKEND_IMAGE) .
	docker build -f Dockerfile.frontend -t $(FRONTEND_IMAGE) .
	@echo "✅ Imágenes construidas!"

run: ## Ejecutar con docker-compose
	@echo "🚀 Iniciando servicios..."
	docker-compose up -d
	@echo "✅ Servicios ejecutándose!"
	@echo "🌐 Backend: http://localhost:8000"
	@echo "🌐 Frontend: http://localhost:3000"

stop: ## Detener servicios
	@echo "🛑 Deteniendo servicios..."
	docker-compose down
	@echo "✅ Servicios detenidos!"

logs: ## Ver logs
	docker-compose logs -f

clean: ## Limpiar imágenes y contenedores
	@echo "🧹 Limpiando Docker..."
	docker-compose down --volumes --remove-orphans
	docker rmi $(BACKEND_IMAGE) $(FRONTEND_IMAGE) 2>/dev/null || true
	docker system prune -f
	@echo "✅ Limpieza completa!"

backend-shell: ## Entrar al contenedor backend
	docker-compose exec backend /bin/bash

deploy: ## Deploy a Render
	@echo "☁️ Desplegando a Render..."
	git add .
	git commit -m "Docker deployment" || true
	git push
	@echo "✅ Código enviado a Render!"
