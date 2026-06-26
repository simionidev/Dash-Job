import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CheckinService } from './checkin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Check-in')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ORGANIZER', 'RECEPTION')
@Controller('checkin')
export class CheckinController {
  constructor(private checkinService: CheckinService) {}

  @ApiOperation({ summary: 'Check-in via QR Code' })
  @Post('qrcode')
  byQrCode(
    @Body() body: { token: string; eventId: string },
    @CurrentUser('id') operatorId: string,
  ) {
    return this.checkinService.checkInByQrCode(body.token, body.eventId, operatorId);
  }

  @ApiOperation({ summary: 'Buscar convidado por nome' })
  @Get('search')
  searchByName(
    @Query('name') name: string,
    @Query('eventId') eventId: string,
  ) {
    return this.checkinService.checkInByName(name, eventId, null);
  }

  @ApiOperation({ summary: 'Check-in manual por ID' })
  @Post('manual/:guestId')
  manual(
    @Param('guestId') guestId: string,
    @Body() body: { eventId: string },
    @CurrentUser('id') operatorId: string,
  ) {
    return this.checkinService.checkInById(guestId, body.eventId, operatorId);
  }

  @ApiOperation({ summary: 'Check-out' })
  @Patch('checkout/:guestId')
  checkout(
    @Param('guestId') guestId: string,
    @CurrentUser('id') operatorId: string,
  ) {
    return this.checkinService.checkOut(guestId, operatorId);
  }

  @ApiOperation({ summary: 'Listagem de check-ins do evento' })
  @Get('event/:eventId')
  getByEvent(
    @Param('eventId') eventId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.checkinService.getByEvent(eventId, +page, +limit);
  }

  @ApiOperation({ summary: 'Entradas por hora' })
  @Get('event/:eventId/by-hour')
  getByHour(@Param('eventId') eventId: string) {
    return this.checkinService.getEntriesByHour(eventId);
  }
}
