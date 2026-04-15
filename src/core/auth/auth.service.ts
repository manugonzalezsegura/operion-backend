import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../usuarios/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/login-response.dto';
import type { UserEntity } from '../usuarios/user.entity';
import type { JwtPayload } from './interface/jwt-payload.interface';
import type { ConfigType } from '@nestjs/config';
import { authConfig } from './config/auth.config';
import { RefreshTokenDto } from './dto/refresh-token.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
  ) {}

  async signIn(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;
    const user = await this.usersService.findUserEntityByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const payload = this.buildJwtPayload(user);
    const accessToken = await this.signAccessToken(payload);
    const refreshToken = await this.signRefreshToken(payload);

    return this.buildLoginResponseDto(user, accessToken, refreshToken);
  }

  private buildJwtPayload(user: UserEntity): JwtPayload {
    return {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
    };
  }

  private async signAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  private async signRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.authConfiguration.refreshToken.secret,
      expiresIn: this.authConfiguration.refreshToken.expiresIn,
    });
  }

  private async validateRefreshToken(
    refreshToken: string,
  ): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.authConfiguration.refreshToken.secret,
      });
    } catch {
      throw new UnauthorizedException('Token de refresco inválido');
    }
  }

  async refreshAccessToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<LoginResponseDto> {
    const payload = await this.validateRefreshToken(
      refreshTokenDto.refreshToken,
    );
    const user = await this.usersService.findUserEntityByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('Token invalido');
    }
    const newPayload = this.buildJwtPayload(user);
    const newAccessToken = await this.signAccessToken(newPayload);
    const newRefreshToken = await this.signRefreshToken(newPayload);
    return this.buildLoginResponseDto(user, newAccessToken, newRefreshToken);
  }

  private buildLoginResponseDto(
    user: UserEntity,
    accessToken: string,
    refreshToken: string,
  ): LoginResponseDto {
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tenantId: user.tenantId,
      },
    };
  }
}
