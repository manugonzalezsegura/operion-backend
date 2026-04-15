//operion-backend\src\roles\roles.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Repository } from 'typeorm';
import { RoleEntity } from './role.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectRepository(RoleEntity)
    private readonly rolesRepository: Repository<RoleEntity>,
  ) {}

  async createRole(createRoleDto: CreateRoleDto): Promise<RoleEntity> {
    this.logger.log(`Creando rol con nombre: ${createRoleDto.name}`);

    const role = this.rolesRepository.create({
      name: createRoleDto.name,
      description: createRoleDto.description,
    });
    const savedRole = await this.rolesRepository.save(role);
    this.logger.log(`Rol creado con id: ${savedRole.id}`);
    return savedRole;
  }

  async getRoles(): Promise<RoleEntity[]> {
    this.logger.log('Obteniendo todos los roles');

    const roles = await this.rolesRepository.find({
      order: { id: 'ASC' },
    });
    this.logger.log(`Fetched ${roles.length} roles`);
    return roles;
  }

  async getRoleById(id: number): Promise<RoleEntity> {
    this.logger.log(`Obteniendo rol con id: ${id}`);
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Rol con id ${id} no encontrado`);
    }
    this.logger.log(`Rol con id ${id} obtenido`);
    return role;
  }

  async updateRole(
    id: number,
    updateRoleDto: UpdateRoleDto,
  ): Promise<RoleEntity> {
    this.logger.log(`Actualizando role con id: ${id}`);
    const role = await this.getRoleById(id);

    Object.assign(role, updateRoleDto);

    const updateRole = await this.rolesRepository.save(role);
    this.logger.log(`Rol con id ${id} actualizado`);
    return updateRole;
  }

  async deleteRole(id: number): Promise<{ message: string }> {
    this.logger.log(`Intentando eliminar rol con id: ${id}`);
    const role = await this.getRoleById(id);
    await this.rolesRepository.remove(role);

    this.logger.log(`Rol con id ${id} encontrado`);
    return { message: `Rol con id ${id} eliminado exitosamente` };
  }
}
