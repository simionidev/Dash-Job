import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @ApiOperation({ summary: 'Criar evento' })
  @Roles('SUPER_ADMIN', 'ORGANIZER')
  @Post()
  create(
    @Body() dto: CreateEventDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.eventsService.create(dto, userId, orgId);
  }

  @ApiOperation({ summary: 'Listar eventos' })
  @ApiQuery({ name: 'status', required: false })
  @Get()
  findAll(
    @CurrentUser('organizationId') orgId: string,
    @Query('status') status?: string,
  ) {
    return this.eventsService.findAll(orgId, status);
  }

  @ApiOperation({ summary: 'Buscar evento por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @ApiOperation({ summary: 'Estatísticas do evento' })
  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.eventsService.getStats(id);
  }

  @ApiOperation({ summary: 'Atualizar evento' })
  @Roles('SUPER_ADMIN', 'ORGANIZER')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateEventDto>,
    @CurrentUser('id') userId: string,
  ) {
    return this.eventsService.update(id, dto, userId);
  }

  @ApiOperation({ summary: 'Cancelar evento' })
  @Roles('SUPER_ADMIN', 'ORGANIZER')
  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.eventsService.cancel(id, userId);
  }

  @ApiOperation({ summary: 'Duplicar evento' })
  @Roles('SUPER_ADMIN', 'ORGANIZER')
  @Post(':id/duplicate')
  duplicate(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.eventsService.duplicate(id, userId, orgId);
  }
}
