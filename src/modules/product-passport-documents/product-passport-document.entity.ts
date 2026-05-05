import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('product_passport_documents')
export class ProductPassportDocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
