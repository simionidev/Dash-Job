import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: string) {
    return this.prisma.guestList.create({
      data: { ...data, createdById: userId },
    });
  }

  async findByEvent(eventId: string, userId?: string, role?: string) {
    const where: any = { eventId };

    if (role === 'PROMOTER' && userId) {
      const promoter = await this.prisma.promoterProfile.findUnique({ where: { userId } });
      if (promoter) where.promoterId = promoter.id;
    }

    return this.prisma.guestList.findMany({
      where,
      include: {
        promoter: { include: { user: { select: { name: true } } } },
        _count: { select: { guests: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const list = await this.prisma.guestList.findUnique({
      where: { id },
      include: {
        event: { select: { id: true, name: true, date: true } },
        promoter: { include: { user: { select: { name: true, email: true } } } },
        _count: { select: { guests: true } },
      },
    });
    if (!list) throw new NotFoundException('Lista não encontrada');
    return list;
  }

  async update(id: string, data: any) {
    return this.prisma.guestList.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.guestList.delete({ where: { id } });
  }

  async getGuestCount(id: string) {
    const [total, confirmed, waitlist] = await Promise.all([
      this.prisma.guest.count({ where: { listId: id } }),
      this.prisma.rSVP.count({ where: { guest: { listId: id }, status: 'CONFIRMED' } }),
      this.prisma.rSVP.count({ where: { guest: { listId: id }, status: 'WAITLIST' } }),
    ]);
    return { total, confirmed, waitlist };
  }
}
