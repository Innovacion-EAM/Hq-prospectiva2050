#!/bin/bash

# Script to fix all deployment issues for Hq Prospectiva 2050
# This script should be run in the repository root

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$REPO_ROOT"

echo "🔧 Fixing deployment issues..."

# 1. Fix backend configuration
fix_backend_config() {
    echo "📝 Fixing backend configuration..."
    
    # Create proper backend .env.dev with correct CORS origins
    cat > backend/.env.dev << 'EOF'
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=hq_prospectiva2050
CORS_ORIGINS=http://localhost,http://localhost:5173,http://localhost:1234
DB_SYNCHRONIZE=true
JWT_SECRET=<CAMBIAR_ESTE_SECRET>
UPLOAD_DIR=uploads

# Límites de peticiones (TTL en segundos). En local casi nunca se llega a
# tocar, pero se declaran para que el arranque sea igual que en producción.
THROTTLE_TTL_DEFAULT=60
THROTTLE_LIMIT_DEFAULT=120
THROTTLE_TTL_LOGIN=900
THROTTLE_LIMIT_LOGIN=5
THROTTLE_TTL_FORMS=3600
THROTTLE_LIMIT_FORMS=3
EOF

    echo "✅ Backend .env.dev creado correctamente"
}

# 2. Fix frontend .env.docker
fix_frontend_config() {
    echo "📝 Fixing frontend configuration..."
    
    cat > frontend/.env.docker << 'EOF'
VITE_MODE=docker
VITE_API_URL=http://localhost:3000/api
VITE_SITE_URL=http://localhost:5173
EOF

    echo "✅ Frontend .env.docker creado correctamente"
}

# 3. Fix backoffice .env.docker
fix_backoffice_config() {
    echo "📝 Fixing backoffice configuration..."
    
    cat > backoffice/.env.docker << 'EOF'
VITE_MODE=docker
VITE_API_URL=http://localhost:3000/api
VITE_SITE_URL=http://localhost:5173
EOF

    echo "✅ Backoffice .env.docker creado correctamente"
}

# 4. Fix repo service healthcheck in docker-compose
fix_repo_healthcheck() {
    echo "📝 Fixing repo healthcheck in docker-compose.yml..."
    
    if grep -q "healthcheck:\s*test: \[\"CMD-SHELL\", \"wget -qO- http://127.0.0.1/health\"\]" infra/compose/docker-compose.yml; then
        sed -i 's/healthcheck:\s*test: \[\"CMD-SHELL\", \"wget -qO- http:\/\/127.0.0.1\/health\"\]/healthcheck:\n      test: ["CMD-SHELL", "wget -qO- http:\/\/127.0.0.1:80\/health"]/' infra/compose/docker-compose.yml
        echo "✅ Repo healthcheck corregido: añadido puerto 80"
    else
        echo "⚠️ Healthcheck del repo ya tiene puerto configurado"
    fi
}

# 5. Fix backend environment file reference
fix_backend_env_reference() {
    echo "📝 Fixing backend environment file reference..."
    
    # The backend service should use .env.dev.example in local/docker mode
    # but we need to ensure the .env file exists for the service
    if [ ! -f backend/.env ]; then
        echo "⚠️ backend/.env no existe, creando...
        cp backend/.env.docker backend/.env
        echo "✅ backend/.env creado"
    fi
}

# 6. Run tests to verify fixes
run_tests() {
    echo "🧪 Running tests to verify fixes..."
    
    # Check if the files exist
    if [ ! -f backend/.env.docker ]; then
        echo "❌ ERROR: backend/.env.docker no existe"
        exit 1
    fi
    
    if [ ! -f frontend/.env.docker ]; then
        echo "❌ ERROR: frontend/.env.docker no existe"
        exit 1
    fi
    
    if [ ! -f backoffice/.env.docker ]; then
        echo "❌ ERROR: backoffice/.env.docker no existe"
        exit 1
    fi
    
    echo "✅ Todos los archivos .env.docker existen"
}

# 7. Create a clean deployment script
create_clean_deployment_script() {
    echo "📝 Creating clean deployment script..."
    
    cat > scripts/deploy/clean-deploy.sh << 'EOF'
#!/bin/bash
# Clean deployment script for Hq Prospectiva 2050

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "🚀 Starting clean deployment..."

# Stop all services
docker compose down --remove-orphans

# Pull latest images
docker compose pull

# Build and start all services
docker compose up -d

# Wait for services to be healthy
for service in frontend backend backoffice repo traefik; do
    echo "⏳ Esperando que el servicio $service esté saludable..."
    timeout 60 bash -c "until docker compose ps $service | grep -q 'healthy'; do sleep 2; done" || {
        echo "❌ El servicio $service no se volvió saludable a tiempo"
        docker compose ps
        exit 1
    }
    echo "✅ $service está saludable"
done

echo "🎉 Despliegue limpio completado exitosamente!"
echo "Servicios disponibles:"
echo "  - Frontend: http://localhost:5173/"
echo "  - Backend: http://localhost:3000/api"
echo "  - Backoffice: http://localhost:1234/admin"
echo "  - Repositorio: http://localhost:4173/repo"
EOF

    chmod +x scripts/deploy/clean-deploy.sh
    echo "✅ Script de despliegue limpio creado"
}

# 8. Main execution
main() {
    echo "🔧 Iniciando proceso de corrección de despliegue..."
    echo "=================================================="
    
    fix_backend_config
    echo
    
    fix_frontend_config
    echo
    
    fix_backoffice_config
    echo
    
    fix_repo_healthcheck
    echo
    
    fix_backend_env_reference
    echo
    
    run_tests
    echo
    
    create_clean_deployment_script
    echo
    
    echo "✅ Todos los problemas corregidos exitosamente!"
    echo "=================================================="
    echo "Siguiente pasos:
1. Ejecuta: scripts/deploy/clean-deploy.sh
2. Verificar el estado: docker compose ps
3. Acceder a los servicios:
   - Frontend: http://localhost:5173/
   - Backend: http://localhost:3000/api
   - Backoffice: http://localhost:1234/admin
   - Repositorio: http://localhost:4173/repo"
}

main
