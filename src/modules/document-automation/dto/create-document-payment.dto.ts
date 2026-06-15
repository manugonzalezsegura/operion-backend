import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

const AMOUNT_PATTERN =
  /^(?:[1-9]\d{0,12}(?:\.\d{1,2})?|0\.(?:[1-9]\d?|0[1-9]))$/;

export class CreateDocumentPaymentDto {
  @IsNotEmpty()
  @IsUUID()
  tenantId!: string;

  @IsNotEmpty()
  @IsUUID()
  documentRecordId!: string;

  @IsNotEmpty()
  @IsString()
  @Matches(AMOUNT_PATTERN, {
    message: 'amount debe ser un valor decimal positivo con hasta 2 decimales',
  })
  amount!: string;

  @IsNotEmpty()
  @IsDateString()
  paidAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  reference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
