import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEventDto, userId: string, organizationId: string) {
    return this.prisma.event.create({
      data: {
        ...dto,
        date: new Date(dto.date),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        createdById: userId,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string, status?: string) {
    return this.prisma.event.findMany({
      where: {
        organizationId,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { lists: true, checkIns: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        organization: { select: { id: true, name: true } },
        lists: {
          include: {
            _count: { select: { guests: true } },
            promoter: { include: { user: { select: { name: true } } } },
          },
        },
        _count: { select: { checkIns: true } },
      },
    });
    if (!event) throw new NotFoundException('Evento não encontrado');
    return event;
  }

  async update(id: string, dto: Partial<CreateEventDto>, userId: string) {
    await this.checkOwnership(id, userId);
    return this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.date ? { date: new Date(dto.date) } : {}),
        ...(dto.endDate ? { endDate: new Date(dto.endDate) } : {}),
      },
    });
  }

  async cancel(id: string, userId: string) {
    await this.checkOwnership(id, userId);
    return this.prisma.event.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async duplicate(id: string, userId: string, organizationId: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Evento não encontrado');

    const { id: _, createdAt, updatedAt, ...data } = event;
    return this.prisma.event.create({
      data: {
        ...data,
        name: `${data.name} (Cópia)`,
        status: 'DRAFT',
        createdById: userId,
        organizationId,
      },
    });
  }

  async getStats(id: string) {
    const [totalGuests, confirmed, checkedIn, lists] = await Promise.all([
      this.prisma.guest.count({ where: { list: { eventId: id } } }),
      this.prisma.rSVP.count({ where: { guest: { list: { eventId: id } }, status: 'CONFIRMED' } }),
      this.prisma.checkIn.count({ where: { eventId: id } }),
      this.prisma.guestList.count({ where: { eventId: id } }),
    ]);

    const attendanceRate = totalGuests > 0 ? ((checkedIn / totalGuests) * 100).toFixed(1) : '0';

    return { totalGuests, confirmed, checkedIn, lists, attendanceRate };
  }

  private async checkOwnership(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Evento não encontrado');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user.role !== 'SUPER_ADMIN' && event.createdById !== userId) {
      throw new ForbiddenException('Sem permissão para editar este evento');
    }
  }
}
