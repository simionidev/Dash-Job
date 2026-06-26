import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GuestsService } from './guests.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Guests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('guests')
export class GuestsController {
  constructor(private guestsService: GuestsService) {}

  @ApiOperation({ summary: 'Adicionar convidado' })
  @Roles('SUPER_ADMIN', 'ORGANIZER', 'PROMOTER')
  @Post()
  create(@Body() body: any, @CurrentUser('id') userId: string) {
    return this.guestsService.create(body, userId);
  }

  @ApiOperation({ summary: 'Importar múltiplos convidados' })
  @Roles('SUPER_ADMIN', 'ORGANIZER', 'PROMOTER')
  @Post('bulk/:listId')
  bulkCreate(
    @Param('listId') listId: string,
    @Body() body: { guests: any[] },
    @CurrentUser('id') userId: string,
  ) {
    return this.guestsService.bulkCreate(listId, body.guests, userId);
  }

  @ApiOperation({ summary: 'Convidados por lista' })
  @ApiQuery({ name: 'search', required: false })
  @Get('list/:listId')
  findByList(@Param('listId') listId: string, @Query('search') search?: string) {
    return this.guestsService.findByList(listId, search);
  }

  @ApiOperation({ summary: 'Convidados por evento' })
  @ApiQuery({ name: 'search', required: false })
  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string, @Query('search') search?: string) {
    return this.guestsService.findByEvent(eventId, search);
  }

  @ApiOperation({ summary: 'Buscar por CPF no evento' })
  @Get('event/:eventId/cpf/:cpf')
  findByCpf(@Param('eventId') eventId: string, @Param('cpf') cpf: string) {
    return this.guestsService.findByCpf(cpf, eventId);
  }

  @ApiOperation({ summary: 'Buscar convidado por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guestsService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualizar convidado' })
  @Roles('SUPER_ADMIN', 'ORGANIZER', 'PROMOTER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.guestsService.update(id, body);
  }

  @ApiOperation({ summary: 'Remover convidado' })
  @Roles('SUPER_ADMIN', 'ORGANIZER')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.guestsService.delete(id);
  }
}
