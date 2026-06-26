import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QrcodeService } from '../qrcode/qrcode.service';

@Injectable()
export class CheckinService {
  constructor(
    private prisma: PrismaService,
    private qrcodeService: QrcodeService,
  ) {}

  async checkInByQrCode(token: string, eventId: string, operatorId: string) {
    const validation = await this.qrcodeService.validate(token, eventId);
    if (!validation.valid) throw new BadRequestException(validation.reason);

    const { guest } = validation;
    return this.doCheckIn(guest.id, eventId, operatorId, 'QR_CODE');
  }

  async checkInByName(name: string, eventId: string, operatorId: string) {
    const guests = await this.prisma.guest.findMany({
      where: { name: { contains: name, mode: 'insensitive' }, list: { eventId } },
      include: { checkIn: true, list: true },
    });
    if (!guests.length) throw new NotFoundException('Convidado não encontrado');
    return guests;
  }

  async checkInById(guestId: string, eventId: string, operatorId: string, method = 'MANUAL') {
    const guest = await this.prisma.guest.findUnique({ where: { id: guestId } });
    if (!guest) throw new NotFoundException('Convidado não encontrado');
    return this.doCheckIn(guestId, eventId, operatorId, method);
  }

  async checkOut(guestId: string, operatorId: string) {
    const checkIn = await this.prisma.checkIn.findUnique({ where: { guestId } });
    if (!checkIn) throw new NotFoundException('Check-in não encontrado');
    if (checkIn.checkedOutAt) throw new BadRequestException('Convidado já realizou checkout');

    return this.prisma.checkIn.update({
      where: { guestId },
      data: { status: 'CHECKED_OUT', checkedOutAt: new Date() },
      include: { guest: { select: { name: true } } },
    });
  }

  async getByEvent(eventId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.checkIn.findMany({
        where: { eventId },
        include: {
          guest: { select: { name: true, cpf: true, phone: true } },
          operator: { select: { name: true } },
        },
        orderBy: { checkedInAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.checkIn.count({ where: { eventId } }),
    ]);

    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async getEntriesByHour(eventId: string) {
    const checkIns = await this.prisma.checkIn.findMany({
      where: { eventId },
      select: { checkedInAt: true },
      orderBy: { checkedInAt: 'asc' },
    });

    const byHour: Record<string, number> = {};
    for (const ci of checkIns) {
      const hour = ci.checkedInAt.getHours().toString().padStart(2, '0') + ':00';
      byHour[hour] = (byHour[hour] || 0) + 1;
    }

    return Object.entries(byHour).map(([hour, count]) => ({ hour, count }));
  }

  private async doCheckIn(guestId: string, eventId: string, operatorId: string, method: string) {
    const existing = await this.prisma.checkIn.findUnique({ where: { guestId } });
    if (existing) throw new BadRequestException('Convidado já realizou check-in');

    const checkIn = await this.prisma.checkIn.create({
      data: { guestId, eventId, operatorId, method, status: 'CHECKED_IN' },
      include: {
        guest: { select: { name: true, cpf: true, list: { select: { name: true, type: true } } } },
        operator: { select: { name: true } },
      },
    });

    await this.prisma.qRCode.updateMany({
      where: { guestId },
      data: { isValid: false, usedAt: new Date() },
    });

    return checkIn;
  }
}
