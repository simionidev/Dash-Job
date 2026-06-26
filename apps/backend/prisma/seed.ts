import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  const org = await prisma.organization.upsert({
    where: { slug: 'dash-job' },
    update: {},
    create: {
      name: 'Dash Job',
      slug: 'dash-job',
      plan: 'PRO',
      maxEvents: 100,
      maxGuests: 10000,
    },
  });
  console.log('Organização criada:', org.name);

  const adminHash = await bcrypt.hash('Dj@Admin#7291', 12);
  const orgHash   = await bcrypt.hash('Dj@Org#4853', 12);
  const portHash  = await bcrypt.hash('Dj@Port#6147', 12);

  await prisma.user.upsert({
    where: { email: 'admin@dashjob.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@dashjob.com',
      passwordHash: adminHash,
      role: 'SUPER_ADMIN',
      emailVerified: true,
    },
  });

  const organizer = await prisma.user.upsert({
    where: { email: 'organizador@dashjob.com' },
    update: {},
    create: {
      name: 'Organizador',
      email: 'organizador@dashjob.com',
      passwordHash: orgHash,
      role: 'ORGANIZER',
      emailVerified: true,
      organizationId: org.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'portaria@dashjob.com' },
    update: {},
    create: {
      name: 'Portaria',
      email: 'portaria@dashjob.com',
      passwordHash: portHash,
      role: 'RECEPTION',
      emailVerified: true,
      organizationId: org.id,
    },
  });

  console.log('Seed concluído!');
  console.log('\nCredenciais de acesso:');
  console.log('Admin:        admin@dashjob.com       / Dj@Admin#7291');
  console.log('Organizador:  organizador@dashjob.com / Dj@Org#4853');
  console.log('Portaria:     portaria@dashjob.com    / Dj@Port#6147');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
