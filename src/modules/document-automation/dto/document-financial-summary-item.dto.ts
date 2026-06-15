import { DocumentStatus } from '../enums/document-status.enum';
import { DocumentType } from '../enums/document-type.enum';
import { OcrStatus } from '../enums/ocr-status.enum';

export class DocumentFinancialSummaryItemDto {
  documentId!: string;
  documentType!: DocumentType;
  providerName?: string;
  folio?: string;
  issueDate?: string;
  dueDate?: string;
  totalAmount!: string;
  paidAmount!: string;
  remainingAmount!: string;
  processingStatus!: DocumentStatus;
  ocrStatus!: OcrStatus;
}
