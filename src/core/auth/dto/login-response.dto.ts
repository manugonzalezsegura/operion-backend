import { UserResponseDto } from '../../usuarios/dto/user-response.dto';

export class LoginResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: UserResponseDto;
}
