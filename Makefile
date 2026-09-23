.PHONY: dev dev-backend dev-frontend dev-backoffice install

dev:
	@echo "Entorno dev - cada servicio corre en su propio terminal:"
	@echo "  make dev-backend      -> API en http://localhost:3006"
	@echo "  make dev-frontend     -> http://localhost:5173"
	@echo "  make dev-backoffice   -> http://localhost:1234"

dev-backend:
	cd backend && npm run start:dev

dev-frontend:
	cd frontend && npm run dev

dev-backoffice:
	cd backoffice && npm run dev

install:
	cd backend && npm install
	cd frontend && npm install
	cd backoffice && npm install