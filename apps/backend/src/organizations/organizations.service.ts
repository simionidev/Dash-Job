import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; slug: string; plan?: any }) {
    const exists = await this.prisma.organization.findUnique({ where: { slug: data.slug } });
    if (exists) throw new ConflictException('Slug já utilizado');

    return this.prisma.organization.create({ data });
  }

  async findAll() {
    return this.prisma.organization.findMany({
      select: {
        id: true, name: true, slug: true, plan: true,
        isActive: true, createdAt: true,
        _count: { select: { users: true, events: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true, events: true } },
      },
    });
    if (!org) throw new NotFoundException('Organização não encontrada');
    return org;
  }

  async update(id: string, data: any) {
    return this.prisma.organization.update({ where: { id }, data });
  }

  async toggleActive(id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Organização não encontrada');
    return this.prisma.organization.update({
      where: { id },
      data: { isActive: !org.isActive },
    });
  }
}
