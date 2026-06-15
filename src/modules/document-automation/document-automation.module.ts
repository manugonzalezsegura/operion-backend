import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentPaymentEntity } from './entities/document-payment.entity';
import { DocumentRecordEntity } from './entities/document-record.entity';
import { DocumentReminderEntity } from './entities/document-reminder.entity';
import { TenantDocumentSettingsEntity } from './entities/tenant-document-settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentRecordEntity,
      DocumentReminderEntity,
      TenantDocumentSettingsEntity,
      DocumentPaymentEntity,
    ]),
  ],
})
export class DocumentAutomationModule {}
