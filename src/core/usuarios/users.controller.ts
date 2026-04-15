import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentTenantId } from '../auth/decorators/current-tenant-id.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreateAuthenticatedUserDto } from './dto/create-authenticated-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAllUsers(): Promise<UserResponseDto[]> {
    return this.usersService.getAllUsers();
  }

  @Post()
  createUser(
    @Body() createAuthenticatedUserDto: CreateAuthenticatedUserDto,
    @CurrentTenantId() tenantId: string,
  ): Promise<UserResponseDto> {
    const createUserDto: CreateUserDto = {
      ...createAuthenticatedUserDto,
      tenantId,
    };
    return this.usersService.createUser(createUserDto);
  }

  @Get('tenant/:tenantId')
  getUsersByTenantId(
    @Param('tenantId') tenantId: string,
  ): Promise<UserResponseDto[]> {
    return this.usersService.getUsersByTenantId(tenantId);
  }

  @Get('my-tenant')
  getUsersByCurrentTenant(
    @CurrentTenantId() tenantId: string,
  ): Promise<UserResponseDto[]> {
    return this.usersService.getUsersByTenantId(tenantId);
  }

  @Get(':id')
  getUserById(
    @Param('id', ParseIntPipe)
    id: number,
    @CurrentTenantId() tenantId: string,
  ): Promise<UserResponseDto> {
    return this.usersService.getUserByIdAndTenantId(id, tenantId);
  }

  @Delete(':id')
  deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentTenantId() tenantId: string,
  ) {
    return this.usersService.deleteUserByIdAndTenantId(id, tenantId);
  }

  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentTenantId() tenantId: string,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUserByIdAndTenantId(
      id,
      tenantId,
      updateUserDto,
    );
  }

  @Public()
  @Post('bootstrap')
  createBootstrapUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.createUser(createUserDto);
  }
}
