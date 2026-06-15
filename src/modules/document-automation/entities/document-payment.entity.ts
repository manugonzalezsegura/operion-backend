import {
  Check,
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

@Entity('document_payments')
@Check('chk_document_payments_amount_positive', 'amount > 0')
@Index('idx_document_payments_tenant_document_record', [
  'tenantId',
  'documentRecordId',
])
@Index('idx_document_payments_paid_at', ['paidAt'])
export class DocumentPaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  amount!: string;

  @Column({ name: 'paid_at', type: 'date' })
  paidAt!: string;

  @Column({ type: 'varchar', nullable: true })
  reference?: string | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
