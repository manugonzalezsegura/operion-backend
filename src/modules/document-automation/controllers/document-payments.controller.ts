import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CurrentTenantId } from 'src/core/auth/decorators/current-tenant-id.decorator';
import { CreateDocumentPaymentDto } from '../dto/create-document-payment.dto';
import { DocumentPaymentResponseDto } from '../dto/document-payment-response.dto';
import { DocumentPaymentsService } from '../services/document-payments.service';

@Controller('document-automation')
export class DocumentPaymentsController {
  constructor(
    private readonly documentPaymentsService: DocumentPaymentsService,
  ) {}

  @Post('payments')
  create(
    @Body() createDto: CreateDocumentPaymentDto,
    @CurrentTenantId() currentTenantId: string,
  ): Promise<DocumentPaymentResponseDto> {
    return this.documentPaymentsService.create({
      ...createDto,
      tenantId: currentTenantId,
    });
  }

  @Get('tenants/:tenantId/documents/:documentId/payments')
  findAllByDocument(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentTenantId() currentTenantId: string,
  ): Promise<DocumentPaymentResponseDto[]> {
    if (tenantId !== currentTenantId) {
      throw new ForbiddenException('No tiene acceso a este tenant');
    }

    return this.documentPaymentsService.findAllByDocument(tenantId, documentId);
  }
}
