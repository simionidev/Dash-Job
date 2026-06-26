#!/bin/bash
set -e

echo "⚙️  Configurando VPS Dash Job..."

# Atualiza o sistema
apt-get update && apt-get upgrade -y
apt-get install -y git curl ufw

# Instala Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
apt-get install -y docker-compose-plugin

# Firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 8080/tcp
ufw --force enable
echo "🔥 Firewall: portas 22, 80 e 8080 liberadas"

# Clona o repositório
git clone https://github.com/simionidev/Dash-Job.git /app/dashjob
cd /app/dashjob

# Cria os .env de produção a partir dos exemplos
cp apps/backend/.env.production.example apps/backend/.env.production
cp apps/web/.env.production.example apps/web/.env.production

# Preenche as senhas nos .env
sed -i 's/SENHA_DO_BANCO/Dj@Postgres#2026/g' apps/backend/.env.production
sed -i 's/gere_um_segredo_de_64_chars_aqui/a9f3e2c1b8d7k4m6n0p5q2r8s1t7u3v9w4x6y0z2A5B8C1D4E7F0G3H6J9K2L5/g' apps/backend/.env.production
sed -i 's/gere_outro_segredo_de_64_chars_aqui/z0y9x8w7v6u5t4s3r2q1p0n9m8l7k6j5h4g3f2e1d0c9b8a7Z6Y5X4W3V2U1T0/g' apps/backend/.env.production
sed -i 's/gere_um_segredo_aqui/Dj@NextAuth#Secret2026xK9mP2qRvN7jL4wS/g' apps/web/.env.production

echo ""
echo "✅ VPS configurada! Iniciando deploy..."
bash deploy.sh
