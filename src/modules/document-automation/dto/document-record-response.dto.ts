import { DocumentChannel } from '../enums/document-channel.enum';
import { DocumentStatus } from '../enums/document-status.enum';
import { DocumentType } from '../enums/document-type.enum';
import { FinancialDirection } from '../enums/financial-direction.enum';
import { OcrStatus } from '../enums/ocr-status.enum';

export class DocumentRecordResponseDto {
  id!: string;
  tenantId!: string;
  sourceChannel!: DocumentChannel;
  senderIdentifier?: string;
  originalFileName?: string;
  mimeType?: string;
  documentType!: DocumentType;
  providerName?: string;
  counterpartyRut?: string;
  counterpartyName?: string;
  financialDirection?: FinancialDirection;
  externalMessageId?: string;
  folio?: string;
  issueDate?: string;
  dueDate?: string;
  totalAmount?: string;
  currency!: string;
  ocrText?: string;
  ocrStatus!: OcrStatus;
  processingStatus!: DocumentStatus;
  storageProvider?: string;
  storageFolderId?: string;
  storageFileId?: string;
  storageFileUrl?: string;
  spreadsheetRowId?: string;
  createdAt!: Date;
  updatedAt!: Date;
}
