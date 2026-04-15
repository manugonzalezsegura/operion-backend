export class ProductPassportResponseDto {
  id!: string;
  name!: string;
  sku!: string;
  description?: string;
  tenantId!: string;
  status!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
