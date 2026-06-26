import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ORGANIZER')
@Controller('audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @ApiOperation({ summary: 'Logs de auditoria' })
  @Get()
  findAll(
    @CurrentUser('organizationId') orgId: string,
    @Query('entity') entity?: string,
    @Query('userId') userId?: string,
    @Query('page') page?: number,
  ) {
    return this.auditService.findAll(orgId, { entity, userId, page: +page });
  }
}
