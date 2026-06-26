import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QrcodeService {
  constructor(private prisma: PrismaService) {}

  async generate(guestId: string) {
    const guest = await this.prisma.guest.findUnique({
      where: { id: guestId },
      include: { list: { include: { event: true } }, qrCode: true },
    });
    if (!guest) throw new NotFoundException('Convidado não encontrado');

    if (guest.qrCode) {
      return { qrCode: guest.qrCode, image: await this.toImage(guest.qrCode.token) };
    }

    const token = uuidv4();
    const payload = JSON.stringify({
      token,
      guestId,
      eventId: guest.list.eventId,
      name: guest.name,
    });

    const qrCode = await this.prisma.qRCode.create({
      data: {
        guestId,
        token,
        qrData: payload,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return { qrCode, image: await this.toImage(token) };
  }

  async validate(token: string, eventId: string) {
    const qrCode = await this.prisma.qRCode.findUnique({
      where: { token },
      include: {
        guest: {
          include: {
            list: { include: { event: true } },
            checkIn: true,
            rsvp: true,
          },
        },
      },
    });

    if (!qrCode) return { valid: false, reason: 'QR Code não encontrado' };
    if (!qrCode.isValid) return { valid: false, reason: 'QR Code inválido ou já utilizado' };
    if (qrCode.expiresAt && qrCode.expiresAt < new Date()) {
      return { valid: false, reason: 'QR Code expirado' };
    }
    if (qrCode.guest.list.eventId !== eventId) {
      return { valid: false, reason: 'QR Code não pertence a este evento' };
    }
    if (qrCode.guest.checkIn) {
      return { valid: false, reason: 'Convidado já realizou check-in', guest: qrCode.guest };
    }

    return { valid: true, guest: qrCode.guest, qrCode };
  }

  async bulkGenerate(listId: string) {
    const guests = await this.prisma.guest.findMany({
      where: { listId, qrCode: null },
    });

    const results = await Promise.all(guests.map((g) => this.generate(g.id)));
    return { generated: results.length, total: guests.length };
  }

  private async toImage(token: string): Promise<string> {
    return QRCode.toDataURL(token, { width: 300, margin: 2 });
  }
}
