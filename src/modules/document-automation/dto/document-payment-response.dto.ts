export class DocumentPaymentResponseDto {
  id!: string;
  documentRecordId!: string;
  amount!: string;
  paidAt!: string;
  reference?: string;
  notes?: string;
  createdAt!: Date;
  updatedAt!: Date;
}
