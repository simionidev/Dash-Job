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

# Aguarda o banco estar saudável
echo "⏳ Aguardando banco de dados ficar pronto..."
until docker exec dashjob-db pg_isready -U dashjob > /dev/null 2>&1; do
  echo "   Banco ainda iniciando..."
  sleep 3
done
echo "✅ Banco pronto!"

# Aguarda o backend subir (migrations executam no CMD do container)
echo "⏳ Aguardando backend iniciar..."
sleep 15

# Roda o seed (ignora erro se usuários já existirem)
echo "🌱 Rodando seed de usuários..."
docker exec dashjob-backend sh -c "npx prisma db seed" 2>&1 || echo "ℹ️  Seed ignorado (dados já existem)."

echo "🧹 Limpando imagens antigas..."
docker image prune -f

echo ""
echo "✅ Deploy concluído!"
echo "🌐 Acesse: http://173.212.208.48:8080"
echo ""
echo "👤 Credenciais:"
echo "   Admin:       admin@dashjob.com       / Dj@Admin#7291"
echo "   Organizador: organizador@dashjob.com / Dj@Org#4853"
echo "   Portaria:    portaria@dashjob.com    / Dj@Port#6147"
