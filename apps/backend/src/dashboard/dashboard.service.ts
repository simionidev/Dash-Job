import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview(organizationId: string) {
    const [totalEvents, activeEvents, totalGuests, totalCheckins, totalPromoters] =
      await Promise.all([
        this.prisma.event.count({ where: { organizationId } }),
        this.prisma.event.count({ where: { organizationId, status: 'PUBLISHED' } }),
        this.prisma.guest.count({ where: { list: { event: { organizationId } } } }),
        this.prisma.checkIn.count({ where: { event: { organizationId } } }),
        this.prisma.user.count({ where: { organizationId, role: 'PROMOTER' } }),
      ]);

    const attendanceRate =
      totalGuests > 0 ? ((totalCheckins / totalGuests) * 100).toFixed(1) : '0';

    return {
      totalEvents,
      activeEvents,
      totalGuests,
      totalCheckins,
      totalPromoters,
      attendanceRate,
    };
  }

  async getEventStats(organizationId: string) {
    const events = await this.prisma.event.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        date: true,
        status: true,
        _count: { select: { checkIns: true } },
        lists: { select: { _count: { select: { guests: true } } } },
      },
      orderBy: { date: 'desc' },
      take: 10,
    });

    return events.map((e) => ({
      id: e.id,
      name: e.name,
      date: e.date,
      status: e.status,
      checkins: e._count.checkIns,
      guests: e.lists.reduce((acc, l) => acc + l._count.guests, 0),
    }));
  }

  async getPromoterRanking(organizationId: string, eventId?: string) {
    const promoters = await this.prisma.user.findMany({
      where: { organizationId, role: 'PROMOTER' },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        promoterProfile: {
          select: {
            guests: {
              where: eventId ? { list: { eventId } } : {},
              select: { id: true, checkIn: true, rsvp: true },
            },
          },
        },
      },
    });

    return promoters
      .map((p) => {
        const guests = p.promoterProfile?.guests || [];
        return {
          id: p.id,
          name: p.name,
          email: p.email,
          avatarUrl: p.avatarUrl,
          totalGuests: guests.length,
          confirmed: guests.filter((g) => g.rsvp?.status === 'CONFIRMED').length,
          checkedIn: guests.filter((g) => g.checkIn).length,
        };
      })
      .sort((a, b) => b.checkedIn - a.checkedIn);
  }

  async getCheckInTimeline(eventId: string) {
    const checkIns = await this.prisma.checkIn.findMany({
      where: { eventId },
      select: { checkedInAt: true },
      orderBy: { checkedInAt: 'asc' },
    });

    const byHour: Record<string, number> = {};
    for (const ci of checkIns) {
      const h = `${ci.checkedInAt.getHours().toString().padStart(2, '0')}:00`;
      byHour[h] = (byHour[h] || 0) + 1;
    }

    return Object.entries(byHour).map(([hour, count]) => ({ hour, count }));
  }

  async getListDistribution(eventId: string) {
    const lists = await this.prisma.guestList.findMany({
      where: { eventId },
      select: {
        name: true,
        type: true,
        _count: { select: { guests: true } },
      },
    });

    return lists.map((l) => ({ name: l.name, type: l.type, count: l._count.guests }));
  }
}
