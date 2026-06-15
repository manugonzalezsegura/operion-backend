import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
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
  ): Promise<DocumentPaymentResponseDto> {
    return this.documentPaymentsService.create(createDto);
  }

  @Get('tenants/:tenantId/documents/:documentId/payments')
  findAllByDocument(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
  ): Promise<DocumentPaymentResponseDto[]> {
    return this.documentPaymentsService.findAllByDocument(tenantId, documentId);
  }
}
