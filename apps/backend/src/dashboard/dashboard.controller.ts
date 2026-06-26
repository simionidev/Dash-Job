import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Visão geral da organização' })
  @Get('overview')
  getOverview(@CurrentUser('organizationId') orgId: string) {
    return this.dashboardService.getOverview(orgId);
  }

  @ApiOperation({ summary: 'Estatísticas dos eventos' })
  @Get('events')
  getEventStats(@CurrentUser('organizationId') orgId: string) {
    return this.dashboardService.getEventStats(orgId);
  }

  @ApiOperation({ summary: 'Ranking de promotores' })
  @Get('promoters/ranking')
  getPromoterRanking(
    @CurrentUser('organizationId') orgId: string,
    @Query('eventId') eventId?: string,
  ) {
    return this.dashboardService.getPromoterRanking(orgId, eventId);
  }

  @ApiOperation({ summary: 'Timeline de check-ins por hora' })
  @Get('event/:eventId/timeline')
  getTimeline(@Param('eventId') eventId: string) {
    return this.dashboardService.getCheckInTimeline(eventId);
  }

  @ApiOperation({ summary: 'Distribuição por tipo de lista' })
  @Get('event/:eventId/lists')
  getListDistribution(@Param('eventId') eventId: string) {
    return this.dashboardService.getListDistribution(eventId);
  }
}
