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

@Entity('tenant_document_settings')
export class TenantDocumentSettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('UQ_tenant_document_settings_tenant_id', { unique: true })
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @ManyToOne(() => TenantEntity, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: TenantEntity;

  @Column({
    name: 'google_drive_root_folder_id',
    type: 'varchar',
    nullable: true,
  })
  googleDriveRootFolderId?: string | null;

  @Column({ name: 'google_sheet_id', type: 'varchar', nullable: true })
  googleSheetId?: string | null;

  @Column({
    name: 'default_reminder_days_before',
    type: 'integer',
    default: 5,
  })
  defaultReminderDaysBefore!: number;

  @Column({ name: 'whatsapp_phone_number_id', type: 'varchar', nullable: true })
  whatsappPhoneNumberId?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
