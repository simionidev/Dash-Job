import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    action: string;
    entity: string;
    entityId?: string;
    userId?: string;
    organizationId?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({ data: data as any });
  }

  async findAll(organizationId: string, filters?: { entity?: string; userId?: string; page?: number }) {
    const page = filters?.page || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };
    if (filters?.entity) where.entity = filters.entity;
    if (filters?.userId) where.userId = filters.userId;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total, page, pages: Math.ceil(total / limit) };
  }
}
