import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { TenantEntity } from '../tenants/tenant.entity';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    this.logger.log(`Creando usuario con email: ${createUserDto.email}`);
    const tenant = await this.tenantRepository.findOne({
      where: { id: createUserDto.tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(
        `Tenant con id ${createUserDto.tenantId} no encontrado`,
      );
    }
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.usersRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      passwordHash,
      tenant,
      tenantId: tenant.id,
    });
    const savedUser = await this.usersRepository.save(newUser);
    this.logger.log(`Usuario creado con id: ${savedUser.id}`);
    return this.mapToResponseDto(savedUser);
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    this.logger.log('Obteniendo todos los usuarios');
    const users = await this.usersRepository.find({
      order: { id: 'ASC' },
    });
    this.logger.log(`Encontrados ${users.length} usuarios`);
    return users.map((user) => this.mapToResponseDto(user));
  }

  async getUserById(id: number): Promise<UserResponseDto> {
    this.logger.log(`Obteniendo usuario con id: ${id}`);
    const user = await this.findUserEntityById(id);
    this.logger.log(`Usuario con id ${id} encontrado`);
    return this.mapToResponseDto(user);
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    this.logger.log(`Intentando eliminar usuario con id: ${id}`);
    const user = await this.findUserEntityById(id);
    await this.usersRepository.remove(user);
    this.logger.log(`Usuario con id ${id} eliminado`);
    return { message: `Usuario con id ${id} ha sido eliminado` };
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    this.logger.log(`Actualizando usuario con id: ${id}`);
    const user = await this.findUserEntityById(id);

    Object.assign(user, updateUserDto);
    const updateUser = await this.usersRepository.save(user);
    this.logger.log(`Usuario con id ${id} actualizado`);
    return this.mapToResponseDto(updateUser);
  }

  async getUsersByTenantId(tenantId: string): Promise<UserResponseDto[]> {
    this.logger.log(`Obteniendo usuarios para tenant con id: ${tenantId}`);
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });
    if (!tenant) {
      this.logger.warn(`Tenant con id ${tenantId} no encontrado`);
      throw new NotFoundException(`Tenant con id ${tenantId} no encontrado`);
    }

    const users = await this.usersRepository.find({
      where: { tenantId },
      order: { id: 'ASC' },
    });
    this.logger.log(
      `Encontrados ${users.length} usuarios para el tenant con id: ${tenantId}`,
    );
    return users.map((user) => this.mapToResponseDto(user));
  }
  private mapToResponseDto(user: UserEntity): UserResponseDto {
    const userResponseDto = new UserResponseDto();
    userResponseDto.id = user.id;
    userResponseDto.name = user.name;
    userResponseDto.email = user.email;
    userResponseDto.tenantId = user.tenantId;
    return userResponseDto;
  }
  private async findUserEntityById(id: number): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return user;
  }

  async findUserEntityByEmail(email: string): Promise<UserEntity | null> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findOptionalUserEntityById(id: number): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findOptionalUserEntityByIdAndTenantId(
    id: number,
    tenantId: string,
  ): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { id, tenantId } });
  }

  async getUserByIdAndTenantId(
    id: number,
    tenantId: string,
  ): Promise<UserResponseDto> {
    const user = await this.findUserEntityByIdAndTenantId(id, tenantId);

    return this.mapToResponseDto(user);
  }

  private async findUserEntityByIdAndTenantId(
    id: number,
    tenantId: string,
  ): Promise<UserEntity> {
    const user = await this.findOptionalUserEntityByIdAndTenantId(id, tenantId);
    if (!user) {
      throw new NotFoundException(
        `Usuario con id ${id} y tenantId ${tenantId} no encontrado`,
      );
    }
    return user;
  }
  async updateUserByIdAndTenantId(
    id: number,
    tenantId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.findUserEntityByIdAndTenantId(id, tenantId);
    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);
    return this.mapToResponseDto(updatedUser);
  }

  async deleteUserByIdAndTenantId(
    id: number,
    tenantId: string,
  ): Promise<{ message: string }> {
    const user = await this.findUserEntityByIdAndTenantId(id, tenantId);
    await this.usersRepository.remove(user);
    return {
      message: `Usuario con id ${id} y tenantId ${tenantId} ha sido eliminado`,
    };
  }
}
