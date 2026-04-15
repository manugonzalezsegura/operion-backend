import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { ProductPassportEntity } from './product-passport.entity';
import { TenantEntity } from 'src/core/tenants/tenant.entity';
import { ProductPassportStatusEntity } from './product-passport-status.entity';
import { CreateProductPassportDto } from './dto/create-product-passport.dto';
import { UpdateProductPassportDto } from './dto/update-product-passport.dto';
import { ProductPassportResponseDto } from './dto/product-passport-response.dto';

@Injectable()
export class ProductPassportsService {
  private readonly logger = new Logger(ProductPassportsService.name);

  constructor(
    @InjectRepository(ProductPassportEntity)
    private readonly productPassportRepository: Repository<ProductPassportEntity>,
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,
    @InjectRepository(ProductPassportStatusEntity)
    private readonly productPassportStatusRepository: Repository<ProductPassportStatusEntity>,
  ) {}

  async createProductPassport(
    createProductPassportDto: CreateProductPassportDto,
    authenticatedTenantId: string,
  ): Promise<ProductPassportResponseDto> {
    this.logger.debug(
      `Creando pasaporte de producto con SKU: ${createProductPassportDto.sku}`,
    );

    const tenant = await this.findTenantOrFail(authenticatedTenantId);

    const defaultStatus = await this.productPassportStatusRepository.findOne({
      where: { code: 'DRAFT' },
    });

    if (!defaultStatus) {
      this.logger.error(
        `Estado por defecto 'DRAFT' no encontrado en la base de datos`,
      );
      throw new InternalServerErrorException(
        `Estado por defecto 'DRAFT' no encontrado en la base de datos`,
      );
    }

    const newProductPassport = this.productPassportRepository.create({
      name: createProductPassportDto.name,
      sku: createProductPassportDto.sku,
      description: createProductPassportDto.description,
      tenant,
      tenantId: tenant.id,
      status: defaultStatus,
      statusId: defaultStatus.id,
    });
    try {
      const savedProductPassport =
        await this.productPassportRepository.save(newProductPassport);
      this.logger.log(
        `Pasaporte de producto con SKU: ${savedProductPassport.sku} creado exitosamente con ID: ${savedProductPassport.id}`,
      );
      return this.mapToResponseDto(savedProductPassport);
    } catch (error) {
      this.logger.error(
        `Error creando pasaporte de producto con SKU: ${newProductPassport.sku} para tenant: ${tenant.name}`,
      );
      if (
        error instanceof QueryFailedError &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException(
          `SKU: ${createProductPassportDto.sku} ya existe para este tenant: ${tenant.name}`,
        );
      }
      throw error;
    }
  }

  async getProductPassportById(
    id: string,
    authenticatedTenantId: string,
  ): Promise<ProductPassportResponseDto> {
    const productPassport = await this.productPassportRepository.findOne({
      where: { id, tenantId: authenticatedTenantId },
      relations: { status: true },
    });

    if (!productPassport) {
      this.logger.warn(`Pasaporte de producto con ID ${id} no encontrado`);
      throw new NotFoundException(
        `Pasaporte de producto con ID ${id} no encontrado`,
      );
    }
    return this.mapToResponseDto(productPassport);
  }

  async getProductPassportsByTenantId(
    tenantId: string,
  ): Promise<ProductPassportResponseDto[]> {
    const productPassports = await this.productPassportRepository.find({
      where: { tenantId },
      relations: { status: true },
      order: { id: 'ASC' },
    });
    return productPassports.map((productPassport) =>
      this.mapToResponseDto(productPassport),
    );
  }

  async updateProductPassport(
    id: string,
    updateProductPassportDto: UpdateProductPassportDto,
    authenticatedTenantId: string,
  ): Promise<ProductPassportResponseDto> {
    this.logger.debug(`Actualizando pasaporte de producto con ID: ${id}`);

    const productPassport = await this.productPassportRepository.findOne({
      where: { id, tenantId: authenticatedTenantId },
      relations: { status: true },
    });
    if (!productPassport) {
      this.logger.warn(`Pasaporte de producto con ID ${id} no encontrado`);
      throw new NotFoundException(
        `Pasaporte de producto con ID ${id} no encontrado`,
      );
    }

    const updateData = Object.fromEntries(
      Object.entries(updateProductPassportDto).filter(
        ([, value]) => value !== undefined,
      ),
    );
    Object.assign(productPassport, updateData);
    try {
      const updatedProductPassport =
        await this.productPassportRepository.save(productPassport);

      this.logger.log(
        `Pasaporte de producto con ID: ${id} actualizado exitosamente`,
      );
      return this.mapToResponseDto(updatedProductPassport);
    } catch (error) {
      this.logger.error(
        `Error actualizando pasaporte de producto con ID: ${id}`,
      );
      if (
        error instanceof QueryFailedError &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException(
          `No se pudo actualizar el pasaporte de producto por conflicto de datos`,
        );
      }
      throw error;
    }
  }

  async deleteProductPassport(
    id: string,
    authenticatedTenantId: string,
  ): Promise<{ message: string }> {
    const productPassport = await this.productPassportRepository.findOne({
      where: { id, tenantId: authenticatedTenantId },
    });
    if (!productPassport) {
      this.logger.warn(`Pasaporte de producto con ID ${id} no encontrado`);
      throw new NotFoundException(
        `Pasaporte de producto con ID ${id} no encontrado`,
      );
    }
    await this.productPassportRepository.remove(productPassport);
    this.logger.log(
      `Pasaporte de producto con ID: ${id} eliminado exitosamente`,
    );
    return {
      message: `Pasaporte de producto con ID ${id} eliminado exitosamente`,
    };
  }

  private async findTenantOrFail(tenantId: string): Promise<TenantEntity> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });
    if (!tenant) {
      this.logger.warn(`Tenant con ID ${tenantId} no encontrado`);
      throw new NotFoundException(`Tenant con ID ${tenantId} no encontrado`);
    }
    return tenant;
  }

  private mapToResponseDto(
    productPassport: ProductPassportEntity,
  ): ProductPassportResponseDto {
    return {
      id: productPassport.id,
      name: productPassport.name,
      sku: productPassport.sku,
      description: productPassport.description,
      tenantId: productPassport.tenantId,
      status: productPassport.status.code,
      createdAt: productPassport.createdAt,
      updatedAt: productPassport.updatedAt,
    };
  }
}
