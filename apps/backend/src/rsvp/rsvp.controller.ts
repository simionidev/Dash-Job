import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RsvpService } from './rsvp.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('RSVP')
@Controller('rsvp')
export class RsvpController {
  constructor(private rsvpService: RsvpService) {}

  @ApiOperation({ summary: 'Confirmar presença' })
  @Post(':guestId/confirm')
  confirm(@Param('guestId') guestId: string, @Body() body: { message?: string }) {
    return this.rsvpService.confirm(guestId, body.message);
  }

  @ApiOperation({ summary: 'Recusar convite' })
  @Post(':guestId/decline')
  decline(@Param('guestId') guestId: string, @Body() body: { message?: string }) {
    return this.rsvpService.decline(guestId, body.message);
  }

  @ApiOperation({ summary: 'Entrar na lista de espera' })
  @Post(':guestId/waitlist')
  waitlist(@Param('guestId') guestId: string) {
    return this.rsvpService.waitlist(guestId);
  }

  @ApiOperation({ summary: 'RSVPs do evento' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('event/:eventId')
  getByEvent(@Param('eventId') eventId: string) {
    return this.rsvpService.getByEvent(eventId);
  }

  @ApiOperation({ summary: 'Estatísticas de RSVP do evento' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('event/:eventId/stats')
  getStats(@Param('eventId') eventId: string) {
    return this.rsvpService.getStats(eventId);
  }
}
