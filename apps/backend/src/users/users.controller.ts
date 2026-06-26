import { Controller, Get, Patch, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Listar usuários da organização' })
  @Roles('SUPER_ADMIN', 'ORGANIZER')
  @Get()
  findAll(@CurrentUser('organizationId') orgId: string) {
    return this.usersService.findAll(orgId);
  }

  @ApiOperation({ summary: 'Listar promotores' })
  @Roles('SUPER_ADMIN', 'ORGANIZER')
  @Get('promoters')
  getPromoters(@CurrentUser('organizationId') orgId: string) {
    return this.usersService.getPromoters(orgId);
  }

  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualizar perfil' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(id, body);
  }

  @ApiOperation({ summary: 'Alterar senha' })
  @Patch(':id/password')
  changePassword(
    @Param('id') id: string,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.usersService.changePassword(id, body.currentPassword, body.newPassword);
  }

  @ApiOperation({ summary: 'Ativar/desativar usuário' })
  @Roles('SUPER_ADMIN', 'ORGANIZER')
  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
  }
}
