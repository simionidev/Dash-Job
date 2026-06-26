import { Controller, Post, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Invitations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invitations')
export class InvitationsController {
  constructor(private invitationsService: InvitationsService) {}

  @ApiOperation({ summary: 'Enviar convite para convidado' })
  @Roles('SUPER_ADMIN', 'ORGANIZER', 'PROMOTER')
  @Post('send/:guestId')
  send(
    @Param('guestId') guestId: string,
    @Body() body: { channel?: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.invitationsService.send(guestId, userId, body.channel);
  }

  @ApiOperation({ summary: 'Enviar convites em massa para lista' })
  @Roles('SUPER_ADMIN', 'ORGANIZER', 'PROMOTER')
  @Post('bulk/:listId')
  sendBulk(
    @Param('listId') listId: string,
    @Body() body: { channel?: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.invitationsService.sendBulk(listId, userId, body.channel);
  }

  @ApiOperation({ summary: 'Convite de convidado' })
  @Get('guest/:guestId')
  getByGuest(@Param('guestId') guestId: string) {
    return this.invitationsService.getByGuest(guestId);
  }
}
