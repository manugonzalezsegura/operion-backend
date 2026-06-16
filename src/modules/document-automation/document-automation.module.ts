import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from 'src/core/tenants/tenant.entity';
import { DocumentFinancialSummaryController } from './controllers/document-financial-summary.controller';
import { DocumentPaymentsController } from './controllers/document-payments.controller';
import { DocumentRecordsController } from './controllers/document-records.controller';
import { DocumentPaymentEntity } from './entities/document-payment.entity';
import { DocumentRecordEntity } from './entities/document-record.entity';
import { DocumentReminderEntity } from './entities/document-reminder.entity';
import { TenantDocumentSettingsEntity } from './entities/tenant-document-settings.entity';
import { DocumentFinancialSummaryService } from './services/document-financial-summary.service';
import { DocumentPaymentsService } from './services/document-payments.service';
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
  providers: [
    DocumentRecordsService,
    DocumentPaymentsService,
    DocumentFinancialSummaryService,
  ],
  exports: [
    DocumentRecordsService,
    DocumentPaymentsService,
    DocumentFinancialSummaryService,
  ],
  controllers: [
    DocumentRecordsController,
    DocumentPaymentsController,
    DocumentFinancialSummaryController,
  ],
})
export class DocumentAutomationModule {}
