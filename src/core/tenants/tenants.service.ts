import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity } from './tenant.entity';
@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,
  ) {}

  async createTenant(createTenantDto: CreateTenantDto): Promise<TenantEntity> {
    this.logger.log(`Creando tenant: ${createTenantDto.name}`);

    const newTenant = this.tenantRepository.create({
      name: createTenantDto.name,
    });
    const savedTenant = await this.tenantRepository.save(newTenant);
    this.logger.log(`Tenant creado con id: ${savedTenant.id}`);
    return savedTenant;
  }

  async getAllTenants(): Promise<TenantEntity[]> {
    const tenants = await this.tenantRepository.find({
      order: { id: 'ASC' },
    });
    this.logger.log(`Encontrados ${tenants.length} tenants`);
    return tenants;
  }

  async getTenantById(id: string): Promise<TenantEntity> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant con id ${id} no encontrado`);
    }
    this.logger.log(`Tenant con id ${id} encontrado`);
    return tenant;
  }
}
