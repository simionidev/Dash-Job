import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { QrcodeService } from './qrcode.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('QR Code')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('qrcode')
export class QrcodeController {
  constructor(private qrcodeService: QrcodeService) {}

  @ApiOperation({ summary: 'Gerar QR Code para convidado' })
  @Roles('SUPER_ADMIN', 'ORGANIZER', 'PROMOTER')
  @Post('generate/:guestId')
  generate(@Param('guestId') guestId: string) {
    return this.qrcodeService.generate(guestId);
  }

  @ApiOperation({ summary: 'Gerar QR Codes para toda a lista' })
  @Roles('SUPER_ADMIN', 'ORGANIZER')
  @Post('bulk/:listId')
  bulkGenerate(@Param('listId') listId: string) {
    return this.qrcodeService.bulkGenerate(listId);
  }

  @ApiOperation({ summary: 'Validar QR Code na portaria' })
  @Roles('SUPER_ADMIN', 'ORGANIZER', 'RECEPTION')
  @Post('validate')
  validate(@Body() body: { token: string; eventId: string }) {
    return this.qrcodeService.validate(body.token, body.eventId);
  }
}
