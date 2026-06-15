import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TenantEntity } from '../../../core/tenants/tenant.entity';
import { DocumentChannel } from '../enums/document-channel.enum';
import { DocumentStatus } from '../enums/document-status.enum';
import { DocumentType } from '../enums/document-type.enum';
import { FinancialDirection } from '../enums/financial-direction.enum';
import { OcrStatus } from '../enums/ocr-status.enum';
import { DocumentPaymentEntity } from './document-payment.entity';

@Entity('document_records')
@Index('UQ_document_records_tenant_id', ['tenantId', 'id'], { unique: true })
@Index('idx_document_records_tenant_counterparty_rut', [
  'tenantId',
  'counterpartyRut',
])
@Index(
  'UQ_document_records_tenant_channel_external_message',
  ['tenantId', 'sourceChannel', 'externalMessageId'],
  {
    unique: true,
  },
)
export class DocumentRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @ManyToOne(() => TenantEntity, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: TenantEntity;

  @Index()
  @Column({
    name: 'source_channel',
    type: 'enum',
    enum: DocumentChannel,
    enumName: 'document_channel_enum',
  })
  sourceChannel!: DocumentChannel;

  @Column({ name: 'sender_identifier', type: 'varchar', nullable: true })
  senderIdentifier?: string | null;

  @Column({ name: 'original_file_name', type: 'varchar', nullable: true })
  originalFileName?: string | null;

  @Column({ name: 'mime_type', type: 'varchar', nullable: true })
  mimeType?: string | null;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: DocumentType,
    enumName: 'document_type_enum',
    default: DocumentType.OTHER,
  })
  documentType!: DocumentType;

  @Column({ name: 'provider_name', type: 'varchar', nullable: true })
  providerName?: string | null;

  @Column({ name: 'counterparty_rut', type: 'varchar', nullable: true })
  counterpartyRut?: string | null;

  @Column({ name: 'counterparty_name', type: 'varchar', nullable: true })
  counterpartyName?: string | null;

  @Column({
    name: 'financial_direction',
    type: 'enum',
    enum: FinancialDirection,
    enumName: 'financial_direction_enum',
    nullable: true,
  })
  financialDirection?: FinancialDirection | null;

  @Column({ name: 'external_message_id', type: 'varchar', nullable: true })
  externalMessageId?: string | null;

  @Column({ type: 'varchar', nullable: true })
  folio?: string | null;

  @Column({ name: 'issue_date', type: 'date', nullable: true })
  issueDate?: string | null;

  @Index()
  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate?: string | null;

  @Column({ name: 'total_amount', type: 'numeric', nullable: true })
  totalAmount?: string | null;

  @Column({ type: 'varchar', default: 'CLP' })
  currency!: string;

  @Column({ name: 'ocr_text', type: 'text', nullable: true })
  ocrText?: string | null;

  @Column({
    name: 'ocr_status',
    type: 'enum',
    enum: OcrStatus,
    enumName: 'ocr_status_enum',
    default: OcrStatus.PENDING,
  })
  ocrStatus!: OcrStatus;

  @Column({
    name: 'processing_status',
    type: 'enum',
    enum: DocumentStatus,
    enumName: 'document_status_enum',
    default: DocumentStatus.RECEIVED,
  })
  processingStatus!: DocumentStatus;

  @Column({ name: 'storage_provider', type: 'varchar', nullable: true })
  storageProvider?: string | null;

  @Column({ name: 'storage_folder_id', type: 'varchar', nullable: true })
  storageFolderId?: string | null;

  @Column({ name: 'storage_file_id', type: 'varchar', nullable: true })
  storageFileId?: string | null;

  @Column({ name: 'storage_file_url', type: 'varchar', nullable: true })
  storageFileUrl?: string | null;

  @Column({ name: 'spreadsheet_row_id', type: 'varchar', nullable: true })
  spreadsheetRowId?: string | null;

  @OneToMany(() => DocumentPaymentEntity, (payment) => payment.documentRecord)
  payments!: DocumentPaymentEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
