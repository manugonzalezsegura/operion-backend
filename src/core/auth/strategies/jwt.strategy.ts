import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { ConfigType } from '@nestjs/config';

import { UsersService } from '../../usuarios/users.service';
import type { JwtPayload } from '../interface/jwt-payload.interface';
import type { AuthenticatedUser } from '../interface/authenticated-user.interface';

import { authConfig } from '../config/auth.config';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfiguration.accessToken.secret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.usersService.findOptionalUserEntityById(
      payload.sub,
    );

    if (!user) {
      throw new UnauthorizedException('Token inválido');
    }
    return {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
    };
  }
}
