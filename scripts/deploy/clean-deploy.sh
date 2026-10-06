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
    echo "⏳ Waiting for service $service to be healthy..."
    timeout 60 bash -c "until docker compose ps $service | grep -q 'healthy'; do sleep 2; done" || {
        echo "❌ Service $service did not become healthy in time"
        docker compose ps
        exit 1
    }
    echo "✅ $service is healthy"
done

echo "🎉 Clean deployment completed successfully!"
echo "Services available:"
echo "  - Frontend: http://localhost:5173/"
echo "  - Backend: http://localhost:3000/api"
echo "  - Backoffice: http://localhost:1234/admin"
echo "  - Repository: http://localhost:4173/repo"
EOF