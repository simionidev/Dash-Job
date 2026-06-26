import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getGuestsReport(eventId: string) {
    return this.prisma.guest.findMany({
      where: { list: { eventId } },
      include: {
        list: { select: { name: true, type: true } },
        rsvp: { select: { status: true, confirmedAt: true } },
        checkIn: { select: { checkedInAt: true, checkedOutAt: true, method: true } },
        promoter: { include: { user: { select: { name: true } } } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getCheckInsReport(eventId: string) {
    return this.prisma.checkIn.findMany({
      where: { eventId },
      include: {
        guest: {
          select: {
            name: true, cpf: true, phone: true,
            list: { select: { name: true, type: true } },
          },
        },
        operator: { select: { name: true } },
      },
      orderBy: { checkedInAt: 'asc' },
    });
  }

  async exportGuestsExcel(eventId: string): Promise<Buffer> {
    const guests = await this.getGuestsReport(eventId);
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Convidados');

    sheet.columns = [
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Telefone', key: 'phone', width: 15 },
      { header: 'CPF', key: 'cpf', width: 15 },
      { header: 'Lista', key: 'list', width: 20 },
      { header: 'Tipo Lista', key: 'listType', width: 15 },
      { header: 'RSVP', key: 'rsvp', width: 12 },
      { header: 'Check-in', key: 'checkIn', width: 20 },
      { header: 'Promotor', key: 'promoter', width: 25 },
    ];

    sheet.getRow(1).font = { bold: true };

    for (const guest of guests) {
      sheet.addRow({
        name: guest.name,
        email: guest.email || '',
        phone: guest.phone || '',
        cpf: guest.cpf || '',
        list: guest.list.name,
        listType: guest.list.type,
        rsvp: guest.rsvp?.status || 'PENDING',
        checkIn: guest.checkIn?.checkedInAt?.toLocaleString('pt-BR') || 'Não',
        promoter: guest.promoter?.user?.name || '',
      });
    }

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
  }

  async exportCheckInsExcel(eventId: string): Promise<Buffer> {
    const checkIns = await this.getCheckInsReport(eventId);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Check-ins');

    sheet.columns = [
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'CPF', key: 'cpf', width: 15 },
      { header: 'Telefone', key: 'phone', width: 15 },
      { header: 'Lista', key: 'list', width: 20 },
      { header: 'Entrada', key: 'checkIn', width: 22 },
      { header: 'Saída', key: 'checkOut', width: 22 },
      { header: 'Método', key: 'method', width: 12 },
      { header: 'Operador', key: 'operator', width: 25 },
    ];

    sheet.getRow(1).font = { bold: true };

    for (const ci of checkIns) {
      sheet.addRow({
        name: ci.guest.name,
        cpf: ci.guest.cpf || '',
        phone: ci.guest.phone || '',
        list: ci.guest.list.name,
        checkIn: ci.checkedInAt.toLocaleString('pt-BR'),
        checkOut: ci.checkedOutAt?.toLocaleString('pt-BR') || '',
        method: ci.method,
        operator: ci.operator.name,
      });
    }

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
  }

  async getPromoterReport(organizationId: string, eventId?: string) {
    return this.prisma.user.findMany({
      where: { organizationId, role: 'PROMOTER' },
      select: {
        id: true, name: true, email: true,
        promoterProfile: {
          select: {
            totalGuests: true,
            guests: {
              where: eventId ? { list: { eventId } } : {},
              select: { id: true, checkIn: { select: { id: true } } },
            },
          },
        },
      },
    });
  }
}
