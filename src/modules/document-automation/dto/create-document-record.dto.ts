import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { DocumentChannel } from '../enums/document-channel.enum';

export class CreateDocumentRecordDto {
  @IsNotEmpty()
  @IsUUID()
  tenantId!: string;

  @IsNotEmpty()
  @IsEnum(DocumentChannel)
  sourceChannel!: DocumentChannel;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  senderIdentifier?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  originalFileName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  mimeType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  externalMessageId?: string;

  @IsOptional()
  @IsString()
  ocrText?: string;
}
