import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RsvpService {
  constructor(private prisma: PrismaService) {}

  async confirm(guestId: string, message?: string) {
    const guest = await this.prisma.guest.findUnique({
      where: { id: guestId },
      include: { list: true, rsvp: true },
    });
    if (!guest) throw new NotFoundException('Convidado não encontrado');
    if (guest.rsvp) throw new BadRequestException('RSVP já registrado');

    const rsvp = await this.prisma.rSVP.create({
      data: {
        guestId,
        status: 'CONFIRMED',
        message,
        confirmedAt: new Date(),
      },
    });

    return rsvp;
  }

  async decline(guestId: string, message?: string) {
    const guest = await this.prisma.guest.findUnique({ where: { id: guestId } });
    if (!guest) throw new NotFoundException('Convidado não encontrado');

    if (await this.prisma.rSVP.findUnique({ where: { guestId } })) {
      return this.prisma.rSVP.update({
        where: { guestId },
        data: { status: 'DECLINED', message },
      });
    }

    return this.prisma.rSVP.create({
      data: { guestId, status: 'DECLINED', message },
    });
  }

  async waitlist(guestId: string) {
    const guest = await this.prisma.guest.findUnique({ where: { id: guestId } });
    if (!guest) throw new NotFoundException('Convidado não encontrado');

    return this.prisma.rSVP.upsert({
      where: { guestId },
      update: { status: 'WAITLIST' },
      create: { guestId, status: 'WAITLIST' },
    });
  }

  async getByEvent(eventId: string) {
    return this.prisma.rSVP.findMany({
      where: { guest: { list: { eventId } } },
      include: {
        guest: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });
  }

  async getStats(eventId: string) {
    const [confirmed, declined, waitlist, total] = await Promise.all([
      this.prisma.rSVP.count({ where: { guest: { list: { eventId } }, status: 'CONFIRMED' } }),
      this.prisma.rSVP.count({ where: { guest: { list: { eventId } }, status: 'DECLINED' } }),
      this.prisma.rSVP.count({ where: { guest: { list: { eventId } }, status: 'WAITLIST' } }),
      this.prisma.guest.count({ where: { list: { eventId } } }),
    ]);

    return { total, confirmed, declined, waitlist, pending: total - confirmed - declined - waitlist };
  }
}
