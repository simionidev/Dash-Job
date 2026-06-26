import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId?: string) {
    return this.prisma.user.findMany({
      where: organizationId ? { organizationId } : {},
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, isActive: true, avatarUrl: true,
        lastLoginAt: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, phone: true, cpf: true,
        role: true, isActive: true, avatarUrl: true,
        lastLoginAt: true, createdAt: true,
        organization: { select: { id: true, name: true } },
        promoterProfile: true,
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async update(id: string, data: Partial<{ name: string; phone: string; avatarUrl: string }>) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, phone: true, role: true, avatarUrl: true },
    });
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new ConflictException('Senha atual incorreta');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
    return { message: 'Senha alterada com sucesso' };
  }

  async toggleActive(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, isActive: true },
    });
  }

  async getPromoters(organizationId: string) {
    return this.prisma.user.findMany({
      where: { organizationId, role: 'PROMOTER', isActive: true },
      select: {
        id: true, name: true, email: true, phone: true, avatarUrl: true,
        promoterProfile: {
          select: { totalGuests: true, totalEvents: true },
        },
      },
    });
  }
}
