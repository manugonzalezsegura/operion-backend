import { DocumentPaymentEntity } from '../entities/document-payment.entity';
import { DocumentPaymentResponseDto } from '../dto/document-payment-response.dto';

export class DocumentPaymentMapper {
  static toResponseDto(
    payment: DocumentPaymentEntity,
  ): DocumentPaymentResponseDto {
    return {
      id: payment.id,
      documentRecordId: payment.documentRecordId,
      amount: payment.amount,
      paidAt: payment.paidAt,
      reference: payment.reference ?? undefined,
      notes: payment.notes ?? undefined,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
