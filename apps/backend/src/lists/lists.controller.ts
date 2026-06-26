import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ListsService } from './lists.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Lists')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lists')
export class ListsController {
  constructor(private listsService: ListsService) {}

  @ApiOperation({ summary: 'Criar lista de convidados' })
  @Roles('SUPER_ADMIN', 'ORGANIZER', 'PROMOTER')
  @Post()
  create(@Body() body: any, @CurrentUser('id') userId: string) {
    return this.listsService.create(body, userId);
  }

  @ApiOperation({ summary: 'Listas por evento' })
  @Get('event/:eventId')
  findByEvent(
    @Param('eventId') eventId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.listsService.findByEvent(eventId, userId, role);
  }

  @ApiOperation({ summary: 'Buscar lista por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listsService.findOne(id);
  }

  @ApiOperation({ summary: 'Contagem de convidados da lista' })
  @Get(':id/count')
  getGuestCount(@Param('id') id: string) {
    return this.listsService.getGuestCount(id);
  }

  @ApiOperation({ summary: 'Atualizar lista' })
  @Roles('SUPER_ADMIN', 'ORGANIZER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.listsService.update(id, body);
  }

  @ApiOperation({ summary: 'Deletar lista' })
  @Roles('SUPER_ADMIN', 'ORGANIZER')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.listsService.delete(id);
  }
}
