import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { DocumentStatus } from '../enums/document-status.enum';
import { DocumentType } from '../enums/document-type.enum';
import { FinancialDirection } from '../enums/financial-direction.enum';
import { OcrStatus } from '../enums/ocr-status.enum';

const POSITIVE_DECIMAL_PATTERN =
  /^(?:[1-9]\d*(?:\.\d{1,2})?|0\.(?:[1-9]\d?|0[1-9]))$/;

export class UpdateDocumentRecordDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @ValidateIf((_, value) => value !== undefined)
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  providerName?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  counterpartyRut?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  counterpartyName?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsEnum(FinancialDirection)
  financialDirection?: FinancialDirection;

  @ValidateIf((_, value) => value !== undefined)
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  folio?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsDateString()
  issueDate?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsDateString()
  dueDate?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsNotEmpty()
  @IsString()
  @Matches(POSITIVE_DECIMAL_PATTERN, {
    message:
      'totalAmount debe ser un valor decimal positivo con hasta 2 decimales',
  })
  totalAmount?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MaxLength(100000)
  ocrText?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsEnum(OcrStatus)
  ocrStatus?: OcrStatus;

  @ValidateIf((_, value) => value !== undefined)
  @IsEnum(DocumentStatus)
  processingStatus?: DocumentStatus;

  @ValidateIf((_, value) => value !== undefined)
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  storageProvider?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  storageFolderId?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  storageFileId?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  storageFileUrl?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  spreadsheetRowId?: string;
}
