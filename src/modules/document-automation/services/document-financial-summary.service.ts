import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TenantEntity } from 'src/core/tenants/tenant.entity';
import { DocumentFinancialSummaryItemDto } from '../dto/document-financial-summary-item.dto';
import { DocumentFinancialSummaryResponseDto } from '../dto/document-financial-summary-response.dto';
import { DocumentPaymentEntity } from '../entities/document-payment.entity';
import { DocumentRecordEntity } from '../entities/document-record.entity';

@Injectable()
export class DocumentFinancialSummaryService {
  private readonly logger = new Logger(DocumentFinancialSummaryService.name);

  constructor(
    @InjectRepository(DocumentRecordEntity)
    private readonly documentRecordRepository: Repository<DocumentRecordEntity>,
    @InjectRepository(DocumentPaymentEntity)
    private readonly documentPaymentRepository: Repository<DocumentPaymentEntity>,
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,
  ) {}

  async findSummaryByRut(
    tenantId: string,
    rut: string,
  ): Promise<DocumentFinancialSummaryResponseDto> {
    await this.findTenantOrFail(tenantId);

    const normalizedRut = this.normalizeRut(rut);
    this.logger.log(`Consultando resumen financiero para RUT ${normalizedRut}`);

    const documents = await this.documentRecordRepository
      .createQueryBuilder('document')
      .where('document.tenant_id = :tenantId', { tenantId })
      .andWhere('document.counterparty_rut = :counterpartyRut', {
        counterpartyRut: normalizedRut,
      })
      .orderBy('document.due_date', 'ASC', 'NULLS LAST')
      .addOrderBy('document.created_at', 'DESC')
      .getMany();

    if (documents.length === 0) {
      return this.buildEmptySummary(tenantId, normalizedRut);
    }

    const documentIds = documents.map((document) => document.id);
    const payments = await this.documentPaymentRepository.find({
      where: {
        tenantId,
        documentRecordId: In(documentIds),
      },
    });

    const paidCentsByDocument = new Map<string, bigint>();

    for (const payment of payments) {
      const currentPaid =
        paidCentsByDocument.get(payment.documentRecordId) ?? 0n;
      paidCentsByDocument.set(
        payment.documentRecordId,
        currentPaid + this.amountToCents(payment.amount),
      );
    }

    let totalCents = 0n;
    let paidCents = 0n;
    let remainingCents = 0n;

    const documentItems: DocumentFinancialSummaryItemDto[] = documents.map(
      (document) => {
        const documentTotalCents = this.amountToCents(document.totalAmount);
        const documentPaidCents = paidCentsByDocument.get(document.id) ?? 0n;
        const documentRemainingCents = documentTotalCents - documentPaidCents;

        totalCents += documentTotalCents;
        paidCents += documentPaidCents;
        remainingCents += documentRemainingCents;

        return {
          documentId: document.id,
          documentType: document.documentType,
          providerName: document.providerName ?? undefined,
          folio: document.folio ?? undefined,
          issueDate: document.issueDate ?? undefined,
          dueDate: document.dueDate ?? undefined,
          totalAmount: this.centsToAmount(documentTotalCents),
          paidAmount: this.centsToAmount(documentPaidCents),
          remainingAmount: this.centsToAmount(documentRemainingCents),
          processingStatus: document.processingStatus,
          ocrStatus: document.ocrStatus,
        };
      },
    );

    const counterpartyName = documents.find(
      (document) => document.counterpartyName,
    )?.counterpartyName;

    const summary: DocumentFinancialSummaryResponseDto = {
      tenantId,
      counterpartyRut: normalizedRut,
      counterpartyName: counterpartyName ?? undefined,
      documentCount: documents.length,
      totalAmount: this.centsToAmount(totalCents),
      paidAmount: this.centsToAmount(paidCents),
      remainingAmount: this.centsToAmount(remainingCents),
      documents: documentItems,
    };

    this.logger.log(`Resumen financiero generado para RUT ${normalizedRut}`);

    return summary;
  }

  private buildEmptySummary(
    tenantId: string,
    normalizedRut: string,
  ): DocumentFinancialSummaryResponseDto {
    return {
      tenantId,
      counterpartyRut: normalizedRut,
      documentCount: 0,
      totalAmount: '0.00',
      paidAmount: '0.00',
      remainingAmount: '0.00',
      documents: [],
    };
  }

  private normalizeRut(rut: string): string {
    return rut.replace(/\./g, '').trim().toLowerCase();
  }

  private amountToCents(amount: string | null | undefined): bigint {
    if (amount == null || amount.trim() === '') {
      return 0n;
    }

    const normalized = amount.trim();
    const isNegative = normalized.startsWith('-');
    const unsigned = isNegative ? normalized.slice(1) : normalized;
    const [integerPart = '0', decimalPart = ''] = unsigned.split('.');
    const centsFraction = decimalPart.padEnd(2, '0').slice(0, 2);
    const cents = BigInt(integerPart) * 100n + BigInt(centsFraction);

    return isNegative ? -cents : cents;
  }

  private centsToAmount(cents: bigint): string {
    const isNegative = cents < 0n;
    const absoluteCents = isNegative ? -cents : cents;
    const whole = absoluteCents / 100n;
    const fraction = absoluteCents % 100n;
    const amount = `${whole}.${fraction.toString().padStart(2, '0')}`;

    return isNegative ? `-${amount}` : amount;
  }

  private async findTenantOrFail(tenantId: string): Promise<TenantEntity> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      this.logger.warn(`Tenant con ID ${tenantId} no encontrado`);
      throw new NotFoundException(`Tenant con ID ${tenantId} no encontrado`);
    }

    return tenant;
  }
}
