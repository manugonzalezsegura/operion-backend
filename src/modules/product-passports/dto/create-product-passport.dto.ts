import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProductPassportDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  sku!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
