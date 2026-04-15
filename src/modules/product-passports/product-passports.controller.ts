import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Patch,
  Req,
} from '@nestjs/common';
import { ProductPassportsService } from './product-passports.service';
import { CreateProductPassportDto } from './dto/create-product-passport.dto';
import { UpdateProductPassportDto } from './dto/update-product-passport.dto';
import { ProductPassportResponseDto } from './dto/product-passport-response.dto';
import type { AuthenticatedRequest } from 'src/core/auth/interface/authenticated-request.interface';

@Controller('pasaporte-productos')
export class ProductPassportsController {
  constructor(
    private readonly productPassportsService: ProductPassportsService,
  ) {}

  @Post()
  async createProductPassport(
    @Body() createProductPassportDto: CreateProductPassportDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<ProductPassportResponseDto> {
    const authenticatedTenantId = request.user.tenantId;
    return this.productPassportsService.createProductPassport(
      createProductPassportDto,
      authenticatedTenantId,
    );
  }

  @Get('me')
  getMyProductPassports(
    @Req() request: AuthenticatedRequest,
  ): Promise<ProductPassportResponseDto[]> {
    return this.productPassportsService.getProductPassportsByTenantId(
      request.user.tenantId,
    );
  }

  @Get(':id')
  getProductPassportById(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<ProductPassportResponseDto> {
    return this.productPassportsService.getProductPassportById(
      id,
      request.user.tenantId,
    );
  }

  @Delete(':id')
  deleteProductPassport(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    return this.productPassportsService.deleteProductPassport(
      id,
      request.user.tenantId,
    );
  }

  @Patch(':id')
  updateProductPassport(
    @Param('id') id: string,
    @Body() updateProductPassportDto: UpdateProductPassportDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<ProductPassportResponseDto> {
    return this.productPassportsService.updateProductPassport(
      id,
      updateProductPassportDto,
      request.user.tenantId,
    );
  }
}
