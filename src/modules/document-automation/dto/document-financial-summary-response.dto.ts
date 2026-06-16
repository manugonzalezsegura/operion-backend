import { DocumentFinancialSummaryItemDto } from './document-financial-summary-item.dto';

export class DocumentFinancialSummaryResponseDto {
  tenantId!: string;
  counterpartyRut!: string;
  counterpartyName?: string;
  documentCount!: number;
  totalAmount!: string;
  paidAmount!: string;
  remainingAmount!: string;
  documents!: DocumentFinancialSummaryItemDto[];
}
