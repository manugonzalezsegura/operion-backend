import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TenantEntity } from '../../../core/tenants/tenant.entity';
import { DocumentRecordEntity } from './document-record.entity';
import { DocumentChannel } from '../enums/document-channel.enum';
import { ReminderStatus } from '../enums/reminder-status.enum';

@Entity('document_reminders')
export class DocumentReminderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @ManyToOne(() => TenantEntity, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: TenantEntity;

  @Column({ name: 'document_record_id', type: 'uuid' })
  documentRecordId!: string;

  @ManyToOne(() => DocumentRecordEntity, { nullable: false })
  @JoinColumn([
    { name: 'tenant_id', referencedColumnName: 'tenantId' },
    { name: 'document_record_id', referencedColumnName: 'id' },
  ])
  documentRecord!: DocumentRecordEntity;

  @Column({ name: 'due_date', type: 'date' })
  dueDate!: string;

  @Index()
  @Column({ name: 'remind_at', type: 'timestamp' })
  remindAt!: Date;

  @Column({
    type: 'enum',
    enum: DocumentChannel,
    enumName: 'document_channel_enum',
    default: DocumentChannel.WHATSAPP,
  })
  channel!: DocumentChannel;

  @Index()
  @Column({
    type: 'enum',
    enum: ReminderStatus,
    enumName: 'reminder_status_enum',
    default: ReminderStatus.PENDING,
  })
  status!: ReminderStatus;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt?: Date | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
