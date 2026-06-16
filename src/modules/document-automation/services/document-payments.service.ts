import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { TenantEntity } from 'src/core/tenants/tenant.entity';
import { CreateDocumentPaymentDto } from '../dto/create-document-payment.dto';
import { DocumentPaymentResponseDto } from '../dto/document-payment-response.dto';
import { DocumentPaymentEntity } from '../entities/document-payment.entity';
import { DocumentRecordEntity } from '../entities/document-record.entity';
import { DocumentPaymentMapper } from '../mappers/document-payment.mapper';

@Injectable()
export class DocumentPaymentsService {
  private readonly logger = new Logger(DocumentPaymentsService.name);

  constructor(
    @InjectRepository(DocumentPaymentEntity)
    private readonly documentPaymentRepository: Repository<DocumentPaymentEntity>,
    @InjectRepository(DocumentRecordEntity)
    private readonly documentRecordRepository: Repository<DocumentRecordEntity>,
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,
  ) {}

  async create(
    createDto: CreateDocumentPaymentDto,
  ): Promise<DocumentPaymentResponseDto> {
    this.logger.log(
      `Registrando pago para documento ${createDto.documentRecordId}`,
    );

    const tenant = await this.findTenantOrFail(createDto.tenantId);
    const documentRecord = await this.findDocumentOrFail(
      createDto.tenantId,
      createDto.documentRecordId,
    );

    const newPayment = this.documentPaymentRepository.create({
      tenant,
      tenantId: tenant.id,
      documentRecord,
      documentRecordId: documentRecord.id,
      amount: createDto.amount,
      paidAt: createDto.paidAt,
      reference: createDto.reference,
      notes: createDto.notes,
    });

    try {
      const savedPayment =
        await this.documentPaymentRepository.save(newPayment);
      this.logger.log(`Pago registrado correctamente ${savedPayment.id}`);
      return DocumentPaymentMapper.toResponseDto(savedPayment);
    } catch (error) {
      if (error instanceof QueryFailedError && 'code' in error) {
        if (error.code === '23514') {
          throw new BadRequestException(
            'El monto del pago debe ser mayor que cero',
          );
        }

        if (error.code === '23503') {
          throw new BadRequestException(
            'No se pudo registrar el pago porque el documento no es válido para este tenant',
          );
        }

        if (error.code === '23505') {
          throw new ConflictException(
            'No se pudo registrar el pago por conflicto de datos',
          );
        }
      }

      throw error;
    }
  }

  async findAllByDocument(
    tenantId: string,
    documentRecordId: string,
  ): Promise<DocumentPaymentResponseDto[]> {
    await this.findTenantOrFail(tenantId);
    await this.findDocumentOrFail(tenantId, documentRecordId);

    const payments = await this.documentPaymentRepository.find({
      where: {
        tenantId,
        documentRecordId,
      },
      order: {
        paidAt: 'DESC',
        createdAt: 'DESC',
      },
    });

    return payments.map((payment) =>
      DocumentPaymentMapper.toResponseDto(payment),
    );
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

  private async findDocumentOrFail(
    tenantId: string,
    documentRecordId: string,
  ): Promise<DocumentRecordEntity> {
    const documentRecord = await this.documentRecordRepository.findOne({
      where: {
        id: documentRecordId,
        tenantId,
      },
    });

    if (!documentRecord) {
      this.logger.warn(`Documento no encontrado para tenant ${tenantId}`);
      throw new NotFoundException(
        `Documento con ID ${documentRecordId} no encontrado para el tenant ${tenantId}`,
      );
    }

    return documentRecord;
  }
}
