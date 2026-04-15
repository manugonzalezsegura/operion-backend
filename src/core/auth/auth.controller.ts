import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedUserResponseDto } from './dto/authenticated-user-response.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './interface/authenticated-user.interface';
import { LoginResponseDto } from './dto/login-response.dto';
import { Public } from './decorators/public.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('login')
  signIn(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.signIn(loginDto);
  }
  @Public()
  @Post('refresh')
  refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<LoginResponseDto> {
    return this.authService.refreshAccessToken(refreshTokenDto);
  }

  @Get('profile')
  getProfile(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): AuthenticatedUserResponseDto {
    return {
      userId: currentUser.userId,
      email: currentUser.email,
      tenantId: currentUser.tenantId,
    };
  }
}
