# Das List — Plataforma SaaS de Gestão de Eventos

Plataforma completa para organizadores de eventos, promotores, casas noturnas, festas corporativas e camarotes.

---

## Stack

| Camada | Tecnologia |
|---|---|
| **Frontend Web** | Next.js 15, React, TypeScript, TailwindCSS, Shadcn/UI |
| **Mobile** | React Native, Expo, TypeScript |
| **Backend** | NestJS, TypeScript |
| **Banco de Dados** | PostgreSQL |
| **ORM** | Prisma |
| **Auth** | JWT + Refresh Token + RBAC |
| **Infra** | Docker, Docker Compose, Nginx |

---

## Estrutura do Projeto

```
das-list/
├── apps/
│   ├── backend/              # API NestJS
│   │   ├── src/
│   │   │   ├── auth/         # JWT, refresh token, RBAC
│   │   │   ├── users/        # Gestão de usuários
│   │   │   ├── organizations/# Multi-tenant
│   │   │   ├── events/       # CRUD de eventos
│   │   │   ├── lists/        # Listas de convidados
│   │   │   ├── guests/       # Convidados
│   │   │   ├── invitations/  # Convites (email/WhatsApp)
│   │   │   ├── rsvp/         # Confirmação de presença
│   │   │   ├── qrcode/       # Geração e validação
│   │   │   ├── checkin/      # Check-in/checkout
│   │   │   ├── dashboard/    # Analytics
│   │   │   ├── reports/      # Excel/PDF
│   │   │   ├── notifications/# Email/WhatsApp/Push
│   │   │   └── audit/        # Logs de auditoria
│   │   └── prisma/           # Schema e migrations
│   ├── web/                  # Painel Next.js 15
│   │   └── src/app/
│   │       ├── (auth)/       # Login
│   │       └── (dashboard)/  # Dashboard, Eventos, Listas, Relatórios
│   └── mobile/               # App React Native/Expo
│       └── src/
│           ├── screens/      # Login, QRScan, ManualSearch
│           ├── store/        # Auth + Offline queue
│           └── navigation/   # AppNavigator
├── docker-compose.yml
├── nginx/nginx.conf
└── package.json
```

---

## Setup Rápido

### Pré-requisitos
- Node.js 20+
- Docker & Docker Compose
- Expo CLI (para mobile)

### 1. Subir banco com Docker

```bash
docker-compose up postgres redis -d
```

### 2. Backend

```bash
cd apps/backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
npm run dev
```

API disponível em: `http://localhost:3001/api`
Swagger: `http://localhost:3001/api/docs`

### 3. Frontend Web

```bash
cd apps/web
cp .env.example .env
npm install
npm run dev
```

Acesse: `http://localhost:3000`

### 4. Mobile

```bash
cd apps/mobile
npm install
npx expo start
```

### Deploy completo com Docker

```bash
docker-compose up -d
```

---

## Credenciais de Demo

| Perfil | Email | Senha |
|---|---|---|
| Super Admin | superadmin@daslist.com | Admin@123 |
| Organizador | organizador@daslist.com | Admin@123 |
| Promotor | promotor@daslist.com | Admin@123 |
| Portaria | portaria@daslist.com | Admin@123 |

---

## Perfis e Permissões (RBAC)

| Perfil | Permissões |
|---|---|
| **SUPER_ADMIN** | Tudo — organizações, planos, métricas globais |
| **ORGANIZER** | Eventos, promotores, listas, relatórios |
| **PROMOTER** | Suas listas e convidados, envio de convites |
| **RECEPTION** | Check-in, QR Code, busca de convidados |
| **GUEST** | RSVP, QR Code pessoal, visualizar evento |

---

## Endpoints Principais da API

### Auth
```
POST /api/auth/register    — Cadastro
POST /api/auth/login       — Login
POST /api/auth/refresh     — Renovar token
POST /api/auth/logout      — Logout
GET  /api/auth/me          — Dados do usuário logado
```

### Eventos
```
GET    /api/events                   — Listar eventos
POST   /api/events                   — Criar evento
GET    /api/events/:id               — Detalhe
PATCH  /api/events/:id               — Atualizar
PATCH  /api/events/:id/cancel        — Cancelar
POST   /api/events/:id/duplicate     — Duplicar
GET    /api/events/:id/stats         — Estatísticas
```

### Listas e Convidados
```
GET  /api/lists/event/:eventId       — Listas do evento
POST /api/lists                      — Criar lista
GET  /api/guests/list/:listId        — Convidados da lista
GET  /api/guests/event/:eventId      — Todos os convidados
POST /api/guests                     — Adicionar convidado
POST /api/guests/bulk/:listId        — Importação em massa
```

### Check-in
```
POST /api/checkin/qrcode             — Via QR Code
GET  /api/checkin/search             — Busca por nome
POST /api/checkin/manual/:guestId    — Manual
PATCH /api/checkin/checkout/:guestId — Check-out
GET  /api/checkin/event/:eventId     — Listagem de entradas
```

### Dashboard
```
GET /api/dashboard/overview          — KPIs globais
GET /api/dashboard/events            — Stats por evento
GET /api/dashboard/promoters/ranking — Ranking
GET /api/dashboard/event/:id/timeline— Entradas por hora
```

### Relatórios
```
GET /api/reports/guests/:eventId/excel  — Export convidados
GET /api/reports/checkins/:eventId/excel— Export check-ins
GET /api/reports/promoters              — Relatório promotores
```

---

## Módulos Mobile

### QR Scan
- Leitura de QR Code com câmera
- Feedback visual (verde/vermelho) + vibração
- **Modo offline**: salva check-in localmente e sincroniza quando reconectar

### Busca Manual
- Busca por nome ou CPF
- Check-in com um toque
- Exibe status de RSVP e lista

---

## Banco de Dados (Prisma)

Principais tabelas:

| Tabela | Descrição |
|---|---|
| `organizations` | Multi-tenant, planos |
| `users` | Todos os perfis |
| `promoter_profiles` | Perfil específico de promotor |
| `events` | Eventos com status e capacidade |
| `guest_lists` | Listas (VIP, Geral, Aniversariante...) |
| `guests` | Convidados com vínculo ao promotor |
| `invitations` | Histórico de convites enviados |
| `rsvps` | Confirmações de presença |
| `qr_codes` | Token único anti-fraude |
| `check_ins` | Registro de entrada/saída com horário |
| `audit_logs` | Rastreabilidade de todas as ações |

---

## Funcionalidades Implementadas

- [x] Autenticação JWT + Refresh Token
- [x] RBAC com 5 perfis de usuário
- [x] Multi-tenant por organização
- [x] CRUD completo de Eventos
- [x] 5 tipos de Lista (VIP, Aniversariante, Geral, Promocional, Corporativo)
- [x] Gestão de Convidados com busca avançada
- [x] Importação em massa de convidados
- [x] RSVP (confirmar, recusar, lista de espera)
- [x] QR Code único por convidado (anti-fraude)
- [x] Check-in via QR Code, nome ou CPF
- [x] Check-out com horário
- [x] Modo offline no mobile com sincronização automática
- [x] Dashboard analítico com gráficos
- [x] Ranking de promotores
- [x] Timeline de entradas por hora
- [x] Exportação Excel (convidados e check-ins)
- [x] Envio de convites por email
- [x] Integração WhatsApp
- [x] Logs de auditoria completos
- [x] Rate limiting e proteção contra abuso
- [x] Swagger / documentação da API
- [x] Seed com dados de demonstração
- [x] Docker Compose com Nginx
