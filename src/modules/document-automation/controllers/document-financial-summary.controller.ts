import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
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
  ): Promise<DocumentFinancialSummaryResponseDto> {
    return this.documentFinancialSummaryService.findSummaryByRut(tenantId, rut);
  }
}
