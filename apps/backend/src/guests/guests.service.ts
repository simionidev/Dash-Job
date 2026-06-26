import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GuestsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: string) {
    const list = await this.prisma.guestList.findUnique({
      where: { id: data.listId },
      include: { _count: { select: { guests: true } } },
    });
    if (!list) throw new NotFoundException('Lista não encontrada');

    if (list.maxGuests && list._count.guests >= list.maxGuests) {
      throw new BadRequestException('Lista de convidados atingiu o limite máximo');
    }

    let promoterId: string | undefined;
    if (userId) {
      const promoter = await this.prisma.promoterProfile.findUnique({ where: { userId } });
      promoterId = promoter?.id;
    }

    return this.prisma.guest.create({
      data: { ...data, createdById: userId, promoterId },
    });
  }

  async findByList(listId: string, search?: string) {
    return this.prisma.guest.findMany({
      where: {
        listId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { cpf: { contains: search } },
                { phone: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        rsvp: true,
        checkIn: true,
        invitation: true,
        qrCode: { select: { token: true, isValid: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findByEvent(eventId: string, search?: string) {
    return this.prisma.guest.findMany({
      where: {
        list: { eventId },
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { cpf: { contains: search } },
                { phone: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        list: { select: { name: true, type: true } },
        rsvp: true,
        checkIn: true,
        qrCode: { select: { token: true, isValid: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const guest = await this.prisma.guest.findUnique({
      where: { id },
      include: {
        list: { include: { event: true } },
        rsvp: true,
        checkIn: true,
        invitation: true,
        qrCode: true,
        promoter: { include: { user: { select: { name: true } } } },
      },
    });
    if (!guest) throw new NotFoundException('Convidado não encontrado');
    return guest;
  }

  async update(id: string, data: any) {
    return this.prisma.guest.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.guest.delete({ where: { id } });
  }

  async bulkCreate(listId: string, guests: any[], userId: string) {
    const list = await this.prisma.guestList.findUnique({ where: { id: listId } });
    if (!list) throw new NotFoundException('Lista não encontrada');

    const promoter = await this.prisma.promoterProfile.findUnique({ where: { userId } });

    const data = guests.map((g) => ({
      ...g,
      listId,
      createdById: userId,
      promoterId: promoter?.id,
    }));

    return this.prisma.guest.createMany({ data, skipDuplicates: true });
  }

  async findByCpf(cpf: string, eventId: string) {
    return this.prisma.guest.findFirst({
      where: { cpf, list: { eventId } },
      include: {
        list: { select: { name: true, type: true } },
        rsvp: true,
        checkIn: true,
        qrCode: { select: { token: true, isValid: true } },
      },
    });
  }
}
