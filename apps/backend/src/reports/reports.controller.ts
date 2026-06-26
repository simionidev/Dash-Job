import { Controller, Get, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ORGANIZER')
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @ApiOperation({ summary: 'Relatório de convidados por evento' })
  @Get('guests/:eventId')
  getGuests(@Param('eventId') eventId: string) {
    return this.reportsService.getGuestsReport(eventId);
  }

  @ApiOperation({ summary: 'Relatório de check-ins' })
  @Get('checkins/:eventId')
  getCheckIns(@Param('eventId') eventId: string) {
    return this.reportsService.getCheckInsReport(eventId);
  }

  @ApiOperation({ summary: 'Exportar convidados em Excel' })
  @Get('guests/:eventId/excel')
  async exportGuestsExcel(@Param('eventId') eventId: string, @Res() res: Response) {
    const buffer = await this.reportsService.exportGuestsExcel(eventId);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="convidados-${eventId}.xlsx"`,
    });
    res.send(buffer);
  }

  @ApiOperation({ summary: 'Exportar check-ins em Excel' })
  @Get('checkins/:eventId/excel')
  async exportCheckInsExcel(@Param('eventId') eventId: string, @Res() res: Response) {
    const buffer = await this.reportsService.exportCheckInsExcel(eventId);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="checkins-${eventId}.xlsx"`,
    });
    res.send(buffer);
  }

  @ApiOperation({ summary: 'Relatório de promotores' })
  @Get('promoters')
  getPromoters(
    @CurrentUser('organizationId') orgId: string,
    @Query('eventId') eventId?: string,
  ) {
    return this.reportsService.getPromoterReport(orgId, eventId);
  }
}
