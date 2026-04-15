import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class UpdateProductPassportDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsNotEmpty()
  @IsString()
  name?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsNotEmpty()
  @IsString()
  description?: string;
}
