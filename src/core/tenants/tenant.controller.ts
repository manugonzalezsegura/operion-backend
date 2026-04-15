//operion-backend\src\modulos\tenants\tenant.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { TenantEntity } from './tenant.entity';
import { Public } from '../auth/decorators/public.decorator';
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  getAllTenants(): Promise<TenantEntity[]> {
    return this.tenantsService.getAllTenants();
  }
  @Public()
  @Post()
  createTenant(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.createTenant(createTenantDto);
  }

  @Get(':id')
  getTenantById(@Param('id') id: string) {
    return this.tenantsService.getTenantById(id);
  }
}
