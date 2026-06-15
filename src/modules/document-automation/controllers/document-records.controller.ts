import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
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
  ): Promise<DocumentRecordResponseDto> {
    return this.documentRecordsService.create(createDto);
  }

  @Get('tenants/:tenantId/documents')
  findAllByTenant(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
  ): Promise<DocumentRecordResponseDto[]> {
    return this.documentRecordsService.findAllByTenant(tenantId);
  }

  @Get('tenants/:tenantId/documents/:documentId')
  findOne(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
  ): Promise<DocumentRecordResponseDto> {
    return this.documentRecordsService.findOne(tenantId, documentId);
  }

  @Patch('tenants/:tenantId/documents/:documentId')
  update(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Body() updateDto: UpdateDocumentRecordDto,
  ): Promise<DocumentRecordResponseDto> {
    return this.documentRecordsService.update(tenantId, documentId, updateDto);
  }
}
