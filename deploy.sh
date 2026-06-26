#!/bin/bash
set -e

echo "🚀 Iniciando deploy Dash Job..."

# Puxa as últimas alterações
echo "📦 Atualizando código..."
git pull origin main

# Build e restart dos containers
echo "🔨 Fazendo build..."
docker compose -f docker-compose.prod.yml build --no-cache

echo "⬇️  Derrubando containers antigos..."
docker compose -f docker-compose.prod.yml down

echo "▶️  Subindo containers em produção..."
docker compose -f docker-compose.prod.yml up -d

echo "⏳ Aguardando banco de dados..."
sleep 10

echo "🌱 Rodando seed..."
docker exec dashjob-backend sh -c "cd /app && npx prisma db seed" || echo "Seed já executado ou ignorado."

echo "🧹 Limpando imagens antigas..."
docker image prune -f

echo ""
echo "✅ Deploy concluído!"
echo "🌐 Acesse: http://173.212.208.48:8080"
