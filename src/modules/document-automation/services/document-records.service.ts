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
import { CreateDocumentRecordDto } from '../dto/create-document-record.dto';
import { DocumentRecordResponseDto } from '../dto/document-record-response.dto';
import { UpdateDocumentRecordDto } from '../dto/update-document-record.dto';
import { DocumentRecordEntity } from '../entities/document-record.entity';
import { DocumentChannel } from '../enums/document-channel.enum';
import { DocumentStatus } from '../enums/document-status.enum';
import { DocumentRecordMapper } from '../mappers/document-record.mapper';

@Injectable()
export class DocumentRecordsService {
  private readonly logger = new Logger(DocumentRecordsService.name);

  constructor(
    @InjectRepository(DocumentRecordEntity)
    private readonly documentRecordRepository: Repository<DocumentRecordEntity>,
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,
  ) {}

  async create(
    createDto: CreateDocumentRecordDto,
  ): Promise<DocumentRecordResponseDto> {
    this.logger.log(`Registrando documento para tenant ${createDto.tenantId}`);

    const tenant = await this.findTenantOrFail(createDto.tenantId);

    this.assertExternalMessageIdForAutomatedChannels(createDto);


    const externalMessageId = createDto.externalMessageId?.trim() || undefined;

    if (externalMessageId) {
      const existingDocument = await this.documentRecordRepository.findOne({
        where: {
          tenantId: createDto.tenantId,
          sourceChannel: createDto.sourceChannel,
          externalMessageId,
        },
      });

      if (existingDocument) {
        this.logger.log('Documento existente reutilizado por idempotencia');
        return DocumentRecordMapper.toResponseDto(existingDocument);
      }
    }

    const newDocument = this.documentRecordRepository.create({
      tenant,
      tenantId: tenant.id,
      sourceChannel: createDto.sourceChannel,
      senderIdentifier: createDto.senderIdentifier,
      originalFileName: createDto.originalFileName,
      mimeType: createDto.mimeType,
      externalMessageId,
      ocrText: createDto.ocrText,
      processingStatus: DocumentStatus.RECEIVED,
    });

    try {
      const savedDocument =
        await this.documentRecordRepository.save(newDocument);
      this.logger.log(`Documento registrado correctamente ${savedDocument.id}`);
      return DocumentRecordMapper.toResponseDto(savedDocument);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        'code' in error &&
        error.code === '23505'
      ) {
        if (externalMessageId) {
          const existingDocument = await this.documentRecordRepository.findOne({
            where: {
              tenantId: createDto.tenantId,
              sourceChannel: createDto.sourceChannel,
              externalMessageId,
            },
          });

          if (existingDocument) {
            this.logger.log('Documento existente reutilizado por idempotencia');
            return DocumentRecordMapper.toResponseDto(existingDocument);
          }
        }

        throw new ConflictException(
          'No se pudo registrar el documento por conflicto de unicidad',
        );
      }

      throw error;
    }
  }

  async findOne(
    tenantId: string,
    documentId: string,
  ): Promise<DocumentRecordResponseDto> {
    const documentRecord = await this.documentRecordRepository.findOne({
      where: {
        id: documentId,
        tenantId,
      },
    });

    if (!documentRecord) {
      this.logger.warn(`Documento no encontrado ${documentId}`);
      throw new NotFoundException(
        `Documento con ID ${documentId} no encontrado`,
      );
    }

    return DocumentRecordMapper.toResponseDto(documentRecord);
  }

  async findAllByTenant(
    tenantId: string,
  ): Promise<DocumentRecordResponseDto[]> {
    await this.findTenantOrFail(tenantId);

    const documentRecords = await this.documentRecordRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });

    return documentRecords.map((documentRecord) =>
      DocumentRecordMapper.toResponseDto(documentRecord),
    );
  }

  async update(
    tenantId: string,
    documentId: string,
    updateDto: UpdateDocumentRecordDto,
  ): Promise<DocumentRecordResponseDto> {
    this.logger.debug(
      `Actualizando documento ${documentId} para tenant ${tenantId}`,
    );

    const documentRecord = await this.documentRecordRepository.findOne({
      where: {
        id: documentId,
        tenantId,
      },
    });

    if (!documentRecord) {
      this.logger.warn(`Documento no encontrado ${documentId}`);
      throw new NotFoundException(
        `Documento con ID ${documentId} no encontrado`,
      );
    }

    if (updateDto.documentType !== undefined) {
      documentRecord.documentType = updateDto.documentType;
    }
    if (updateDto.providerName !== undefined) {
      documentRecord.providerName = updateDto.providerName;
    }
    if (updateDto.counterpartyRut !== undefined) {
      documentRecord.counterpartyRut = this.normalizeRut(
        updateDto.counterpartyRut,
      );
    }
    if (updateDto.counterpartyName !== undefined) {
      documentRecord.counterpartyName = updateDto.counterpartyName;
    }
    if (updateDto.financialDirection !== undefined) {
      documentRecord.financialDirection = updateDto.financialDirection;
    }
    if (updateDto.folio !== undefined) {
      documentRecord.folio = updateDto.folio;
    }
    if (updateDto.issueDate !== undefined) {
      documentRecord.issueDate = updateDto.issueDate;
    }
    if (updateDto.dueDate !== undefined) {
      documentRecord.dueDate = updateDto.dueDate;
    }
    if (updateDto.totalAmount !== undefined) {
      documentRecord.totalAmount = updateDto.totalAmount;
    }
    if (updateDto.currency !== undefined) {
      documentRecord.currency = updateDto.currency;
    }
    if (updateDto.ocrText !== undefined) {
      documentRecord.ocrText = updateDto.ocrText;
    }
    if (updateDto.ocrStatus !== undefined) {
      documentRecord.ocrStatus = updateDto.ocrStatus;
    }
    if (updateDto.processingStatus !== undefined) {
      documentRecord.processingStatus = updateDto.processingStatus;
    }
    if (updateDto.storageProvider !== undefined) {
      documentRecord.storageProvider = updateDto.storageProvider;
    }
    if (updateDto.storageFolderId !== undefined) {
      documentRecord.storageFolderId = updateDto.storageFolderId;
    }
    if (updateDto.storageFileId !== undefined) {
      documentRecord.storageFileId = updateDto.storageFileId;
    }
    if (updateDto.storageFileUrl !== undefined) {
      documentRecord.storageFileUrl = updateDto.storageFileUrl;
    }
    if (updateDto.spreadsheetRowId !== undefined) {
      documentRecord.spreadsheetRowId = updateDto.spreadsheetRowId;
    }

    try {
      const updatedDocument =
        await this.documentRecordRepository.save(documentRecord);
      this.logger.log(`Documento actualizado correctamente ${documentId}`);
      return DocumentRecordMapper.toResponseDto(updatedDocument);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException(
          'No se pudo actualizar el documento por conflicto de datos',
        );
      }

      throw error;
    }
  }

  private assertExternalMessageIdForAutomatedChannels(
    createDto: CreateDocumentRecordDto,
  ): void {
    const requiresExternalMessageId =
      createDto.sourceChannel === DocumentChannel.WHATSAPP ||
      createDto.sourceChannel === DocumentChannel.EMAIL;

    if (!requiresExternalMessageId) {
      return;
    }

    const externalMessageId = createDto.externalMessageId?.trim();
    if (!externalMessageId) {
      throw new BadRequestException(
        'externalMessageId es obligatorio para canales automatizados',
      );
    }
  }

  private normalizeRut(rut: string): string {
    return rut.replace(/\./g, '').trim().toLowerCase();
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
