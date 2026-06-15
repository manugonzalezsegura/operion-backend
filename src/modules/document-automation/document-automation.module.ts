import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from 'src/core/tenants/tenant.entity';
import { DocumentRecordsController } from './controllers/document-records.controller';
import { DocumentPaymentEntity } from './entities/document-payment.entity';
import { DocumentRecordEntity } from './entities/document-record.entity';
import { DocumentReminderEntity } from './entities/document-reminder.entity';
import { TenantDocumentSettingsEntity } from './entities/tenant-document-settings.entity';
import { DocumentRecordsService } from './services/document-records.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentRecordEntity,
      DocumentReminderEntity,
      TenantDocumentSettingsEntity,
      DocumentPaymentEntity,
      TenantEntity,
    ]),
  ],
  providers: [DocumentRecordsService],
  exports: [DocumentRecordsService],
  controllers: [DocumentRecordsController],
})
export class DocumentAutomationModule {}
