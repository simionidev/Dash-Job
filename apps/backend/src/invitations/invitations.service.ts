import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { QrcodeService } from '../qrcode/qrcode.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InvitationsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private qrcodeService: QrcodeService,
    private config: ConfigService,
  ) {}

  async send(guestId: string, senderId: string, channel: string = 'EMAIL') {
    const guest = await this.prisma.guest.findUnique({
      where: { id: guestId },
      include: { list: { include: { event: true } } },
    });
    if (!guest) throw new NotFoundException('Convidado não encontrado');

    let invitation = await this.prisma.invitation.findUnique({ where: { guestId } });

    if (!invitation) {
      invitation = await this.prisma.invitation.create({
        data: {
          guestId,
          sentById: senderId,
          channel: channel as any,
          status: 'SENT',
          sentAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    } else {
      invitation = await this.prisma.invitation.update({
        where: { guestId },
        data: { status: 'SENT', sentAt: new Date() },
      });
    }

    const frontendUrl = this.config.get('FRONTEND_URL');
    const rsvpLink = `${frontendUrl}/rsvp/${guestId}`;

    if (channel === 'EMAIL' && guest.email) {
      await this.notifications.sendInvitationEmail(
        guest.email,
        guest.name,
        guest.list.event.name,
        rsvpLink,
      );
    } else if (channel === 'WHATSAPP' && guest.phone) {
      const message = `Olá ${guest.name}! Você foi convidado(a) para ${guest.list.event.name}. Confirme: ${rsvpLink}`;
      await this.notifications.sendWhatsApp(guest.phone, message);
    }

    return invitation;
  }

  async sendBulk(listId: string, senderId: string, channel: string = 'EMAIL') {
    const guests = await this.prisma.guest.findMany({
      where: { listId },
      select: { id: true },
    });

    const results = await Promise.allSettled(
      guests.map((g) => this.send(g.id, senderId, channel)),
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return { sent, failed, total: guests.length };
  }

  async getByGuest(guestId: string) {
    return this.prisma.invitation.findUnique({
      where: { guestId },
      include: { sentBy: { select: { name: true } } },
    });
  }
}
