import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentTenantId } from 'src/core/auth/decorators/current-tenant-id.decorator';
import { CreateDocumentRecordDto } from '../dto/create-document-record.dto';
import { DocumentRecordResponseDto } from '../dto/document-record-response.dto';
import { UpdateDocumentRecordDto } from '../dto/update-document-record.dto';
import { DocumentRecordsService } from '../services/document-records.service';

@Controller('document-automation')
export class DocumentRecordsController {
  constructor(
    private readonly documentRecordsService: DocumentRecordsService,
  ) {}

  @Post('documents')
  create(
    @Body() createDto: CreateDocumentRecordDto,
    @CurrentTenantId() currentTenantId: string,
  ): Promise<DocumentRecordResponseDto> {
    return this.documentRecordsService.create({
      ...createDto,
      tenantId: currentTenantId,
    });
  }

  @Get('tenants/:tenantId/documents')
  findAllByTenant(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @CurrentTenantId() currentTenantId: string,
  ): Promise<DocumentRecordResponseDto[]> {
    if (tenantId !== currentTenantId) {
      throw new ForbiddenException('No tiene acceso a este tenant');
    }

    return this.documentRecordsService.findAllByTenant(tenantId);
  }

  @Get('tenants/:tenantId/documents/:documentId')
  findOne(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentTenantId() currentTenantId: string,
  ): Promise<DocumentRecordResponseDto> {
    if (tenantId !== currentTenantId) {
      throw new ForbiddenException('No tiene acceso a este tenant');
    }

    return this.documentRecordsService.findOne(tenantId, documentId);
  }

  @Patch('tenants/:tenantId/documents/:documentId')
  update(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Body() updateDto: UpdateDocumentRecordDto,
    @CurrentTenantId() currentTenantId: string,
  ): Promise<DocumentRecordResponseDto> {
    if (tenantId !== currentTenantId) {
      throw new ForbiddenException('No tiene acceso a este tenant');
    }

    return this.documentRecordsService.update(tenantId, documentId, updateDto);
  }
}
