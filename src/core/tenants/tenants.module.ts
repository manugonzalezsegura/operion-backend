import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from './tenant.entity';
import { TenantsController } from './tenant.controller';
import { TenantsService } from './tenants.service';
@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity])],
  exports: [TypeOrmModule],
  providers: [TenantsService],
  controllers: [TenantsController],
})
export class TenantsModule {}
