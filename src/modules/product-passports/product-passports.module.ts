import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPassportsService } from './product-passports.service';
import { ProductPassportEntity } from './product-passport.entity';
import { ProductPassportsController } from './product-passports.controller';
import { TenantEntity } from 'src/core/tenants/tenant.entity';
import { ProductPassportStatusEntity } from './product-passport-status.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductPassportEntity,
      TenantEntity,
      ProductPassportStatusEntity,
    ]),
  ],
  providers: [ProductPassportsService],
  exports: [ProductPassportsService],
  controllers: [ProductPassportsController],
})
export class ProductPassportsModule {}
