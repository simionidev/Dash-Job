import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private orgsService: OrganizationsService) {}

  @ApiOperation({ summary: 'Criar organização (Super Admin)' })
  @Roles('SUPER_ADMIN')
  @Post()
  create(@Body() body: { name: string; slug: string; plan?: any }) {
    return this.orgsService.create(body);
  }

  @ApiOperation({ summary: 'Listar organizações (Super Admin)' })
  @Roles('SUPER_ADMIN')
  @Get()
  findAll() {
    return this.orgsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orgsService.findOne(id);
  }

  @Roles('SUPER_ADMIN', 'ORGANIZER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.orgsService.update(id, body);
  }

  @Roles('SUPER_ADMIN')
  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.orgsService.toggleActive(id);
  }
}
