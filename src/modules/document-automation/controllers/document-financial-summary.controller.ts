import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CurrentTenantId } from 'src/core/auth/decorators/current-tenant-id.decorator';
import { DocumentFinancialSummaryResponseDto } from '../dto/document-financial-summary-response.dto';
import { DocumentFinancialSummaryService } from '../services/document-financial-summary.service';

@Controller('document-automation')
export class DocumentFinancialSummaryController {
  constructor(
    private readonly documentFinancialSummaryService: DocumentFinancialSummaryService,
  ) {}

  @Get('tenants/:tenantId/counterparties/:rut/summary')
  findSummaryByRut(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('rut') rut: string,
    @CurrentTenantId() currentTenantId: string,
  ): Promise<DocumentFinancialSummaryResponseDto> {
    if (tenantId !== currentTenantId) {
      throw new ForbiddenException('No tiene acceso a este tenant');
    }

    return this.documentFinancialSummaryService.findSummaryByRut(tenantId, rut);
  }
}
