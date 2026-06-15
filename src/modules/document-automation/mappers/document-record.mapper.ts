import { DocumentRecordEntity } from '../entities/document-record.entity';
import { DocumentRecordResponseDto } from '../dto/document-record-response.dto';

export class DocumentRecordMapper {
  static toResponseDto(
    documentRecord: DocumentRecordEntity,
  ): DocumentRecordResponseDto {
    return {
      id: documentRecord.id,
      tenantId: documentRecord.tenantId,
      sourceChannel: documentRecord.sourceChannel,
      senderIdentifier: documentRecord.senderIdentifier ?? undefined,
      originalFileName: documentRecord.originalFileName ?? undefined,
      mimeType: documentRecord.mimeType ?? undefined,
      documentType: documentRecord.documentType,
      providerName: documentRecord.providerName ?? undefined,
      counterpartyRut: documentRecord.counterpartyRut ?? undefined,
      counterpartyName: documentRecord.counterpartyName ?? undefined,
      financialDirection: documentRecord.financialDirection ?? undefined,
      externalMessageId: documentRecord.externalMessageId ?? undefined,
      folio: documentRecord.folio ?? undefined,
      issueDate: documentRecord.issueDate ?? undefined,
      dueDate: documentRecord.dueDate ?? undefined,
      totalAmount: documentRecord.totalAmount ?? undefined,
      currency: documentRecord.currency,
      ocrText: documentRecord.ocrText ?? undefined,
      ocrStatus: documentRecord.ocrStatus,
      processingStatus: documentRecord.processingStatus,
      storageProvider: documentRecord.storageProvider ?? undefined,
      storageFolderId: documentRecord.storageFolderId ?? undefined,
      storageFileId: documentRecord.storageFileId ?? undefined,
      storageFileUrl: documentRecord.storageFileUrl ?? undefined,
      spreadsheetRowId: documentRecord.spreadsheetRowId ?? undefined,
      createdAt: documentRecord.createdAt,
      updatedAt: documentRecord.updatedAt,
    };
  }
}
