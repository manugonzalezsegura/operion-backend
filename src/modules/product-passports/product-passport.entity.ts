import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { TenantEntity } from '../../core/tenants/tenant.entity';
import { ProductPassportStatusEntity } from './product-passport-status.entity';
@Entity('product_passports')
@Unique('UQ_product_passports_tenant_sku', ['sku', 'tenantId'])
export class ProductPassportEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 150 })
  sku!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @ManyToOne(() => TenantEntity, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: TenantEntity;

  @Column({ name: 'status_id', type: 'uuid' })
  statusId!: string;

  @ManyToOne(
    () => ProductPassportStatusEntity,
    (productPassportStatus) => productPassportStatus.productPassports,
    { nullable: false },
  )
  @JoinColumn({ name: 'status_id' })
  status!: ProductPassportStatusEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
